// Netlify Function: /.netlify/functions/stats
//
// Provides simple platform statistics for the Star Galaxy home
// page.  In a fully integrated system this function would query a
// database or analytics provider to return the number of saved
// ideas, the count of users currently online, and details of the
// idea of the day.  For this MVP, static values are returned.  You
// can adjust these numbers or add randomisation if desired.

import { preflight, json } from './utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  const stats = {
    ideas_total: 42,
    users_online: 7,
    idea_of_the_day: 'Solar Powered Delivery Drones'
  };
  return json(200, stats);
}