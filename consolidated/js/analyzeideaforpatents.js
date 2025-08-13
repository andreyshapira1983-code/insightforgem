async function analyzeIdeaForPatents(idea) {
  const openaiApiKey = localStorage.getItem('openai_api_key'); // ключ берём из localStorage
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${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}`
  };

  const data = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Ты эксперт по патентам. Помоги определить, может ли данная идея быть запатентована.'
      },
      {
        role: 'user',
        content: `Проанализируй следующую идею с точки зрения патентоспособности:\n${idea}`
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(data) });
    const result = await response.json();
    return result.choices?.[0]?.message?.content ?? 'Нет ответа от модели.';
  } catch (error) {
    console.error('Ошибка при анализе идеи на патенты:', error);
    return 'Произошла ошибка при анализе идеи.';
  }
}

window.analyzeIdeaForPatents = analyzeIdeaForPatents;
