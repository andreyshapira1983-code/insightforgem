// Netlify Function: /.netlify/functions/search
//
// This serverless function acts as a proxy between the front‑end and a
// remote search API.  By running server‑side on Netlify, it can
// safely access secret API keys stored as environment variables
// (`process.env.OPEN_API_KEY`) without exposing them to the client.
//
// The client should call this function via the endpoint
// `/.netlify/functions/search?query=<text>`.  The function
// forwards the request to the configured search provider, attaches
// the API key and returns results in a normalized format.

import { preflight, json } from './utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;

  // Only support GET requests
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const params = event.queryStringParameters || {};
  const query = (params.query || '').trim();
  if (!query) {
    return json(400, { error: 'Missing query parameter' });
  }

  // Fetch remote search results.  The endpoint and API key can be
  // configured via environment variables.  If not provided, the
  // function returns an empty result set.
  const endpoint = process.env.SEARCH_API_URL;
  const apiKey = process.env.OPEN_API_KEY;
  if (!endpoint || !apiKey) {
    return json(200, { results: [] });
  }

  try {
    const url = `${endpoint}?query=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`;
    // Use native fetch if available (Node 18+) or fall back to dynamic
    // import of node-fetch.  This avoids bundling dependencies if
    // unnecessary.
    let fetchFn;
    if (typeof fetch === 'function') {
      fetchFn = fetch;
    } else {
      const nodeFetch = await import('node-fetch');
      fetchFn = nodeFetch.default;
    }
    const response = await fetchFn(url);
    if (!response.ok) {
      throw new Error(`Search API responded with status ${response.status}`);
    }
    const data = await response.json();
    // Normalize output to { results: [ { title, description, link } ] }
    const results = Array.isArray(data.results)
      ? data.results.map(item => ({
          title: item.title || '',
          description: item.description || '',
          link: item.link || '#'
        }))
      : [];
    return json(200, { results });
  } catch (err) {
    return json(500, { error: err.message });
  }
}