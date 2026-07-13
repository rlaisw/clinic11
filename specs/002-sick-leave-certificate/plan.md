# Implementation Plan: Digital Sick Leave Certificate

**Branch**: `002-sick-leave-certificate` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

**Note**: This plan covers the full-stack implementation of the Sick Leave Certificate tab at `/doctor/patients/[id]/sick-leave-certificate`, including backend API, frontend tab, QR code generation/verification, PDF generation, and shareable links.

## Summary

Add a 5th tab ("Sick Leave Certificate") to the doctor patient detail page. The doctor fills a pre-printed certificate form, signs it digitally, and the system generates a unique encrypted QR code, saves the record, produces a PDF, and provides 31-day limited-view share links. A public verification endpoint lets anyone scan the QR code to confirm authenticity. Certificates can be revoked by the doctor and expire after 10 years.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.9 (frontend)

**Primary Dependencies**: Django 6.0, Django REST Framework 3.17, React 19, Next.js 16, TanStack React Query 5, Shadcn UI, Axios, Zod

**Storage**: SQLite (dev) / PostgreSQL (prod) via Django ORM

**Testing**: pytest / django.test.TestCase (backend), Jest (frontend)

**Target Platform**: Web — Next.js SSR frontend + Django REST API backend

**Project Type**: Full-stack web application (Turborepo monorepo)

**Performance Goals**: QR verification returns result within 3 seconds (SC-004). Certificate search returns results within 5 seconds (SC-005).

**Constraints**: Verification endpoint rate-limited to 100 requests per IP per minute (FR-012). Certificates expire 10 years from issue date (FR-007). Share link valid for 31 days with single-use or limited views (FR-011).

**Scale/Scope**: Single-clinic deployment. English-only for initial release. ~10 doctors, hundreds of certificates per month.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a template with no filled-in constraints. No gates to evaluate. Proceed.

## Project Structure

### Documentation (this feature)

```text
specs/002-sick-leave-certificate/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 API contracts
└── checklists/          # Quality checklists
```

### Source Code (repository root)

```text
backend/api/
├── models.py            # + SickLeaveCertificate model
├── serializers.py       # + SickLeaveCertificateSerializer
├── views.py             # + SickLeaveCertificateViewSet + verification endpoint
├── urls.py              # + certificate routes + verification route
├── utils.py             # + QR code generation + PDF generation utility
└── tests.py             # + SickLeaveCertificate tests

apps/web/app/(dashboard)/doctor/patients/[id]/
├── layout.tsx           # + Sick Leave Certificate tab link + conditional render
└── sick-leave-certificate/
    └── page.tsx         # New tab page

apps/web/components/doctor/
├── sick-leave-certificate-tabs.tsx  # New component
└── sick-leave-certificate-form.tsx  # New form component

apps/web/hooks/
├── use-patient-background.ts        # + sick leave certificate hooks
└── use-sick-leave-certificate.ts    # New hooks file

apps/web/lib/
├── types.ts             # + SickLeaveCertificate types
└── validations.ts       # + SickLeaveCertificate validation schema
```

**Structure Decision**: Web application pattern (frontend + backend) — follows the existing project convention.

## Complexity Tracking

No constitution violations to justify.