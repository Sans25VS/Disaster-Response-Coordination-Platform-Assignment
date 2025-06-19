import { fetchFemaUpdates } from '../services/browseService.js';
import { getCache, setCache } from '../models/cacheModel.js';

export async function officialUpdatesHandler(req, res) {
  const cacheKey = 'official-updates:fema';
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const updates = await fetchFemaUpdates();
  await setCache(cacheKey, updates);
  res.json(updates);
} 