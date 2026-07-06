# Clinic11 Technology Stack

## Overview
Hybrid full-stack application using Python/Django for backend and React/Next.js for frontend with Tailwind CSS.

---

## 📱 Frontend Technologies

### Core Frameworks
- **React**: 19.2.0 (UI library)
- **Next.js**: 16.2.0 (React framework with SSR/SSG)

### UI Component Libraries
- **Shadcn UI**: 0.0.4 (Radix-based UI components)
- **Tailwind CSS**: 3.4.19 (Utility-first CSS framework)
- **Shadcn**: 4.10.0 (Additional UI utilities)
- **Radix UI**: 2.1.x (Primitive UI components)
  - `@radix-ui/react-label`
  - `@radix-ui/react-primitive`

### State & Data Management
- **Tanstack Query (React Query)**: 5.101.0 (Data fetching & caching)
- **Zod**: 4.4.3 (Schema validation & TypeScript integration)

### Networking
- **Axios**: 1.17.0 (HTTP client)

### Styling
- **Tailwind CSS** (primary)
- **Tailwind Merge**: 3.6.0 (Utility for merging Tailwind classes)
- **Tw-animate.css**: 1.4.0 (Animation utilities)

### Theme System
- **4 Theme Modes**: Dark / Light / Light Blue / Light Green
- **Theme Context Provider**: `apps/web/contexts/theme-context.tsx`
- **Theme Toggle Component**: `apps/web/components/theme-toggle.tsx`
- **Theme Variables**: Defined in `apps/web/app/globals.css` using CSS custom properties
- **Theme Persistence**: localStorage + URL parameters
- **Tailwind Custom Colors**: light-blue (#60a5fa) and light-green (#34d399) added to `backend/tailwind.config.js`

### Tooling & Dev
- **TypeScript** (strict typing)
- **ESLint** (code linting)
- **Prettier** (code formatting)
- **Jest** (testing framework)

---

## ⚙️ Backend Technologies

### Core Framework
- **Django**: 6.0.6 (Python web framework)

### API Layer
- **Django REST Framework**: 3.17.1 (API serialization & routing)
- **DRF SimpleJWT**: 5.5.1 (Authentication)
- **DRF CORS Headers**: 4.9.0 (Cross-origin resource sharing)

### Database
- **PostgreSQL**: Primary production database
- **SQLite**: Development & testing database
- **SQLParse**: 0.5.5 (SQL query parsing/formatting)

### Additional Backend Packages
- **Django Cotton**: 2.7.2 (Cookie/session handling)
- **Django HTMX**: 1.27.0 (HTMX integration for Django views)
- **ASGI Ref**: 3.11.1 (ASGI server interface)
- **Python-dotenv**: 1.2.2 (Environment variable loading)
- **PyJWT**: 2.13.0 (JSON Web Token handling)
- **Faker**: 40.21.0 (Test data generation)
- **Tzdata**: 2026.2 (Timezone data)

### Testing & Dev
- **Pytest** (test runner)
- **Coverage.py** (test coverage)

---

## 🔗 Shared Dependencies

- **Axios**: Used for HTTP communication between frontend and backend
- **Jest**: Testing framework (both Python and JS tests)
- **ESLint**: Code quality & linting
- **Prettier**: Code formatting consistency

---

## 🏗️ Infrastructure & DevOps

### Data & Caching
- **Redis/Memcached**: Distributed caching layer
- **Celery**: Distributed task queue (background jobs)

### Monitoring & Logging
- **Sentry**: Error tracking & performance monitoring

### Containerization & Orchestration
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration

### Version Control & CI/CD
- **Git**: Source control
- **GitHub/GitLab**: Repository hosting (implied)
- **CI/CD Pipelines**: Testing & deployment automation

### Deployment Environment
- **Operating System**: Linux-based (production), Windows (development)
- **Web Server**: Nginx (reverse proxy), Gunicorn/uvicorn (WSGI/ASGI servers)

---

## 📦 Package Files

- **Frontend**: `apps/web/package.json`
- **Backend**: `backend/requirements.txt`
- **Shared Configurations**:
  - `@repo/eslint-config`: ESLint rules
  - `@repo/typescript-config`: TypeScript configuration
  - `@repo/tailwind-config`: Tailwind CSS configuration

---

## ✨ Key Architectural Decisions

1. **Hybrid Stack**: Leverages Python's Django's maturity for data-heavy backend & React's ecosystem for dynamic frontend.
2. **Monorepo Structure**: Uses Turborepo for efficient dependency management & build optimization.
3. **Type Safety**: Full TypeScript on frontend + planned migration to typed Python (mypy/pyright) on backend.
4. **API Contract**: REST with JSON payloads, versioned via URL paths.
5. **Styling System**: Utility-first CSS (Tailwind) with component library (Shadcn UI) for consistency.

*Last updated: 2026-07-06*