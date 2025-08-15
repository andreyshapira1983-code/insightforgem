// config.js
//
// This file defines global configuration values for the Star Galaxy
// website.  By declaring properties on the global `window` object, the
// rest of the front‑end code can reference API keys and endpoints
// without hard coding secrets into the source.  When deploying the
// site in a real environment, you should replace the placeholder
// values below with your own credentials and URLs.  For local
// development or offline use, you can leave these as empty strings.

// Base URL for the remote search service.  This endpoint should
// accept a `query` parameter and return JSON in the format:
// { results: [ { title: string, description: string, link: string } ] }
// Replace this with the address of your chosen search API provider.
// When running on Netlify, calls to our remote search should go
// through a serverless function.  This prevents our API key from
// ever reaching the browser.  During local development you can
// override this endpoint by setting a different value in a
// custom configuration or `.env` file.
window.SEARCH_API_ENDPOINT = '/.netlify/functions/search';

// The API key for the external search provider is never exposed in the
// browser.  The Netlify serverless function referenced above reads the
// necessary credentials from environment variables and performs the
// authenticated request on behalf of the client.

