# 🎓 Haziri — Geofenced Attendance Management System

> **"Haziri"** (حاضری) — meaning "Attendance" in Urdu — is a location-verified, real-time attendance tracking system designed for educational institutions.

---

## 📌 Problem Statement

Traditional attendance systems suffer from:
- **Proxy attendance** — students marking for absent friends
- **No verification** — no way to prove a student was physically present
- **Manual paper-based tracking** — time-consuming and error-prone
- **No real-time visibility** — teachers can't see who's arriving in real-time

**Haziri solves this** by requiring students to be **physically present within a 50-meter GPS radius** of the classroom and using **device fingerprinting** to prevent sharing.

---

## 🏗️ System Architecture

![System Architecture Diagram](C:\Users\Awwab\.gemini\antigravity\brain\09d99d32-7bd6-40fd-9e51-9cd882009beb\system_architecture_1775361432779.png)

The system follows a **3-tier client-server architecture**:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 8 + TailwindCSS 3 | Single Page Application (SPA) |
| **Backend** | Node.js + Express 5 + TypeScript | REST API server |
| **Database** | PostgreSQL | Relational data storage |

### Key Architectural Decisions
- **JWT-based stateless authentication** — no server-side sessions needed
- **Role-based routing** — teacher and student get entirely separate dashboards
- **Browser Geolocation API** — GPS coordinates captured natively in the browser
- **Device Fingerprinting** — a hash of device properties (screen size, user agent, timezone) to prevent one device marking for multiple students

---

## 💻 Technology Stack

### Frontend
```
React 19          → UI Components & State Management
React Router 7    → Client-side routing & navigation
Vite 8            → Build tool & dev server (HMR)
TailwindCSS 3     → Utility-first CSS framework
TypeScript        → Type safety
```

### Backend
```
Node.js           → Runtime environment
Express 5         → HTTP server & routing
TypeScript        → Type safety
bcryptjs          → Password hashing (12 salt rounds)
jsonwebtoken      → JWT token generation & verification
pg (node-postgres) → PostgreSQL client
dotenv            → Environment variable management
tsx               → TypeScript execution (dev mode)
```

### Database
```
PostgreSQL        → Primary relational database
UUID primary keys → Universally unique identifiers
TIMESTAMPTZ       → Timezone-aware timestamps
```

---

## 🗃️ Database Schema (ERD)

![Database Entity-Relationship Diagram](C:\Users\Awwab\.gemini\antigravity\brain\09d99d32-7bd6-40fd-9e51-9cd882009beb\database_erd_1775361468134.png)

### Tables Overview

#### 1. `users` — Shared table for Teachers & Students
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique identifier |
| `name` | VARCHAR(255) | Full name |
| `email` | VARCHAR(255) UNIQUE | Login email |
| `password_hash` | TEXT | bcrypt hashed password |
| `role` | VARCHAR(10) | `'teacher'` or `'student'` |
| `phone_number` | VARCHAR(20) | Optional contact |
| `gender` | VARCHAR | Optional gender field |
| `created_at` | TIMESTAMPTZ | Registration timestamp |

#### 2. `courses` — Created by Teachers
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Course identifier |
| `teacher_id` | UUID (FK → users) | Course owner |
| `code` | VARCHAR(20) UNIQUE | Short code (e.g., "CS101") |
| `title` | VARCHAR(255) | Course name |
| `description` | TEXT | Optional description |
| `status` | VARCHAR(10) | `'active'`, `'draft'`, or `'archived'` |

#### 3. `enrollments` — Many-to-Many: Students ↔ Courses
| Column | Type | Description |
|--------|------|-------------|
| `course_id` | UUID (FK → courses) | Which course |
| `student_id` | UUID (FK → users) | Which student |
| UNIQUE constraint | `(course_id, student_id)` | Prevents duplicate enrollment |

#### 4. `sessions` — Attendance Sessions (started by teachers)
| Column | Type | Description |
|--------|------|-------------|
| `course_id` | UUID (FK → courses) | Associated course |
| `teacher_id` | UUID (FK → users) | Who started it |
| `latitude` | DECIMAL(10,8) | Teacher's GPS latitude |
| `longitude` | DECIMAL(11,8) | Teacher's GPS longitude |
| `radius_meters` | INT (default: 50) | Allowed distance radius |
| `started_at` | TIMESTAMPTZ | When session began |
| `ended_at` | TIMESTAMPTZ | NULL while active |

#### 5. `attendance` — Individual Student Records
| Column | Type | Description |
|--------|------|-------------|
| `session_id` | UUID (FK → sessions) | Which session |
| `student_id` | UUID (FK → users) | Which student |
| `device_fingerprint` | VARCHAR(255) | Device hash |
| `latitude` | DECIMAL(10,8) | Student's GPS latitude |
| `longitude` | DECIMAL(11,8) | Student's GPS longitude |
| `distance_meters` | DECIMAL(8,2) | Calculated distance from teacher |
| `status` | VARCHAR(10) | `'present'` or `'rejected'` |
| UNIQUE constraints | `(session_id, student_id)` and `(session_id, device_fingerprint)` | Anti-fraud |

---

## 🔐 Authentication & Security

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant S as Server (Express)
    participant DB as PostgreSQL

    U->>S: POST /api/auth/login {email, password}
    S->>DB: SELECT * FROM users WHERE email = ?
    DB-->>S: User record (with password_hash)
    S->>S: bcrypt.compare(password, hash)
    alt Valid credentials
        S->>S: jwt.sign({id, role, name, email}, secret, 7d)
        S-->>U: 200 {user, token}
        U->>U: localStorage.setItem('haziri_token', token)
    else Invalid
        S-->>U: 401 {error: 'Invalid credentials'}
    end
```

### Security Layers

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Password Hashing** | bcrypt with 12 salt rounds | Passwords never stored in plain text |
| **JWT Tokens** | Signed with server secret | 7-day expiry, stateless verification |
| **Role-Based Access** | `requireRole()` middleware | Teachers can't access student routes & vice versa |
| **Geofencing** | Haversine formula | Validates physical proximity (≤ 50m) |
| **Device Fingerprint** | Browser property hash | One device = one attendance per session |
| **Duplicate Prevention** | UNIQUE constraints | No double-marking per student per session |

---

## 📍 Core Feature: Geofenced Attendance

![Attendance Flow Diagram](C:\Users\Awwab\.gemini\antigravity\brain\09d99d32-7bd6-40fd-9e51-9cd882009beb\attendance_flow_1775361449268.png)

### How It Works — Step by Step

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TEACHER SIDE                                     │
│                                                                     │
│  1. Teacher opens → "Teacher Dashboard"                             │
│  2. Selects a course → clicks "🟢 Go Live"                         │
│  3. Browser captures teacher's GPS (lat, lng)                       │
│  4. Session created in DB with coordinates + 50m radius             │
│  5. Live session page shows real-time attendance log                │
│  6. New students appear automatically (10s polling)                 │
│  7. Teacher clicks "🔴 Stop Session" when done                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    STUDENT SIDE                                     │
│                                                                     │
│  1. Student opens → "My Courses" page                               │
│  2. Sees "🟢 LIVE" badge on course with active session              │
│  3. Clicks → "Mark Attendance" page                                 │
│  4. Browser requests student's GPS coordinates                      │
│  5. Device fingerprint auto-generated from browser properties       │
│  6. Student clicks "✓ Mark as Present"                             │
│  7. Server validates:                                               │
│     a. Session is still active (not ended)                          │
│     b. Student is enrolled in this course                           │
│     c. Device fingerprint not already used this session             │
│     d. Student hasn't already marked this session                   │
│     e. Distance ≤ 50 meters (Haversine formula)                    │
│  8. If ALL pass → status = 'present' ✅                            │
│  9. If distance > 50m → status = 'rejected' ❌                     │
└─────────────────────────────────────────────────────────────────────┘
```

### The Haversine Formula

The server uses the **Haversine formula** to calculate the great-circle distance between the teacher's GPS coordinates and the student's GPS coordinates:

```typescript
function haversineDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ/2)**2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

> If the calculated distance ≤ `radius_meters` (default: 50m), the student is marked **present**. Otherwise, the attendance is **rejected**.

### Device Fingerprinting (Anti-Proxy)

A unique hash is generated from the student's browser properties to prevent one device from marking attendance for multiple students:

```typescript
const fingerprint = hash([
  navigator.userAgent,       // Browser type & version
  screen.width + 'x' + screen.height,  // Screen resolution
  navigator.language,        // Browser language
  Intl.DateTimeFormat().resolvedOptions().timeZone,  // Timezone
  navigator.hardwareConcurrency,  // CPU cores
  navigator.maxTouchPoints       // Touch capability
].join('|'));
```

---

## 🔌 REST API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Create account (teacher/student) |
| `POST` | `/api/auth/login` | Public | Login → receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |

### Courses (Teacher)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/courses` | Teacher | List own courses (with enrollment count, live status) |
| `POST` | `/api/courses` | Teacher | Create a new course |
| `PUT` | `/api/courses/:id` | Teacher | Update course details |
| `DELETE` | `/api/courses/:id` | Teacher | Delete a course |
| `GET` | `/api/courses/:id/students` | Teacher | List enrolled students |
| `GET` | `/api/courses/teacher/students` | Teacher | List all students across all courses |
| `GET` | `/api/courses/teacher/students/:id/details` | Teacher | Detailed attendance stats per student |

### Courses (Student)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/courses/available` | Student | Browse all active courses |
| `GET` | `/api/courses/my` | Student | List enrolled courses (with live status) |
| `POST` | `/api/courses/:id/enroll` | Student | Enroll in a course |

### Sessions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/sessions/start` | Teacher | Start a new attendance session |
| `PUT` | `/api/sessions/:id/end` | Teacher | End an active session |
| `GET` | `/api/sessions/course/:courseId` | Teacher | Session history for a course |
| `GET` | `/api/sessions/:id` | Authenticated | Session details |
| `DELETE` | `/api/sessions/course/:courseId` | Teacher | Clear session history |

### Attendance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/attendance/mark` | Student | Mark attendance (with geofence check) |
| `GET` | `/api/attendance/session/:sessionId` | Teacher | Attendance list for a session |
| `GET` | `/api/attendance/my` | Student | Student's own attendance history |

---

## 🖥️ User Interface

### Login Page
![Haziri Login Page](C:\Users\Awwab\.gemini\antigravity\brain\09d99d32-7bd6-40fd-9e51-9cd882009beb\haziri_login.png)

### Application Pages

| Role | Page | Route | Description |
|------|------|-------|-------------|
| — | Login | `/login` | Email/password authentication |
| — | Register | `/register` | Account creation with role selection |
| 👨‍🏫 | Course Dashboard | `/teacher` | Manage courses, go live, see enrollment stats |
| 👨‍🏫 | Active Session | `/teacher/session/:id` | Real-time attendance log with 10s auto-refresh |
| 👨‍🏫 | Session History | `/teacher/courses/:id/history` | Past sessions & attendance counts |
| 👨‍🏫 | Students List | `/teacher/students` | All enrolled students across courses |
| 👨‍🏫 | Student Details | `/teacher/students/:id` | Per-student attendance breakdown |
| 👨‍🏫 | Reports | `/teacher/reports` | Aggregate attendance analytics |
| 🎓 | My Courses | `/student` | Enrolled courses with live session indicators |
| 🎓 | Available Courses | `/student/available` | Browse & enroll in courses |
| 🎓 | Mark Attendance | `/student/mark/:sessionId` | GPS-verified attendance marking |
| 🎓 | My Reports | `/student/reports` | Personal attendance history & stats |

### UI Features
- **Indigo Ethereal Theme** — premium gradient design with glassmorphism
- **Responsive Design** — works on desktop, tablet, and mobile
- **Real-time Indicators** — pulsing green dot for live sessions
- **Role-based Layouts** — separate sidebars for teacher vs student
- **Micro-animations** — smooth transitions, hover effects, loading states

---

## 📊 Reporting System

### Teacher Reports
- **Per-course attendance rates** — total sessions vs. present counts
- **Per-student breakdown** — individual attendance percentage
- **Session history** — timestamped log of all past sessions
- **Exportable data** — sortable/filterable tables

### Student Reports
- **Personal attendance dashboard** — circular progress ring showing overall %
- **Course-wise breakdown** — attendance rate per enrolled course
- **Session history table** — each session with teacher name and timestamp

---

## 🔄 Application Flow

```mermaid
graph TD
    A[User Opens Haziri] --> B{Has Token?}
    B -->|No| C[Login Page]
    B -->|Yes| D{Valid Token?}
    D -->|No| C
    D -->|Yes| E{User Role?}
    E -->|Teacher| F[Teacher Dashboard]
    E -->|Student| G[Student Dashboard]
    
    F --> F1[Create Course]
    F --> F2[Go Live - Start Session]
    F --> F3[View Students]
    F --> F4[View Reports]
    F2 --> F5[Active Session - Real-time Log]
    F5 --> F6[Stop Session]
    
    G --> G1[Browse Available Courses]
    G --> G2[My Enrolled Courses]
    G --> G3[View Reports]
    G1 --> G4[Enroll in Course]
    G2 --> G5{Has Live Session?}
    G5 -->|Yes| G6[Mark Attendance]
    G6 --> G7{Within 50m?}
    G7 -->|Yes| G8[✅ Present]
    G7 -->|No| G9[❌ Rejected]
```

---

## 📂 Project Structure

```
haziri/
├── client/                        # Frontend (React SPA)
│   ├── src/
│   │   ├── api.ts                 # HTTP client (fetch wrapper)
│   │   ├── App.tsx                # Route definitions
│   │   ├── main.tsx               # Entry point
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Auth state management
│   │   ├── hooks/
│   │   │   ├── useGeoLocation.ts  # GPS helper hook
│   │   │   └── useDeviceFingerprint.ts  # Anti-proxy hook
│   │   ├── layouts/
│   │   │   ├── TeacherLayout.tsx  # Teacher sidebar + nav
│   │   │   └── StudentLayout.tsx  # Student sidebar + nav
│   │   ├── components/
│   │   │   └── Sidebar.tsx        # Shared sidebar component
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── RegisterPage.tsx
│   │       ├── teacher/
│   │       │   ├── TeacherCoursesPage.tsx
│   │       │   ├── ActiveSessionPage.tsx
│   │       │   ├── SessionHistoryPage.tsx
│   │       │   ├── TeacherStudentsPage.tsx
│   │       │   ├── TeacherStudentDetailsPage.tsx
│   │       │   └── TeacherReportsPage.tsx
│   │       └── student/
│   │           ├── MyCoursesStudentPage.tsx
│   │           ├── AvailableCoursesPage.tsx
│   │           ├── MarkAttendancePage.tsx
│   │           └── MyReportsPage.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                        # Backend (REST API)
│   ├── src/
│   │   ├── index.ts               # Express app entry point
│   │   ├── db/
│   │   │   ├── pool.ts            # PostgreSQL connection pool
│   │   │   └── schema.sql         # Database schema (DDL)
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT verification + role guard
│   │   └── routes/
│   │       ├── auth.ts            # /api/auth/*
│   │       ├── courses.ts         # /api/courses/*
│   │       ├── sessions.ts        # /api/sessions/*
│   │       └── attendance.ts      # /api/attendance/*
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## ⚙️ How to Run

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Modern web browser with GPS support

### Setup Steps
```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Setup the database
psql -d your_database -f server/src/db/schema.sql

# 3. Configure environment variables
# server/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/haziri
JWT_SECRET=your-secret-key

# client/.env
VITE_API_URL=http://localhost:3001/api

# 4. Install dependencies & start
cd server && npm install && npm run dev    # Backend on :3001
cd client && npm install && npm run dev    # Frontend on :5174
```

---

## 🏆 Key Differentiators

| Feature | Traditional Systems | Haziri |
|---------|-------------------|--------|
| Verification | ❌ None — trust-based | ✅ GPS geofencing (50m radius) |
| Proxy Prevention | ❌ No mechanism | ✅ Device fingerprinting |
| Speed | ❌ Manual roll-call | ✅ One-tap marking |
| Real-time Tracking | ❌ After-the-fact | ✅ 10-second live polling |
| Accessibility | ❌ Paper/desktop only | ✅ Mobile-responsive web app |
| Reports | ❌ Manual calculation | ✅ Auto-generated dashboards |

---

## 🧠 Summary

**Haziri** is a full-stack web application that modernizes classroom attendance tracking by combining:

1. **GPS Geofencing** — proving students are physically in the classroom
2. **Device Fingerprinting** — preventing attendance fraud via device-level uniqueness
3. **Real-time Monitoring** — teachers see students arrive live, as they mark
4. **Role-Based Dashboards** — tailored experiences for teachers and students
5. **Comprehensive Reporting** — automated attendance analytics and insights

> Built with **React + Express + PostgreSQL** — a modern, production-ready tech stack.
