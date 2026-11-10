const API_BASE = 'https://dummyjson.com/products';
const PAGE_SIZE = 12;

async function readProducts(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
  const payload = await response.json();
  return {
    products: Array.isArray(payload.products) ? payload.products : [],
    total: Number(payload.total) || 0,
  };
}

export async function getProducts({ skip = 0, limit = PAGE_SIZE, query = '', category = '', signal } = {}) {
  const normalizedQuery = query.trim();
  const encodedCategory = encodeURIComponent(category);

  if (normalizedQuery && category) {
    const { products } = await readProducts(`${API_BASE}/category/${encodedCategory}?limit=0`, signal);
    const matchingProducts = products.filter((product) =>
      `${product.title} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(normalizedQuery.toLowerCase()),
    );
    return {
      products: matchingProducts.slice(skip, skip + limit),
      total: matchingProducts.length,
    };
  }

  let url = API_BASE;
  if (category) url += `/category/${encodedCategory}`;
  else if (normalizedQuery) url += '/search';

  const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
  if (normalizedQuery && !category) params.set('q', normalizedQuery);
  return readProducts(`${url}?${params.toString()}`, signal);
}

export async function getProduct(productId, signal) {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(productId)}`, { signal });
  if (!response.ok) throw new Error(`Product request failed (${response.status}).`);
  return response.json();
}

export async function getCategories(signal) {
  const response = await fetch(`${API_BASE}/category-list`, { signal });
  if (!response.ok) throw new Error(`Category request failed (${response.status}).`);
  const categories = await response.json();
  return Array.isArray(categories) ? categories : [];
}

export { PAGE_SIZE };