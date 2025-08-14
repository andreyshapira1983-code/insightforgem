import { corsHeaders, preflight } from './utils.js';

export async function handler(event) {
  const pre = preflight(event, 'GET,OPTIONS');
  if (pre) return pre;

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

  return {
    statusCode: 200,
    headers: corsHeaders(event, 'GET,OPTIONS'),
    body: JSON.stringify(items)
  };
}
