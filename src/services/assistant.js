import { getFirebaseIdToken } from './firebase';

const assistantUrl = process.env.EXPO_PUBLIC_GEMINI_PROXY_URL;

export function isAssistantConfigured() {
  return Boolean(assistantUrl);
}

export async function askCatalogAssistant({ intent, products }) {
  if (!assistantUrl) {
    throw new Error('AI is not configured. Add a secure Gemini proxy URL to the local environment.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const token = await getFirebaseIdToken();
    const response = await fetch(assistantUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      signal: controller.signal,
      body: JSON.stringify({
        intent,
        catalog: products.map(({ id, title, description, category, price, rating }) => ({
          id,
          title,
          description,
          category,
          price,
          rating,
        })),
      }),
    });
    if (!response.ok) throw new Error(`AI service failed (${response.status}).`);

    const payload = await response.json();
    if (!Array.isArray(payload.productIds) || typeof payload.summary !== 'string') {
      throw new Error('AI response did not match the expected format.');
    }

    const catalogById = new Map(products.map((product) => [String(product.id), product]));
    const matched = [...new Set(payload.productIds.map(String))]
      .map((id) => catalogById.get(id))
      .filter(Boolean)
      .slice(0, 3);

    if (!matched.length) throw new Error('AI returned no products from this catalog.');
    return { summary: payload.summary.slice(0, 400), products: matched };
  } finally {
    clearTimeout(timeout);
  }
}