# CampusOS

> A centralized platform for managing student clubs, events, projects, and campus engagement — built with TypeScript, React, Express, and PostgreSQL.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Authentication & Roles](#authentication--roles)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## 🎯 Overview

**CampusOS** is a full-stack web application designed to streamline student club management on college campuses. It provides a unified platform for students, club leaders, faculty coordinators, and administrators to manage clubs, organize events, showcase projects, publish blogs, and track campus engagement through leaderboards.

Built as a monorepo using **npm workspaces**, CampusOS features a modern React frontend powered by Vite and Tailwind CSS, paired with a robust Express backend using Prisma ORM for type-safe database access.

---

## 🚀 Problem Statement

Campus organizations face fragmented systems for club management, event coordination, and member engagement. Students struggle to discover clubs and events, while club leaders lack centralized tools for managing memberships, projects, and announcements. Faculty coordinators need visibility into club activities, and administrators require oversight of the entire ecosystem.

**CampusOS solves this by providing:**
- A single source of truth for all campus clubs and activities
- Role-based access control for different user types
- Approval workflows for club creation and event management
- Real-time leaderboards to gamify engagement
- Cross-entity search to discover relevant content
- A project showcase for technical clubs
- Announcement systems for targeted communication

---

## ✨ Features

### 🔐 User Management & Authentication
- JWT-based authentication with secure password hashing
- Role-based access control (Super Admin, Faculty Coordinator, Student)
- User profile management
- Platform-level and club-scoped permissions

### 🏛️ Club Management
- Club creation request workflow with admin approval
- Club directory with search and filtering
- Faculty coordinator assignment (one per club)
- Club Head role (one per club)
- Department management within clubs
- Member management (add/remove, role assignment)
- Club Head transfer functionality
- Social media links and branding (logo URLs)

### 📅 Event Management
- Create events (PUBLIC or CLUB_EXCLUSIVE)
- Event approval workflow (Faculty Coordinator review)
- Event registration system with capacity limits
- Event directory with search and filters
- Calendar view of upcoming events
- Registered attendee tracking

### 💼 Project Showcase
- Create and manage technical projects
- Tech stack tagging
- GitHub and demo links
- Project status tracking (In Progress, Completed, Archived)
- Contributor attribution
- Club and department scoping

### 📝 Blogs & Articles
- Rich blog post creation
- Tag-based categorization
- Club and department association
- Blog directory with search
- Author profiles

### 📢 Announcements
- Three visibility levels: Global, Club, Department
- Targeted communication channels
- Chronological feed
- Permission-based creation

### 🖼️ Gallery
- Club photo galleries
- Image caption support
- Club-scoped organization

### 🏆 Leaderboard
- Club rankings (by events hosted, projects completed, member count)
- Student rankings (by contributions, club participation)
- Multiple sorting options
- Search functionality

### 🔍 Search
- Cross-entity search (clubs, events, projects, blogs)
- Type filtering
- Paginated results

### 👨‍💼 Admin Dashboard
- Club creation request review queue
- User management (role assignment)
- Platform analytics
- System-wide oversight

### 🎓 Faculty Coordination
- Event approval queue
- Club oversight
- Faculty-specific dashboard

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.11
- **Language:** TypeScript 5.6.3
- **Styling:** Tailwind CSS 3.4.15
- **Routing:** React Router DOM 6.28.0
- **State Management:** TanStack Query 5.62.0 (server state), React Context (auth)
- **HTTP Client:** Axios 1.7.9

### Backend
- **Runtime:** Node.js
- **Framework:** Express 4.18.2
- **Language:** TypeScript 5.3.3
- **ORM:** Prisma 5.7.0
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Validation:** Zod 3.22.4
- **Security:** Helmet 7.1.0, CORS 2.8.5

### DevOps & Tools
- **Monorepo:** npm workspaces
- **CI/CD:** GitHub Actions
- **Testing:** Jest 29.7.0, Supertest 6.3.3
- **Development:** ts-node-dev, Vite dev server, Concurrently

---

## 🏗️ Architecture

CampusOS follows a **modular monolith** architecture with clear separation of concerns:

### Backend Architecture

**Three-Layer Pattern:**
```
Routes Layer (HTTP mapping, middleware)
    ↓
Controllers Layer (Request parsing, response formatting)
    ↓
Services Layer (Business logic, database access)
```

**Key Design Principles:**
- **Module Independence:** 12 feature modules with no cross-module dependencies
- **Middleware Stack:** Authentication → Authorization → Validation → Controller
- **Error Handling:** Centralized error handler with custom error types
- **Transaction Support:** Prisma transactions for atomic multi-step operations
- **Type Safety:** End-to-end TypeScript with Prisma-generated types

### Frontend Architecture

**Component-Based Design:**
- **Pages:** Route-level components for each screen
- **Layouts:** AppLayout, AuthLayout, DashboardLayout for consistent structure
- **Components:** Reusable UI components (cards, tables, forms)
- **Custom Hooks:** Data fetching hooks wrapping TanStack Query
- **Context:** AuthContext for global authentication state
- **Protected Routes:** Role-based route guards with predicate support

### Database Architecture

**Relational Model with Prisma ORM:**
- 12 main entities with proper foreign key relationships
- Enum types for status fields and roles
- Cascading deletes for referential integrity
- Indexed fields for query performance
- Migration-based schema evolution

---

## 📁 Repository Structure

```
campusos/
├── apps/
│   ├── api/                      # Backend application
│   │   ├── prisma/
│   │   │   ├── migrations/       # Database migrations
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── seed.ts           # Seed data script
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules (12 total)
│   │   │   │   ├── auth/         # Authentication
│   │   │   │   ├── users/        # User management
│   │   │   │   ├── club-requests/# Club creation requests
│   │   │   │   ├── clubs/        # Club CRUD
│   │   │   │   ├── departments/  # Department management
│   │   │   │   ├── events/       # Event management
│   │   │   │   ├── projects/     # Project showcase
│   │   │   │   ├── blogs/        # Blog system
│   │   │   │   ├── announcements/# Announcements
│   │   │   │   ├── gallery/      # Gallery system
│   │   │   │   ├── leaderboard/  # Leaderboards
│   │   │   │   └── search/       # Cross-entity search
│   │   │   ├── middleware/       # Shared middleware
│   │   │   ├── lib/              # Utilities (JWT, Prisma, errors)
│   │   │   ├── routes/           # Route aggregation
│   │   │   ├── config/           # Configuration
│   │   │   ├── app.ts            # Express app setup
│   │   │   └── server.ts         # HTTP server entry point
│   │   ├── .env.example          # Environment template
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                      # Frontend application
│       ├── src/
│       │   ├── pages/            # Route pages
│       │   │   ├── auth/         # Login, Register
│       │   │   ├── clubs/        # Club pages
│       │   │   ├── events/       # Event pages
│       │   │   ├── projects/     # Project pages
│       │   │   ├── blogs/        # Blog pages
│       │   │   ├── announcements/# Announcement pages
│       │   │   ├── gallery/      # Gallery page
│       │   │   ├── leaderboard/  # Leaderboard page
│       │   │   ├── admin/        # Admin pages
│       │   │   ├── faculty/      # Faculty pages
│       │   │   ├── Home.tsx      # Landing page
│       │   │   └── Profile.tsx   # User profile
│       │   ├── components/       # Reusable components
│       │   │   ├── layout/       # Layout components
│       │   │   ├── cards/        # Card components
│       │   │   ├── tables/       # Table components
│       │   │   └── ui/           # UI primitives
│       │   ├── hooks/            # Custom React hooks
│       │   ├── context/          # React Context providers
│       │   ├── lib/              # Utilities (API client, mock data)
│       │   ├── routes/           # Route configuration
│       │   ├── types/            # TypeScript types
│       │   ├── App.tsx           # Root component
│       │   └── main.tsx          # Entry point
│       ├── .env.example          # Environment template
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── docs/                         # Frozen documentation
│   ├── FINAL_API_CONTRACT.md     # API specification
│   └── FINAL_TEAM_BUILD_GUIDE.md # Build requirements
│
├── backend-docs/                 # Backend architecture docs
│   ├── ARCHITECTURE.md           # Detailed architecture
│   ├── API_AND_DATABASE_SPEC.md  # API & DB design
│   ├── DECISIONS.md              # Tech decisions
│   └── IMPLEMENTATION_PLAN.md    # Development roadmap
│
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline
│
├── package.json                  # Root package.json (workspace config)
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **PostgreSQL** 14+ (running locally or remote)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CAMPUSOS-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs dependencies for both frontend and backend via workspaces.

3. **Set up environment variables:**

   **Backend (`apps/api/.env`):**
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Edit `apps/api/.env` with your configuration (see [Environment Variables](#environment-variables)).

   **Frontend (`apps/web/.env`):**
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
   Edit `apps/web/.env` with your configuration.

4. **Set up the database:**
   ```bash
   cd apps/api
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database with test data
   npx prisma db seed
   
   cd ../..
   ```

5. **Start the development servers:**
   ```bash
   npm run dev
   ```
   This starts both frontend (port 5173) and backend (port 3000) concurrently.

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1
   - Health check: http://localhost:3000/health

---

## 🔧 Environment Variables

### Backend (`apps/api/.env`)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/campusos?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (use strong random string in production)

**Optional:**
- `PORT` - Backend server port (default: 3000)
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `CORS_ORIGIN` - Allowed frontend origin (default: http://localhost:5173)

### Frontend (`apps/web/.env`)

```env
# API Configuration
VITE_API_BASE_URL=/api/v1

# Mock Mode (for development without backend)
VITE_USE_MOCK=true
```

**Configuration:**
- `VITE_API_BASE_URL` - Backend API base URL (default: `/api/v1`)
- `VITE_USE_MOCK` - Enable mock data mode (set to `false` to use real backend)

**Mock Mode:**
When `VITE_USE_MOCK=true`, the frontend uses in-memory mock data instead of making real API calls. This allows frontend development without a running backend. Set to `false` once the backend is running.

---

## 🗄️ Database Setup

### Schema Overview

CampusOS uses PostgreSQL with Prisma ORM. The schema includes:

**Core Entities:**
- `User` - Platform users with roles
- `Club` - Student clubs
- `ClubMembership` - User-club relationships
- `Department` - Club departments
- `DepartmentMembership` - User-department relationships
- `ClubCreationRequest` - Club approval workflow
- `Event` - Club events
- `EventRegistration` - Event attendees
- `Project` - Technical projects
- `Blog` - Blog posts
- `Announcement` - Announcements
- `GalleryItem` - Club photos

### Migrations

**Apply migrations:**
```bash
cd apps/api
npx prisma migrate dev
```

**Create a new migration:**
```bash
npx prisma migrate dev --name description_of_changes
```

**Reset database (destructive):**
```bash
npx prisma migrate reset
```

### Seed Data

The seed script creates test data for development:

**Run seed:**
```bash
cd apps/api
npx prisma db seed
```

**Seed includes:**
- 8 users (1 Super Admin, 2 Faculty Coordinators, 5 Students)
- 3 clubs with departments
- 5 approved events
- 9 projects
- 9 blog posts
- 5 announcements
- 4 gallery items

**Test Credentials:**
See `apps/api/SEED_CREDENTIALS.md` for login details.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | alice@campusos.edu | Admin@123! |
| Faculty Coordinator | bob@campusos.edu | Faculty@123! |
| Faculty Coordinator | carol@campusos.edu | Faculty@123! |
| Student (Club Head) | david@campusos.edu | Student@123! |
| Student (Club Head) | eva@campusos.edu | Student@123! |
| Student (Club Head) | frank@campusos.edu | Student@123! |
| Student (Member) | grace@campusos.edu | Student@123! |
| Student (Member) | henry@campusos.edu | Student@123! |

### Database Tools

**Prisma Studio (GUI):**
```bash
cd apps/api
npx prisma studio
```
Opens a browser-based database GUI at http://localhost:5555.

---

## 📡 API Overview

### Base URL
```
/api/v1
```

### Authentication
Protected routes require a JWT in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Failure:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": "validation message" }
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation failure / Bad request |
| 401 | Unauthorized (missing/invalid/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal server error |

### Pagination

List endpoints support pagination via query parameters:
```
GET /api/v1/clubs?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Key Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (protected)

**Clubs:**
- `GET /clubs` - List clubs (public, with search)
- `GET /clubs/:id` - Get club details (public)
- `POST /clubs` - Create club (Super Admin only)
- `PATCH /clubs/:id` - Update club (Club Head or Super Admin)

**Events:**
- `GET /events` - List events (public, filtered by visibility)
- `GET /events/:id` - Get event details (public if PUBLIC type)
- `POST /clubs/:id/events` - Create event (Club Head only)
- `PATCH /events/:id/review` - Approve/reject event (Faculty Coordinator)
- `POST /events/:id/register` - Register for event (authenticated)
- `DELETE /events/:id/register` - Unregister from event (authenticated)

**Projects:**
- `GET /projects` - List projects (public, with search)
- `GET /projects/:id` - Get project details (public)
- `POST /clubs/:id/projects` - Create project (Club Head or Department Head)
- `PATCH /clubs/:id/projects/:projectId` - Update project (creator, Club Head, or Super Admin)
- `DELETE /clubs/:id/projects/:projectId` - Delete project (creator, Club Head, or Super Admin)

**Blogs:**
- `GET /blogs` - List blogs (public, with search/filter)
- `GET /blogs/:id` - Get blog post (public)
- `POST /clubs/:id/blogs` - Create blog (Club Head or Department Head)
- `PATCH /clubs/:id/blogs/:blogId` - Update blog (author, Club Head, or Super Admin)
- `DELETE /clubs/:id/blogs/:blogId` - Delete blog (author, Club Head, or Super Admin)

**Search:**
- `GET /search?q=query&type=clubs` - Cross-entity search

**Leaderboard:**
- `GET /leaderboard/clubs?sort=points` - Club rankings
- `GET /leaderboard/students?sort=points` - Student rankings

**Admin:**
- `GET /club-requests` - List club creation requests (Super Admin or requester)
- `PATCH /club-requests/:id/review` - Approve/reject request (Super Admin)
- `GET /users` - Search users (Club Head, Faculty Coordinator, or Super Admin)
- `PATCH /users/:id/role` - Change user role (Super Admin)

For complete API documentation, see `docs/FINAL_API_CONTRACT.md`.

---

## 🔐 Authentication & Roles

### Authentication Flow

1. **Registration:** User creates account via `POST /auth/register`
2. **Login:** User authenticates via `POST /auth/login`, receives JWT
3. **Token Storage:** Frontend stores JWT in `localStorage`
4. **Request Authentication:** Frontend attaches JWT to all API requests via `Authorization` header
5. **Token Verification:** Backend `authenticate` middleware validates JWT on protected routes
6. **Session Management:** Token expires after 7 days (configurable)

### Platform Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **SUPER_ADMIN** | Platform administrator | Full system access, create clubs, approve requests, manage users |
| **FACULTY_COORDINATOR** | Faculty advisor | Approve events, coordinate one club |
| **STUDENT** | Default role | Create club requests, join clubs, register for events |

### Club Roles

| Role | Description | Assignment |
|------|-------------|------------|
| **CLUB_HEAD** | Club leader | One per club, full club management |
| **MEMBER** | Club member | Default for all club members |

### Department Head

- **Not a stored role** - derived from `Department.headUserId`
- Scoped to a specific department within a club
- Can manage department members and create department-scoped content

### Permission Model

**Public Access:**
- Browse clubs, events (PUBLIC type), projects, blogs
- View leaderboards
- Use search

**Authenticated Users:**
- All public access
- Register for events
- Create club requests
- View own profile
- Create announcements (visibility depends on role)

**Club Head:**
- All member permissions
- Manage club members and departments
- Create events (requires Faculty Coordinator approval)
- Approve/reject project and blog posts
- Transfer Club Head role

**Faculty Coordinator:**
- All authenticated user permissions
- Approve/reject events for coordinated club
- View event approval queue

**Super Admin:**
- All permissions
- Approve/reject club creation requests
- Assign faculty coordinators
- Change user roles
- Access admin dashboard
- Bypass club-scoped authorization

---

## 🚢 Deployment

### Backend Deployment

**Build:**
```bash
cd apps/api
npm run build
```
This generates Prisma client, compiles TypeScript, and outputs to `apps/api/dist/`.

**Start Production Server:**
```bash
npm start
```
Runs `node dist/server.js` on the configured `PORT`.

**Environment:**
- Set `NODE_ENV=production`
- Use a strong, random `JWT_SECRET`
- Configure production `DATABASE_URL`
- Set appropriate `CORS_ORIGIN`

**Database Migrations:**
```bash
npx prisma migrate deploy
```
Apply migrations in production (non-interactive).

**Hosting Options:**
- Railway, Render, Heroku, AWS Elastic Beanstalk, DigitalOcean App Platform
- Requires PostgreSQL database (e.g., Railway PostgreSQL, AWS RDS, Neon)

### Frontend Deployment

**Build:**
```bash
cd apps/web
npm run build
```
Outputs static files to `apps/web/dist/`.

**Environment:**
- Set `VITE_API_BASE_URL` to production API URL
- Set `VITE_USE_MOCK=false`

**Hosting Options:**
- Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront
- Any static hosting service

### Full-Stack Deployment (Single Server)

The backend can serve frontend static files in production:

1. Build frontend: `npm run build:web`
2. Build backend: `npm run build:api`
3. Backend serves static files from `apps/web/dist/` (configured in `apps/api/src/app.ts`)
4. Deploy as a single application

**Example (Railway):**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 💻 Development Workflow

### Run Development Servers

**Both (Recommended):**
```bash
npm run dev
```
Starts frontend (port 5173) and backend (port 3000) concurrently.

**Frontend Only:**
```bash
npm run dev:web
```

**Backend Only:**
```bash
npm run dev:api
```

### Code Structure

**Adding a New Feature Module (Backend):**
1. Create `apps/api/src/modules/new-feature/` directory
2. Add `routes.ts`, `controller.ts`, `service.ts`, `schemas.ts`
3. Register routes in `apps/api/src/routes/v1/index.ts`
4. Add database models to `apps/api/prisma/schema.prisma` if needed
5. Run `npx prisma migrate dev --name add-new-feature`

**Adding a New Page (Frontend):**
1. Create component in `apps/web/src/pages/`
2. Add route to `apps/web/src/routes/AppRoutes.tsx`
3. Create data fetching hook in `apps/web/src/hooks/` if needed
4. Add API functions to `apps/web/src/lib/api/` if needed

### Database Changes

**Schema Updates:**
1. Edit `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Prisma client regenerates automatically

**View Database:**
```bash
cd apps/api
npx prisma studio
```

### Mock Data Mode

Develop frontend without running the backend:

1. Set `VITE_USE_MOCK=true` in `apps/web/.env`
2. Mock data is in `apps/web/src/lib/mockData.ts`
3. Frontend uses in-memory data instead of API calls
4. Switch to `false` when backend is ready

---

## 🧪 Testing

### Backend Tests

**Run all tests:**
```bash
cd apps/api
npm test
```

**Run tests once (non-watch mode):**
```bash
npm run test:run
```

**Test Structure:**
- Unit tests: `src/modules/*/service.test.ts`
- Integration tests: `src/modules/*/controller.test.ts`
- Middleware tests: `src/middleware/*.test.ts`

**Testing Stack:**
- Jest (test runner)
- Supertest (HTTP assertions)
- Prisma mocks for unit tests
- Test database for integration tests

### Frontend Tests

Frontend testing is not currently implemented but can be added using:
- Vitest (Vite-native test runner)
- React Testing Library
- MSW (Mock Service Worker) for API mocking

---

## 🤝 Contributing

### Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests:**
   ```bash
   cd apps/api && npm test
   ```
5. **Commit with descriptive messages:**
   ```bash
   git commit -m "feat: add user profile editing"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Code Standards

- Follow existing code style (TypeScript, ESLint)
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

### Pull Request Guidelines

- Provide clear description of changes
- Reference related issues
- Ensure tests pass
- Update README if needed

---

## 👥 Team

- **Project Lead:** [Name]
- **Backend Developer:** [Name]
- **Frontend Developer:** [Name]
- **Database Administrator:** [Name]
- **DevOps Engineer:** [Name]

*Add team member details as appropriate.*

---

## 📄 License

[Specify license - e.g., MIT, Apache 2.0, or Proprietary]

---

## 📚 Additional Documentation

- **API Contract:** `docs/FINAL_API_CONTRACT.md`
- **Build Guide:** `docs/FINAL_TEAM_BUILD_GUIDE.md`
- **Architecture:** `backend-docs/ARCHITECTURE.md`
- **API & Database Spec:** `backend-docs/API_AND_DATABASE_SPEC.md`
- **Technology Decisions:** `backend-docs/DECISIONS.md`
- **Implementation Plan:** `backend-docs/IMPLEMENTATION_PLAN.md`
- **Seed Credentials:** `apps/api/SEED_CREDENTIALS.md`

---

## 🎯 Future Enhancements

**Out of Scope for Current Version:**
- Google OAuth integration
- Password reset via email
- Email verification
- Google Calendar sync
- Advanced full-text search (Elasticsearch)
- Real-time notifications
- File upload service (currently using URL strings)
- Audit logging
- Rate limiting
- Soft deletes

**Potential Future Features:**
- Mobile app (React Native)
- Push notifications
- Real-time chat between club members
- Advanced analytics and reporting
- Export functionality (PDF reports, CSV data)
- Integration with campus LMS
- Event check-in system (QR codes)
- Member badges and achievements

---

## 🆘 Support

For questions, issues, or contributions:
- **Issues:** [GitHub Issues]
- **Discussions:** [GitHub Discussions]
- **Email:** [Contact Email]

---

**Built with ❤️ for campus communities**