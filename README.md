# Turborepo Tailwind CSS Starter

This Turborepo starter is maintained by the Turborepo core team.

## Project Overview

A full-stack project with React/Next.js frontend and Django backend integrated with Tailwind CSS.

## Tech Stack

### Frontend (React/Next.js)
- **Core Framework**: React 19.2.0, Next.js 16.2.0
- **UI Libraries**: Shadcn UI 0.0.0.0.4, Tailwind CSS 3.4.19, Shadcn 4.10.0
- **State Management**: Tanstack Query 5.101.0
- **Theme System**: 4 modes - Dark / Light / Light Blue / Light Green
- **Utilities**: Axios 1.17.0 (HTTP), Lodash 4.*, Jest 27+, ESLint, Prettier

### Backend (Python/Django)
- **Framework**: Django 6.0.6
- **API**: DRF 3.17.1 + SimpleJWT 5.5.1
- **ORM**: PostgreSQL (primary), SQLite (dev)
- **Additional**: DRF-CORS 4.9.0, Django-Htmx 1.27.0, Django-Cotton 2.7.2

### Shared Dependencies
- Axios (HTTP client)
- Jest (testing), ESLint (linting), Prettier (formatting)

### Infrastructure
- PostgreSQL (primary DB), Redis/Memcached (caching)
- Docker (containerization), Git (version control), Celery (background tasks), Sentry (logging)

## Theme System

The application supports 4 theme modes with full persistence:

1. **Dark** - Default dark theme
2. **Light** - Clean light theme
3. **Light Blue** - Blue-tinted light theme
4. **Light Green** - Green-tinted light theme

### Theme Implementation
- Theme context provider in `apps/web/contexts/theme-context.tsx`
- Theme toggle component in `apps/web/components/theme-toggle.tsx`
- Theme variables defined in `apps/web/app/globals.css`
- Theme persistence via localStorage and URL parameters
- Tailwind CSS custom color palette for light-blue and light-green

### Usage
```sh
npx create-turbo@latest -e with-tailwind
```

## Dependencies
- Full list in `backend/requirements.txt` and `apps/web/package.json`