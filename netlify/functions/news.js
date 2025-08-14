// Netlify Function: /.netlify/functions/news
//
// Returns a list of recent news items for display on the home
// page.  In a production environment this function could fetch
// external RSS feeds based on the `NEWS_FEEDS` environment
// variable and parse them into JSON.  However, for the purposes of
// this MVP and in environments where external packages or network
// calls may not be available, we return a small static list of
// technology and business headlines.  The structure matches the
// expected output: an array of objects with `source`, `title`,
// `link` and `date` properties.

import { preflight, json } from './utils.js';

export async function handler(event) {
  const pf = preflight(event);
  if (pf) return pf;
  // Example static news items.  Replace or extend with dynamic
  // fetching logic in a real deployment.
  const items = [
    {
      source: 'TechCrunch',
      title: 'AI startup raises $10M to revolutionize health diagnostics',
      link: 'https://techcrunch.com',
      date: new Date().toISOString()
    },
    {
      source: 'BBC News',
      title: 'Renewable energy investments hit record highs in 2025',
      link: 'https://www.bbc.com/news',
      date: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      source: 'HackerNews',
      title: 'Open source collaboration tools trending among remote teams',
      link: 'https://news.ycombinator.com',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      source: 'Wired',
      title: 'The future of AI‑assisted creativity in design and art',
      link: 'https://www.wired.com',
      date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
      source: 'Forbes',
      title: 'How sustainable products are reshaping consumer markets',
      link: 'https://www.forbes.com',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
  return json(200, items);
}