const openaiApiKey = "вставь_сюда_твой_API_ключ";

async function getIdea(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${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}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Ошибка генерации идеи.";
}
