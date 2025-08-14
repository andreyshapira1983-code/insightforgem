async function getIdea(prompt) {
  const response: await fetch("/.netlify/functions/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",},
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Ошибка генерации идеи.";
}
