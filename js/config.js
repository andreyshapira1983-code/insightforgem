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

// Although the front‑end no longer needs the API key directly (the
// serverless function will use the OPEN_API_KEY environment
// variable), we leave this property defined so that build tools or
// scripts can inject a value if necessary.  It should remain
// undefined or empty for Netlify deployments.
window.OPEN_API_KEY = '';