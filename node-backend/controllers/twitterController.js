import { searchTweets } from '../services/twitterService.js';

export async function searchTweetsHandler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ data: [], error: 'Missing query' });
  try {
    const data = await searchTweets(q);
    // Normalize: always return { data: [...] }
    if (Array.isArray(data)) {
      res.json({ data });
    } else if (data && data.data) {
      res.json({ data: data.data });
    } else {
      res.json({ data: [] });
    }
  } catch (err) {
    res.status(200).json({
      data: [
        { text: 'Mock tweet: Twitter API error or quota reached.' }
      ],
      error: err.message
    });
  }
} 