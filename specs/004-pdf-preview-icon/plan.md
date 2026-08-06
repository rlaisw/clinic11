# Implementation Plan: pdf-preview-icon

**Branch**: `004-pdf-preview-icon` | **Date**: 2026-07-31 | **Spec**: specs/004-pdf-preview-icon/spec.md

**Input**: Feature specification from `/specs/004-pdf-preview-icon/spec.md`

## Summary

Add a preview icon on the sick leave certificate tab page (`/doctor/patients/[patient-id]/sick-leave-certificate`) that opens an inline modal displaying the PDF certificate. The modal includes a loading spinner, close button, ESC key support, and basic mobile touch interactions (tap to close, pinch-to-zoom). If PDF loading fails, a download link is provided. Only doctors have access to this feature.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11+ (backend/Django)

**Primary Dependencies**: 
- Frontend: React 19.2.0, Next.js 16.2.0, Shadcn UI, Radix UI, TanStack Query 5.101.0, Zod 4.4.3, Axios 1.17.0
- Backend: Django 6.0.6, Django REST Framework 3.17.1, DRF SimpleJWT 5.5.1

**Storage**: PostgreSQL (production), SQLite (development) — existing models for SickLeaveCertificate already store PDF metadata

**Testing**: 
- Frontend: Jest + React Testing Library
- Backend: Pytest + Django Test Client

**Target Platform**: Web (Chrome, Firefox, Safari, Edge), responsive desktop and mobile

**Project Type**: Web application (full-stack monorepo with frontend + backend)

**Performance Goals**: 
- PDF modal opens within 3 seconds (SC-001)
- Modal renders at 60fps on desktop, responsive on mobile
- PDF download fallback available if modal fails

**Constraints**: 
- Must follow existing tab navigation patterns in `apps/web`
- Must use existing TanStack Query patterns for data fetching
- Must respect existing Django permission system (`DoctorPermission`)
- Must integrate with existing PDF generation pipeline (`weasyprint`/`reportlab`)
- No new external dependencies

**Scale/Scope**: 
- Single feature on existing sick leave certificate tab
- Reuses existing `SickLeaveCertificate` model and PDF endpoint
- ~500 lines of new frontend code, minimal backend changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file is a template with placeholders. No specific governance rules are defined that would block this feature. The feature:
- Is a standalone UI enhancement (Library-First principle)
- Does not introduce new external dependencies (Simplicity principle)
- Follows existing test patterns (Test-First principle - will require tests)
- Integrates with existing API contracts (Integration Testing principle)

**Result**: PASS — no constitutional violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/004-pdf-preview-icon/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application (frontend + backend detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

apps/web/
├── src/
│   ├── components/
│   │   ├── doctor/
│   │   └── ui/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── tests/
```

**Structure Decision**: This project uses a monorepo with separate `backend/` (Django) and `apps/web/` (Next.js) directories. The feature primarily involves frontend work in `apps/web/` with minimal backend integration using the existing PDF endpoint at `GET /api/patients/{id}/sick-leave`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |

## Phase 0: Research

### Unknowns Requiring Research

| Unknown | Research Task | Priority |
|---------|---------------|----------|
| PDF rendering in modal | Research best practices for displaying PDF in inline modal using existing React/Next.js stack (e.g., PDF.js, react-pdf, or native iframe) | High |
| Mobile touch interactions for PDF | Research pinch-to-zoom and tap-to-close implementation patterns for PDF viewers in React | Medium |
| Loading state patterns | Research existing loading patterns in the codebase (Shadcn UI components) | Low |
| Error boundary for PDF | Research error boundary patterns for PDF rendering failures | Medium |

### Research Tasks

1. **Research PDF rendering in inline modal for React/Next.js**
   - Evaluate `react-pdf` (PDF.js wrapper) vs native iframe vs `<object>` tag
   - Check bundle size impact
   - Verify compatibility with Shadcn UI modal components

2. **Research mobile touch interactions for PDF viewer**
   - Pinch-to-zoom implementation approaches
   - Tap-to-close behavior on mobile
   - Touch event handling in React

3. **Research existing loading/error patterns in codebase**
   - Check `apps/web/components/ui/` for existing spinner/loading components
   - Check existing error boundaries in the codebase
   - Follow TanStack Query error handling patterns

## Phase 1: Design & Contracts

### Data Model

**Existing entities reused** (from spec 002-sick-leave-certificate):
- `SickLeaveCertificate` — PDF document metadata, already has QR code and PDF generation
- No new database models required

**New frontend state** (not persisted):
- Modal open/close state
- PDF loading state (loading/error/success)
- Touch interaction state (zoom level, pan position)

### Interface Contracts

**API Endpoint (already exists)**:
```
GET /api/sick-leave-certificates/{certificateId}/pdf
```
- Returns: PDF file (Content-Type: application/pdf)
- Auth: Requires doctor role (DoctorPermission)
- Error responses: 404 (not found), 403 (forbidden), 500 (generation error)

**Frontend API Layer** (new hook):
```
useSickLeaveCertificatePreview(certificateId: string) -> {
  pdfUrl: string,
  isLoading: boolean,
  error: Error | null,
  openModal: () => void,
  closeModal: () => void,
  isOpen: boolean
}
```

Note: The hook requires the certificate ID to construct the PDF URL. The certificate ID can be obtained from the existing `sick-leave-certificates` endpoint on the patient viewset.

### Quickstart Validation Guide

**Prerequisites**:
- Django server running (`cd backend && python manage.py runserver`)
- Next.js dev server running (`cd apps/web && pnpm dev`)
- Doctor user logged in with access to at least one patient with sick leave certificate
- Patient record has an existing `SickLeaveCertificate` with generated PDF

**Validation Scenarios**:

| # | Scenario | Steps | Expected Outcome |
|---|----------|-------|------------------|
| 1 | Icon appears on tab | 1. Log in as doctor<br>2. Navigate to `/doctor/patients/{id}/sick-leave-certificate` | Preview icon (eye/document) visible in tab header |
| 2 | Modal opens on click | 1. Click preview icon | Modal opens with loading spinner |
| 3 | PDF renders | 1. Wait for PDF load (≤3s) | PDF displays in modal with scroll/zoom |
| 4 | Close modal | 1. Click close button or press ESC | Modal closes, focus returns to tab |
| 5 | Mobile touch | 1. Open on mobile viewport<br>2. Pinch to zoom<br>3. Tap close button | Zoom works, tap closes modal |
| 6 | Download fallback | 1. Simulate PDF load error (network off)<br>2. Click preview icon | Download link appears below preview area |
| 7 | Role restriction | 1. Log in as non-doctor<br>2. Navigate to same URL | Preview icon NOT visible (403/redirect) |

**Test Commands**:
```bash
# Frontend unit tests
cd apps/web && npx jest --testPathPattern="pdf-preview" --coverage

# Frontend integration tests
cd apps/web && npx playwright test pdf-preview

# Backend tests (verify endpoint exists and works)
cd backend && python -m pytest api/tests.py -v -k "sick_leave"
```

**Expected Outcomes**:
- All scenarios pass with 100% success rate
- Modal opens within 3 seconds on average
- No console errors in browser devtools
- Works across Chrome, Firefox, Safari, Edge