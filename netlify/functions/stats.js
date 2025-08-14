// Netlify Function: /.netlify/functions/stats
//
// Provides simple platform statistics for the Star Galaxy home
// page.  In a fully integrated system this function would query a
// database or analytics provider to return the number of saved
// ideas, the count of users currently online, and details of the
// idea of the day.  For this MVP, static values are returned.  You
// can adjust these numbers or add randomisation if desired.

const ORIGIN = process.env.ALLOWED_ORIGIN || 'https://insightforgem.netlify.app';
const baseHeaders = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handler() {
  const stats = {
    ideas_total: 42,
    users_online: 7,
    idea_of_the_day: 'Solar Powered Delivery Drones',
  };
  return {
    statusCode: 200,
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  };
}
