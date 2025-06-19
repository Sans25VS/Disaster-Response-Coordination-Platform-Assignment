import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
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
const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: '*' } });

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
  io.emit('disaster_updated', disaster);
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
  io.emit('disaster_updated', disasters[idx]);
  res.json(disasters[idx]);
});

app.delete('/disasters/:id', (req, res) => {
  const { id } = req.params;
  const idx = disasters.findIndex(d => d.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = disasters.splice(idx, 1)[0];
  io.emit('disaster_updated', removed);
  res.json({ success: true });
});

// --- Social Media (mock) ---
app.get('/disasters/:id/social-media', (req, res) => {
  // TODO: Add Supabase cache logic
  // Mock: return 2 fake tweets
  res.json([
    { id: 1, content: 'Flood in city center!', user: 'user1', createdAt: new Date() },
    { id: 2, content: 'Stay safe everyone!', user: 'user2', createdAt: new Date() }
  ]);
  io.emit('social_media_updated', { disasterId: req.params.id });
});

// --- Resources (mock geospatial) ---
app.get('/disasters/:id/resources', (req, res) => {
  // TODO: Add Supabase/PostGIS geospatial query logic
  // Mock: return all resources
  res.json(resources);
  io.emit('resources_updated', { disasterId: req.params.id });
});

// --- Official Updates (mock) ---
app.get('/disasters/:id/official-updates', (req, res) => {
  // TODO: Add Browse Page data + Supabase cache
  res.json([
    { id: 1, title: 'Official Update 1', content: 'Evacuation in progress', createdAt: new Date() }
  ]);
});

// --- Verification (mock Gemini API) ---
app.post('/disasters/:id/verify-image', (req, res) => {
  // TODO: Call Gemini API, cache with Supabase
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

// --- Reports CRUD (for testing) ---
app.post('/reports', (req, res) => {
  const { content, imageUrl } = req.body;
  const report = { id: nextReportId++, content, imageUrl };
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

// --- Logging actions ---
function logAction(msg) {
  console.log(`[ACTION] ${msg}`);
}

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Node.js backend running on port ${PORT}`);
}); 