# 🌪️ Disaster Response Coordination Platform

A **backend-heavy MERN stack** application that enables real-time disaster tracking, reporting, and response coordination using modern geospatial tools and AI.

---

## 🧭 Objective

Build a disaster response platform that:
- Aggregates real-time disaster data
- Uses **AI and geospatial queries** to locate and verify disasters
- Supports **real-time updates**, reporting, and resource mapping
- Leverages **Supabase** for database, caching, and spatial indexing
- Built fast using **Cursor** or **Windsurf**

---

## ✅ Features

### 1. Disaster Data Management
- CRUD APIs for disasters: title, description, tags (e.g. "flood", "earthquake")
- Track record ownership and maintain audit trail
- Tags + filters supported

### 2. Location Extraction & Geocoding
- 📍 Extract location names using **Google Gemini API**
- 📌 Convert to lat/lng using:
  - Google Maps API
  - Mapbox
  - OpenStreetMap (Nominatim)

### 3. Real-Time Social Media Monitoring
- Use **mock Twitter API** or **Bluesky**
- Track needs/offers/alerts via hashtags (e.g. `#floodrelief`)
- WebSocket update for new reports

### 4. Geospatial Resource Mapping
- Use **Supabase + PostGIS** to:
  - Map nearby shelters/resources using lat/lng
  - Run spatial queries (e.g. ST_DWithin within 10km)

### 5. Official Updates Aggregation
- Use **Browse Page** + Cheerio to fetch updates from:
  - FEMA, Red Cross, NDMA etc.
- Cache responses in Supabase (TTL: 1 hour)

### 6. Image Verification
- Upload disaster images for validation
- Use **Google Gemini API** to detect:
  - Manipulated content
  - Misleading or non-disaster context

### 7. Backend Optimization
- Supabase-backed cache layer (key, value, expires_at)
- Caching of:
  - Gemini results
  - Geocoding results
  - Social media and scraping results
- Structured logging (e.g. `"Report processed: Flood Alert"`)
- External API rate-limiting and retry logic

---

## 🧪 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/disasters` | Create a new disaster |
| GET    | `/disasters?tag=flood` | Get filtered disaster list |
| PUT    | `/disasters/:id` | Update disaster |
| DELETE | `/disasters/:id` | Delete disaster |
| GET    | `/disasters/:id/social-media` | Get related posts |
| GET    | `/disasters/:id/resources?lat=..&lon=..` | Find nearby resources |
| GET    | `/disasters/:id/official-updates` | Fetch from relief orgs |
| POST   | `/disasters/:id/verify-image` | Validate disaster image |
| POST   | `/geocode` | Gemini + Geocoding service |

---

## 🔧 Backend Tech Stack

- **Node.js + Express.js**
- **Socket.IO** for real-time updates
- **Supabase (PostgreSQL + PostGIS)** for storage, geospatial queries, caching
- **Cheerio** for web scraping
- **Google Gemini API** for AI location extraction and image analysis

---

## 🧠 AI Prompt Examples for Cursor/Windsurf

- `Generate a Node.js route for Gemini image verification`
- `Generate a Supabase geospatial query for resources within 10km`
- `Add caching logic using Supabase table with TTL`
- `Build a STOMP WebSocket event for disaster updates`

---

## 🖥️ Frontend (Minimal, React or HTML/JS)

- Form to create/update disasters
- Form to submit reports (text + image URL)
- Display:
  - Verified disasters
  - Resources nearby
  - Social media alerts
  - Image verification status
- Use **WebSocket** for live updates

---

## 🗃️ Database (Supabase/PostgreSQL)

### Tables:

#### `disasters`
- `id`, `title`, `location_name`, `location (GEOGRAPHY)`, `description`
- `tags TEXT[]`, `owner_id`, `created_at`, `audit_trail JSONB`

#### `reports`
- `id`, `disaster_id`, `user_id`, `content`, `image_url`, `verification_status`, `created_at`

#### `resources`
- `id`, `disaster_id`, `name`, `location_name`, `location (GEOGRAPHY)`, `type`, `created_at`

#### `cache`
- `key`, `value (JSONB)`, `expires_at`

### Indexes:
- GIST on `location`
- GIN on `tags`
- Index on `owner_id`

---

## 🛠️ Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🔐 Secrets / API Keys Required

- `GOOGLE_GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- Optional: `MAPBOX_API_KEY` or `GOOGLE_MAPS_KEY`

---

## ⏱️ Delivery Timeline
**Duration**: 1 day (8–10 hours)

---

### Built Fast with 🚀 **Cursor**, 🧠 **Windsurf**, and 🌍 **Geospatial AI**
