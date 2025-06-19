import fetch from 'node-fetch';

export async function geocodeLocation(locationName, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`;
  const response = await fetch(url);
  return response.json();
} 