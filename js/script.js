async function askOpenAI(messages, { model = "gpt-4o-mini", temperature = 0.7 } = {}) {
  const res = await fetch("/.netlify/functions/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model, temperature })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI proxy error: ${res.status} ${err}`);
  }
  return res.json();
}

// Removed hardcoded key; using Netlify proxy

async function getIdea(prompt) {
  const response = await askOpenAI([
    { role: "user", content: prompt }
  ], { model: "gpt-4o-mini", temperature: 0.7 });
  return response.choices?.[0]?.message?.content || "Error генерации идеи.";
}
