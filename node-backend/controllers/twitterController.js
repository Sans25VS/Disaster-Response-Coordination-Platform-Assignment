import { searchTweets } from '../services/twitterService.js';

export async function searchTweetsHandler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const data = await searchTweets(q);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 