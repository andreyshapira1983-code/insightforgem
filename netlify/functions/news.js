// Netlify Function: news
// Returns placeholder news to avoid 404s on home page.
// You can later replace this with a real fetch from your CMS.
export async function handler() {
  const items = [
    { id: 1, title: "Welcome to Star Galaxy", url: "/resources.html" },
    { id: 2, title: "How to use the AI Generator", url: "/generator.html" }
  ];
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  };
}
