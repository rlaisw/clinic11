# Tasks: Digital Sick Leave Certificate

**Input**: Design documents from `/specs/002-sick-leave-certificate/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted from all phases.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install new dependencies needed for this feature

- [x] T001 Install `qrcode` Python library in backend venv (`pip install qrcode`)
- [x] T002 [P] Install PDF generation library (`pip install weasyprint`) in backend venv
- [x] T003 Add clinic_name and clinic_address fields to Profile model in `backend/accounts/models.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend infrastructure that all user stories depend on

- [x] T004 Create SickLeaveCertificate model in `backend/api/models.py` with all fields per data-model.md
- [x] T005 [P] Create ShareLink model in `backend/api/models.py` with all fields per data-model.md
- [x] T006 Create SickLeaveCertificateSerializer in `backend/api/serializers.py`
- [x] T007 [P] Create ShareLinkSerializer in `backend/api/serializers.py`
- [x] T008 Create QR code generation utility in `backend/api/utils.py` (HMAC-SHA256 token signing + qrcode image base64)
- [x] T009 [P] Create PDF generation utility in `backend/api/utils.py` (certificate layout with all fields + QR code image)
- [x] T010 Run `python manage.py makemigrations api` and `python manage.py migrate`

**Checkpoint**: Foundation ready — SickLeaveCertificate and ShareLink models exist with serializers, utilities prepared

---

## Phase 3: User Story 1 — Doctor signs and issues certificate (Priority: P1) 🎯 MVP

**Goal**: Doctor can access the Sick Leave Certificate tab, fill the form, and digitally sign to issue a certificate with a unique QR code.

**Independent Test**: Navigate to a patient's page, click the Sick Leave Certificate tab, fill consultation details and diagnosis, click "Sign & Issue" — certificate is saved and QR code appears.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create SickLeaveCertificateViewSet with `sick_leave_certificates` nested action on PatientViewSet in `backend/api/views.py` supporting POST (create) and GET (list)
- [x] T012 [P] [US1] Register sick-leave-certificate routes in `backend/api/urls.py`
- [x] T013 [P] [US1] Add revoke action (`PATCH /sick-leave-certificates/{id}/revoke/`) to SickLeaveCertificateViewSet in `backend/api/views.py` (FR-018)
- [x] T014 [US1] Add SickLeaveCertificate TypeScript interface to `apps/web/lib/types.ts`
- [x] T015 [US1] Create `use-sick-leave-certificate.ts` in `apps/web/hooks/` with `useSickLeaveCertificates`, `useCreateSickLeaveCertificate`, `useRevokeSickLeaveCertificate` hooks
- [x] T016 [US1] Add sick leave certificate Zod validation schema to `apps/web/lib/validations.ts`
- [x] T017 [P] [US1] Add "Sick Leave Certificate" tab link to the tab navigation in `apps/web/app/(dashboard)/doctor/patients/[id]/layout.tsx` (update `currentTab` logic and add Link + conditional render)
- [x] T018 [P] [US1] Create `apps/web/app/(dashboard)/doctor/patients/[id]/sick-leave-certificate/page.tsx` (client component wrapper)
- [x] T019 [US1] Create `apps/web/components/doctor/sick-leave-certificate-tabs.tsx` — main container component that calls hooks and handles state
- [x] T020 [US1] Create `apps/web/components/doctor/sick-leave-certificate-form.tsx` — form component using react-hook-form with patient name/HKID read-only, doctor info read-only, editable consultation_details/diagnosis/recommended_sick_leave, date auto-fill, "Sign & Issue" button

**Checkpoint**: Doctor can sign a certificate and see it saved with a QR code displayed. Certificate can also be revoked.

---

## Phase 4: User Story 2 — Save, print as PDF, and share certificates (Priority: P1)

**Goal**: Doctor can generate a PDF version of the signed certificate, and share it via a time-limited link.

**Independent Test**: After signing a certificate, click "Print" to download PDF, then click "Share" to generate a shareable link — link delivers PDF within 31 days.

### Implementation for User Story 2

- [x] T021 [P] [US2] Add `pdf` action to SickLeaveCertificateViewSet in `backend/api/views.py` (`GET /sick-leave-certificates/{id}/pdf/` returning PDF stream)
- [x] T022 [P] [US2] Create ShareLinkViewSet or add `share-link` action to SickLeaveCertificateViewSet in `backend/api/views.py` (`POST /sick-leave-certificates/{id}/share-link/` + `GET /share/{token}/`)
- [x] T023 [US2] Register share link routes in `backend/api/urls.py`
- [x] T024 [US2] Add ShareLink TypeScript interface and share link API response types to `apps/web/lib/types.ts`
- [x] T025 [US2] Add share link hooks (`useCreateShareLink`, `useDownloadShareLink`) to `apps/web/hooks/use-sick-leave-certificate.ts`
- [x] T026 [US2] Add "Download PDF" button to `sick-leave-certificate-tabs.tsx` that calls the PDF endpoint
- [x] T027 [US2] Add "Share" button and max-views input dialog to `sick-leave-certificate-tabs.tsx` that generates and displays the share URL

**Checkpoint**: Doctor can download PDF and generate a 31-day shareable link.

---

## Phase 5: User Story 3 — QR code verification (Priority: P2)

**Goal**: Anyone can scan the QR code on a certificate to verify its authenticity via a public endpoint.

**Independent Test**: Open a certificate's verification URL — real certificates show "Verified", tampered tokens show "Fake", revoked show "Revoked", expired show "Expired".

### Implementation for User Story 3

- [x] T028 [US3] Add public `verify` endpoint in `backend/api/views.py` (`GET /verify/{qr_code_token}/`) with HMAC signature verification + lookup + status check logic per data-model.md verification flow
- [x] T029 [US3] Register verify route in `backend/api/urls.py` with `AllowAny` permission
- [x] T030 [US3] Add DRF `AnonRateThrottle` to verify endpoint (100 requests/IP/minute) via `rest_framework.throttling`
- [x] T031 [US3] Create a simple verification response page or JSON view — returns structured JSON per contracts/api.md endpoint 8

**Checkpoint**: Scanning a QR code leads to a verification page that returns correct status for active/revoked/expired/fake tokens.

---

## Phase 6: User Story 4 — Search certificates (Priority: P2)

**Goal**: Clinic staff can search certificates by patient name, HKID, or QR code token.

**Independent Test**: Create test certificates, then search by patient name, HKID, and QR token — matching certificates are returned in each case.

### Implementation for User Story 4

- [x] T032 [US4] Add search/filter support to the sick-leave-certificates list endpoint in `backend/api/views.py` using DRF `SearchFilter` or `FilterBackend` on patient_name, patient_hkid, qr_code_token fields
- [x] T033 [US4] Add search UI (input field + results list) to `sick-leave-certificate-tabs.tsx` that calls the search endpoint

**Checkpoint**: Certificates are searchable by all three criteria.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize and verify the complete feature

- [x] T034 Add error handling and user-friendly error messages in `sick-leave-certificate-form.tsx` and `sick-leave-certificate-tabs.tsx` (loading states, validation errors, API failure messages)
- [x] T035 Run quickstart.md validation scenarios to verify end-to-end functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — core feature (MVP)
- **US2 (Phase 4)**: Depends on US1 (needs a signed certificate to print/share)
- **US3 (Phase 5)**: Depends on US1 (needs a certificate with QR code to verify)
- **US4 (Phase 6)**: Depends on US1 (needs certificates in DB to search)
- **Polish (Phase 7)**: Depends on US1, US2, US3, US4

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Depends on US1 (certificate must exist to print/share)
- **US3 (P2)**: Depends on US1 (certificate must exist to verify)
- **US4 (P2)**: Depends on US1 (certificates must exist to search)

### Parallel Opportunities

- T002 + T003 (Setup): Can run in parallel
- T004 + T005 (Models): Can run in parallel
- T006 + T007 (Serializers): Can run in parallel
- T008 + T009 (Utilities): Can run in parallel
- T011 + T012 + T013 (Backend endpoints): Can run in parallel
- T014 + T017 + T018 (Frontend types/layout/page): Can run in parallel
- T021 + T022 (PDF + Share endpoints): Can run in parallel
- T026 + T027 (Print + Share UI buttons): Can run in parallel

---

## Implementation Strategy

### MVP First (Phase 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Doctor can sign a certificate and see the QR code
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Add Phase 3 (US1) → Doctor issues certificates with QR codes (MVP!)
3. Add Phase 4 (US2) → Print/share certificates
4. Add Phase 5 (US3) → QR verification for employers/schools
5. Add Phase 6 (US4) → Search functionality for clinic staff
6. Each phase adds value without breaking previous phases

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Developer A: US1 (Phase 3) — backend model, viewset, frontend tab + form
3. Developer B: Waits for US1 to complete, then US2 — PDF + share link
4. Developer C: Waits for US1 to complete, then US3 — verification endpoint
5. Developer D: US4 (Phase 6) — search

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- [Story] label maps task to specific user story
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Quickstart.md contains detailed validation scenarios for each story
- API contracts are fully documented in `contracts/api.md`