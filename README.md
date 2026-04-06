# 🎓 Haziri — Geofenced Attendance System

> **Haziri** (حاضری) — meaning "Attendance" in Urdu — is a GPS-verified, real-time attendance tracking system for educational institutions.

## ✨ Features

- **GPS Geofencing** — Students must be within 50m of the classroom to mark attendance
- **Device Fingerprinting** — Prevents proxy attendance (one device per student per session)
- **Real-time Monitoring** — Teachers see attendance appear live with 10s auto-refresh
- **Role-Based Dashboards** — Separate interfaces for teachers and students
- **Attendance Reports** — Auto-generated analytics with per-course breakdowns

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 8 · TailwindCSS 3 · TypeScript |
| Backend | Node.js · Express 5 · TypeScript |
| Database | PostgreSQL |
| Auth | JWT · bcrypt |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Setup Database
```bash
psql -d your_database -f server/src/db/schema.sql
```

### 2. Configure Environment

**server/.env**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/haziri
JWT_SECRET=your-secret-key
```

**client/.env**
```
VITE_API_URL=http://localhost:3001/api
```

### 3. Install & Run
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start both servers (from project root)
cd ..
npm install        # installs concurrently
npm run dev        # starts both frontend + backend
```

Or start separately in two terminals:
```bash
# Terminal 1 — Backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

## 📂 Project Structure

```
haziri/
├── client/                 # React SPA (Vite + TailwindCSS)
│   └── src/
│       ├── pages/          # Teacher & Student pages
│       ├── layouts/        # Role-based layouts with sidebars
│       ├── contexts/       # Auth state management
│       ├── hooks/          # useGeoLocation, useDeviceFingerprint
│       └── api.ts          # HTTP client
├── server/                 # Express REST API
│   └── src/
│       ├── routes/         # auth, courses, sessions, attendance
│       ├── middleware/      # JWT auth + role guard
│       └── db/             # PostgreSQL pool + schema
└── package.json            # Root — runs both with concurrently
```
