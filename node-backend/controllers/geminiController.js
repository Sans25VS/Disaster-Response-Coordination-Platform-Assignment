import { getCache, setCache } from '../models/cacheModel.js';
import { extractLocation, verifyImage } from '../services/geminiService.js';

export async function extractLocationHandler(req, res) {
  const { description } = req.body;
  const cacheKey = `gemini:location:${description}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const apiKey = process.env.GEMINI_API_KEY;
  const geminiData = await extractLocation(description, apiKey);
  await setCache(cacheKey, geminiData);
  res.json(geminiData);
}

export async function verifyImageHandler(req, res) {
  const { image_url } = req.body;
  const cacheKey = `gemini:image:${image_url}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const apiKey = process.env.GEMINI_API_KEY;
  const geminiData = await verifyImage(image_url, apiKey);
  await setCache(cacheKey, geminiData);
  res.json(geminiData);
} 