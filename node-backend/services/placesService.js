import fetch from 'node-fetch';
 
export async function fetchNearbyHospitals(lat, lng, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${apiKey}`;
  const response = await fetch(url);
  return response.json();
} 