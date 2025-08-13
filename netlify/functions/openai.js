// Netlify Function: /.netlify/functions/openai
//
// This function acts as a simple proxy to the OpenAI Chat Completion API.
// It expects a JSON payload containing at least a `messages` array. You can
// optionally specify a `model` and `temperature` in the request body. These
// values default to `gpt-4o-mini` and `0.7` respectively.
//
// The OpenAI API key is pulled from the environment variable
// `OPENAI_API_KEY` configured in your Netlify dashboard. Never embed
// secret keys in client‑side code or commit them to source control.

export async function handler(event) {
  // Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const messages = Array.isArray(payload.messages) ? payload.messages : [];
    const model = payload.model || "gpt-4o-mini";
    // Default temperature if provided value is undefined
    const temperature = typeof payload.temperature === "number" ? payload.temperature : 0.7;

    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model, messages, temperature })
    });

    const data = await response.json();
    return {
      statusCode: response.ok ? 200 : response.status,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
}
