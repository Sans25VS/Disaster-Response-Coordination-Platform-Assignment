import { fetchNearbyHospitals } from '../services/placesService.js';

export async function getNearbyHospitalsHandler(req, res) {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const data = await fetchNearbyHospitals(lat, lng, apiKey);
  res.json(data);
} 