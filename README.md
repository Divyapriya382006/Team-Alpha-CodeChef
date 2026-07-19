# CampusOS

A centralized platform for managing student communities at VIT Chennai — clubs, events, blogs, projects, leaderboards, announcements, and more, unified under one modern web application.

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS v3
- React Router v6
- TanStack React Query v5

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

---

## Project Structure

```
campusos/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Express backend
├── docs/             # API contracts and build guides
└── README.md
```

## Modules

| Module | Description |
| --- | --- |
| **Auth** | JWT-based login and registration |
| **Clubs** | Club directory, profiles, membership |
| **Events** | Create, browse, and register for events |
| **Blogs** | Write and read community articles |
| **Projects** | Showcase student projects |
| **Leaderboard** | Rankings by points, events, projects |
| **Announcements** | Club and platform-wide announcements |
| **Gallery** | Photo showcase from events |
| **Admin Dashboard** | User management, club request queue, analytics |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Frontend Setup
```bash
cd apps/web
npm install
cp .env.example .env
# Set VITE_API_URL in .env
npm run dev
```

### Backend Setup
```bash
cd apps/api
npm install
# Configure DATABASE_URL in .env
npx prisma migrate dev
npm run dev
```

### Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| **Super Admin** | admin@campusos.edu | password123 |
| **Faculty Coordinator** | faculty@campusos.edu | password123 |
| **Club Head** | asha@campusos.edu | password123 |
| **Student** | member@campusos.edu | password123 |

---

## GitHub Workflow

* All features go through GitHub Issues → feature branch → Pull Request → code review → merge
* Branch naming: `feature/`, `fix/`, `chore/`
* PRs require at least one review before merge into `main`

---

## Team
Built by the CampusOS engineering team — VIT Chennai.
