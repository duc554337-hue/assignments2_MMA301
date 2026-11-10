const { GoogleGenAI } = require('@google/genai');
const { getAuth } = require('firebase-admin/auth');
const { initializeApp } = require('firebase-admin/app');
const { defineSecret } = require('firebase-functions/params');
const { onRequest } = require('firebase-functions/v2/https');

initializeApp();

const geminiApiKey = defineSecret('GEMINI_API_KEY');

exports.catalogAssistant = onRequest(
  { region: 'us-central1', cors: true, secrets: [geminiApiKey] },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed.' });
      return;
    }

    const token = request.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) {
      response.status(401).json({ error: 'A Firebase ID token is required.' });
      return;
    }

    try {
      await getAuth().verifyIdToken(token);
    } catch {
      response.status(401).json({ error: 'The Firebase ID token is invalid.' });
      return;
    }

    const intent = typeof request.body?.intent === 'string' ? request.body.intent.trim().slice(0, 180) : '';
    const catalog = Array.isArray(request.body?.catalog) ? request.body.catalog : [];
    const products = catalog
      .filter((item) => item && (typeof item.id === 'string' || typeof item.id === 'number') && typeof item.title === 'string')
      .slice(0, 40)
      .map((item) => ({
        id: String(item.id),
        title: item.title.slice(0, 100),
        description: typeof item.description === 'string' ? item.description.slice(0, 240) : '',
        category: typeof item.category === 'string' ? item.category.slice(0, 60) : '',
        price: Number.isFinite(item.price) ? item.price : null,
        rating: Number.isFinite(item.rating) ? item.rating : null,
      }));

    if (!intent || products.length === 0) {
      response.status(400).json({ error: 'A request and non-empty catalog are required.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const result = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        store: false,
        input: [
          'You are a shopping assistant. Use only the product IDs and facts below.',
          'Recommend or compare products for the stated need. Never invent a product or ID.',
          'Return a short useful summary and one to three matching product IDs.',
          `Request: ${intent}`,
          `Catalog JSON: ${JSON.stringify(products)}`,
        ].join('\n\n'),
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              productIds: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
            },
            required: ['summary', 'productIds'],
            additionalProperties: false,
          },
        },
      });

      const generated = JSON.parse(result.output_text || '{}');
      const availableIds = new Set(products.map((product) => product.id));
      const productIds = Array.isArray(generated.productIds)
        ? [...new Set(generated.productIds.map(String).filter((id) => availableIds.has(id)))].slice(0, 3)
        : [];
      const summary = typeof generated.summary === 'string' ? generated.summary.trim().slice(0, 400) : '';

      if (!summary || !productIds.length) {
        response.status(502).json({ error: 'The model did not return a valid catalog match.' });
        return;
      }

      response.json({ summary, productIds });
    } catch (error) {
      console.error('catalogAssistant failed', error.message);
      response.status(502).json({ error: 'The catalog assistant is temporarily unavailable.' });
    }
  },
);