import { corsHeaders, preflight } from './utils.js';

export async function handler(event) {
  const pre = preflight(event, 'GET,OPTIONS');
  if (pre) return pre;

  const stats = {
    ideas_total: 42,
    users_online: 7,
    idea_of_the_day: 'Solar Powered Delivery Drones'
  };

  return {
    statusCode: 200,
    headers: corsHeaders(event, 'GET,OPTIONS'),
    body: JSON.stringify(stats)
  };
}
