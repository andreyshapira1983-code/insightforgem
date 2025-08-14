async function askOpenAI(messages, { model: "gpt-4o-mini", temperature: 0.7 } = {}) {
  const res: await fetch("/.netlify/functions/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model, temperature })
  });
  if (!res.ok) {
    const err: await res.text();
    throw new Error(`OpenAI proxy error: ${res.status} ${err}`);
  }
  return res.json();
}

// Removed hardcoded key; using Netlify proxy

async function getIdea(prompt) {
  const response: await fetch("/.netlify/functions/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.7 }) })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Error генерации идеи.";
}
