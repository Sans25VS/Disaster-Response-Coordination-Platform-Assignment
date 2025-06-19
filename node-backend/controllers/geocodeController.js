import { getCache, setCache } from '../models/cacheModel.js';
import { geocodeLocation } from '../services/geocodeService.js';

export async function geocodeHandler(req, res) {
  const { location_name } = req.body;
  const cacheKey = `geocode:${location_name}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const geoData = await geocodeLocation(location_name, apiKey);
  await setCache(cacheKey, geoData);
  res.json(geoData);
} 