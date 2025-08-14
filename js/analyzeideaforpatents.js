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

async function analyzeIdeaForPatents(idea) {
  const apiKey = localStorage.getItem('openai_api_key'); // ключ берём из localStorage
  const apiUrl = '/.netlify/functions/openai';

  const headers = {
    'Content-Type': 'application/json'};

  const data = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a patent expert. Help assess whether the idea is patentable.'
      },
      {
        role: 'user',
        content: `Analyze the following idea for patentability:\n${idea}`
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(data) });
    const result = await response.json();
    return result.choices?.[0]?.message?.content ?? 'Нет ответа от модели.';
  } catch (error) {
    console.error('Error при анализе идеи на патенты:', error);
    return 'Произошла ошибка при анализе идеи.';
  }
}

window.analyzeIdeaForPatents = analyzeIdeaForPatents;
