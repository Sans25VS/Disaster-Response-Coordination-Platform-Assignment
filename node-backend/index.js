import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import geminiRoutes from './routes/geminiRoutes.js';
import geocodeRoutes from './routes/geocodeRoutes.js';
import socialMediaRoutes from './routes/socialMediaRoutes.js';
import twitterRoutes from './routes/twitterRoutes.js';
import browseRoutes from './routes/browseRoutes.js';
import * as cheerio from 'cheerio';
import placesRoutes from './routes/placesRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { username: 'netrunnerX', role: 'admin' }; // Change as needed
  next();
});

// --- In-memory mock data ---
let disasters = [];
let reports = [];
let resources = [];
let verifications = [];
let nextDisasterId = 1;
let nextReportId = 1;
let nextResourceId = 1;
let nextVerificationId = 1;

// --- Disasters CRUD ---
app.post('/disasters', (req, res) => {
  const { title, location, description, tags } = req.body;
  const disaster = { id: nextDisasterId++, title, location, description, tags, createdAt: new Date() };
  disasters.push(disaster);
  res.status(201).json(disaster);
});

app.get('/disasters', (req, res) => {
  const { tag } = req.query;
  if (tag) {
    return res.json(disasters.filter(d => d.tags && d.tags.includes(tag)));
  }
  res.json(disasters);
});

app.put('/disasters/:id', (req, res) => {
  const { id } = req.params;
  const idx = disasters.findIndex(d => d.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  disasters[idx] = { ...disasters[idx], ...req.body };
  res.json(disasters[idx]);
});

app.delete('/disasters/:id', (req, res) => {
  const { id } = req.params;
  const idx = disasters.findIndex(d => d.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  disasters.splice(idx, 1);
  res.json({ success: true });
});

// --- Social Media (mock) ---
app.get('/disasters/:id/social-media', (req, res) => {
  res.json([
    { id: 1, content: 'Flood in city center!', user: 'user1', createdAt: new Date() },
    { id: 2, content: 'Stay safe everyone!', user: 'user2', createdAt: new Date() }
  ]);
});

// --- Resources (mock geospatial) ---
app.get('/disasters/:id/resources', (req, res) => {
  res.json(resources);
});

// --- Official Updates (mock) ---
app.get('/disasters/:id/official-updates', (req, res) => {
  res.json([
    { id: 1, title: 'Official Update 1', content: 'Evacuation in progress', createdAt: new Date() }
  ]);
});

// --- Verification (mock Gemini API) ---
app.post('/disasters/:id/verify-image', (req, res) => {
  const verification = { id: nextVerificationId++, status: 'verified', targetType: 'image', targetId: req.body.imageUrl };
  verifications.push(verification);
  res.json(verification);
});

// --- Geocoding (mock Gemini + mapping service) ---
app.post('/geocode', async (req, res) => {
  const { location_name } = req.body;
  const cacheKey = `geocode:${location_name}`;
  // Check cache
  const { data: cacheData } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', cacheKey)
    .single();

  if (cacheData && new Date(cacheData.expires_at) > new Date()) {
    return res.json(cacheData.value);
  }

  // Call Google Maps Geocoding API
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location_name)}&key=${mapsApiKey}`;
  const geoRes = await fetch(url);
  const geoData = await geoRes.json();

  // Cache response
  await supabase.from('cache').upsert({
    key: cacheKey,
    value: geoData,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });

  res.json(geoData);
});

// --- Resources CRUD (for testing) ---
app.post('/resources', (req, res) => {
  const { name, type, description } = req.body;
  const resource = { id: nextResourceId++, name, type, description };
  resources.push(resource);
  res.status(201).json(resource);
});

// Helper: keyword-based priority classifier
function isPriorityReport(content) {
  if (!content) return false;
  const keywords = ['urgent', 'sos', 'emergency', 'help', 'immediate', 'critical', 'asap', 'rescue', 'danger'];
  const text = content.toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

// --- Reports CRUD (for testing) ---
app.post('/reports', (req, res) => {
  const { content, imageUrl } = req.body;
  const priority = isPriorityReport(content);
  const report = { id: nextReportId++, content, imageUrl, priority };
  reports.push(report);
  res.status(201).json(report);
});

app.get('/reports', (req, res) => {
  res.json(reports);
});

// --- Verifications GET (for testing) ---
app.get('/verifications', (req, res) => {
  res.json(verifications);
});

// --- Fetch real hospitals near a location using Google Places API ---
app.get('/resources/hospitals', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat/lng' });
  }
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not set' });
  }
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

app.use('/gemini', geminiRoutes);
app.use('/geocode', geocodeRoutes);
app.use('/', socialMediaRoutes);
app.use('/', twitterRoutes);
app.use('/', browseRoutes);
app.use('/', placesRoutes);

// Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Node.js backend running on port ${PORT}`);
  });
}

// Export for Vercel serverless
export default app; 