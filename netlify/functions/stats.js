// Netlify Function: stats
// Returns placeholder statistics to avoid 404s on home page.
export async function handler() {
  const stats = { users: 0, ideas: 0, saved: 0 };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stats)
  };
}
