import { corsHeaders, preflight, selectApiKey } from './utils.js';

export async function handler(event) {
  const pre = preflight(event, 'GET,OPTIONS');
  if (pre) return pre;

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders(event), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const query = (params.query || '').trim();
  if (!query) {
    return {
      statusCode: 400,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: 'Missing query parameter' })
    };
  }

  const endpoint = process.env.SEARCH_API_URL;
  const apiKey = selectApiKey();
  if (!endpoint || !apiKey) {
    return {
      statusCode: 200,
      headers: corsHeaders(event),
      body: JSON.stringify({ results: [] })
    };
  }

  try {
    const url = `${endpoint}?query=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`;
    const fetchFn = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;
    const response = await fetchFn(url);
    if (!response.ok) {
      throw new Error(`Search API responded with status ${response.status}`);
    }
    const data = await response.json();
    const results = Array.isArray(data.results)
      ? data.results.map(item => ({
          title: item.title || '',
          description: item.description || '',
          link: item.link || '#'
        }))
      : [];
    return {
      statusCode: 200,
      headers: corsHeaders(event),
      body: JSON.stringify({ results })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(event),
      body: JSON.stringify({ error: err.message })
    };
  }
}
