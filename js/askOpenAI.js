// askOpenAI.js - Helper to call the Netlify proxy for OpenAI
//
// Usage:
//   const response = await askOpenAI([
//     { role: 'system', content: 'Your system instructions' },
//     { role: 'user', content: 'User prompt' }
//   ], { model: 'gpt-4o-mini', temperature: 0.7 });
//
// It returns the parsed JSON response from the OpenAI API via your Netlify function.

async function askOpenAI(messages, { model = 'gpt-4o-mini', temperature = 0.7 } = {}) {
  const res = await fetch('/.netlify/functions/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, temperature })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI proxy error: ${res.status} ${text}`);
  }
  return res.json();
}

// Expose to global scope
if (typeof window !== 'undefined') {
  window.askOpenAI = askOpenAI;
}
