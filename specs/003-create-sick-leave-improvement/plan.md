# Implementation Plan: Create Sick Leave Improvement

**Branch**: `003-create-sick-leave-improvement` | **Date**: 2026-07-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-create-sick-leave-improvement/spec.md`

## Summary

Add two improvements to the "create sick leave" screen:
1. **SREF Display** — Automatically generate and display a unique Sick Leave Reference (SREF) on the create screen before certificate issuance
2. **Remarks Field** — Add a new textarea field labeled "Remarks" to the certificate form

The SREF is already generated server-side upon certificate creation (via `generate_reference_number`), but it's not displayed on the create screen. The fix involves generating a preview SREF client-side or via an API endpoint before form submission, and adding the remarks field to the form and backend.

## Technical Context

**Language/Version**: Python 3.14 (Django 6.0.6 backend), TypeScript/React 19 (Next.js 16.2.0 frontend)

**Primary Dependencies**:
- Backend: Django REST Framework, Django ORM, reportlab (PDF generation), qrcode
- Frontend: React Hook Form, TanStack Query, Shadcn UI components

**Storage**: PostgreSQL (primary), SQLite (dev)

**Testing**: pytest (backend), Jest (frontend)

**Target Platform**: Linux server (backend), Web browser (frontend)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: SREF generation under 10ms, form load under 500ms

**Constraints**: SREF must be unique across all certificates

**Scale/Scope**: 100+ doctors, 1000+ patients, 50+ certificates per day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- No new libraries or frameworks required
- Uses existing patterns (React Hook Form, Django REST API)
- No breaking changes to existing API contracts

## Project Structure

### Documentation (this feature)

```text
specs/003-create-sick-leave-improvement/
+-- plan.md              # This file (/speckit.plan command output)
+-- research.md          # Phase 0 output (/speckit.plan command)
+-- data-model.md        # Phase 1 output (/speckit.plan command)
+-- quickstart.md        # Phase 1 output (/speckit.plan command)
+-- contracts/           # Phase 1 output (/speckit.plan command)
¦   +-- api.md
+-- tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/
+-- components/
¦   +-- doctor/
¦       +-- sick-leave-certificate-tabs.tsx   # Form component to modify
+-- hooks/
¦   +-- use-sick-leave-certificate.ts          # API hooks to extend
+-- lib/
    +-- types.ts                               # TypeScript types to extend

backend/
+-- api/
¦   +-- models.py                              # SickLeaveCertificate model (add remarks field)
¦   +-- serializers.py                         # Add remarks to serializer
¦   +-- views.py                               # Add SREF preview endpoint
¦   +-- utils.py                               # generate_reference_number (reuse for preview)
```

**Structure Decision**: The project follows a standard frontend/backend structure. The frontend is in `apps/web/` and the backend is in `backend/`. Changes will be made to the existing sick leave certificate components and API endpoints.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | No complexity violations | N/A |
