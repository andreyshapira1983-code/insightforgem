// Netlify Function: /.netlify/functions/stats
//
// Provides simple platform statistics for the Star Galaxy home
// page.  In a fully integrated system this function would query a
// database or analytics provider to return the number of saved
// ideas, the count of users currently online, and details of the
// idea of the day.  For this MVP, static values are returned.  You
// can adjust these numbers or add randomisation if desired.

export async function handler() {
  const stats = {
    ideas_total: 42,
    users_online: 7,
    idea_of_the_day: 'Solar Powered Delivery Drones'
  };
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(stats)
  };
}