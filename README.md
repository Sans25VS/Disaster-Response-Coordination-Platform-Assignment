# 🌐 Disaster Response Platform

A full-stack application built with **Spring Boot** (backend) and **React.js** (frontend), using **Supabase** for data storage and geospatial queries.

## ✅ Features

- 🌍 Create, update, and view disasters (with location, tags)
- 📡 Real-time WebSocket updates for disasters
- 🧠 Google Gemini API integration for:
  - 📌 Extracting location from description
  - 🖼️ Verifying disaster image authenticity
- 📍 Geospatial queries using Supabase/PostGIS
- 🐦 Social media reports (via mock API)
- 🏛️ Official updates scraper via JSoup
- 🧠 AI-first workflow using **Cursor**

## 🚀 Getting Started

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

## 🧩 Key Technologies

- Java 17, Spring Boot
- PostgreSQL (Supabase)
- WebSockets (STOMP)
- React.js (with hooks)
- Supabase JS SDK
- Google Gemini API (via REST)
- Mapbox/Google Maps Geocoding

## 🧠 Cursor Prompts You Can Use

- `Generate a Spring Boot controller for disaster creation`
- `Generate a query to find resources within 10km`
- `Add a WebSocket broadcast when a disaster is updated`
- `Generate a Gemini API client to extract location from text`

## 📁 Project Structure

```
disaster-response-spring-react/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/example/disaster/
├── frontend/
│   └── src/App.js
```

## 🔐 Note
- You must supply your own Gemini API Key and Supabase credentials.

---

Built fast using Cursor, Windsurf and 💡.
