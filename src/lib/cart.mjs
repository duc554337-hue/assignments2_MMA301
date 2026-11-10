export function addItem(items, product) {
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    return items.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
    );
  }

  return [...items, { ...product, quantity: 1 }];
}

export function updateQuantity(items, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 0) return items;
  if (quantity === 0) return items.filter((item) => item.id !== productId);
  return items.map((item) =>
    item.id === productId ? { ...item, quantity } : item,
  );
}

export function removeItem(items, productId) {
  return items.filter((item) => item.id !== productId);
}

export function getCartSummary(items) {
  return items.reduce(
    (summary, item) => ({
      itemCount: summary.itemCount + item.quantity,
      total: summary.total + item.price * item.quantity,
    }),
    { itemCount: 0, total: 0 },
  );
}