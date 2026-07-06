# CMS: Patients Module Implementation Plan

This plan covers pre-setup validation, a phased AI-prompt roadmap, and testing steps for building the **Patients Module** into the existing Clinic Management System.

---

## Phase 0: Pre-Setup Validation

Run these commands **before starting any coding** to guarantee the environment is fully prepared.

### 1. Validate Node.js & pnpm (Frontend)

```powershell
node --version          # must be >= 18
pnpm --version          # must be >= 10.19.0
cd C:\kilocode\clinic11
pnpm install            # installs all workspace dependencies
pnpm run lint           # should complete without errors
pnpm run check-types    # should complete without errors
```

### 2. Validate Python & Django (Backend)

```powershell
cd C:\kilocode\clinic11\backend
python --version                 # must be >= 3.11
# Activate venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt  # installs Django, DRF, JWT, etc.
python manage.py check           # should show "System check identified no issues (0 silenced)."
python manage.py migrate         # should apply cleanly
test                                 # --- Quick smoke test ---
python manage.py shell -c "
import django
print('Django version:', django.get_version())
print('API app status: OK')
exit()
"
```

### 3. Validate Environment Variables

| File | Required Keys | Notes |
|------|---------------|-------|
| `C:\kilocode\clinic11\apps\web\.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:8000/api` | Create if missing |
| `C:\kilocode\clinic11\backend\.env` | `DEBUG=True`, `SECRET_KEY=...`, `DATABASE_URL=sqlite:///db.sqlite3` | Ensure present |

```powershell
# Verify .env presence
Test-Path -Path "C:\kilocode\clinic11\apps\web\.env.local"
Test-Path -Path "C:\kilocode\clinic11\backend\.env"
```

### 4. Validate Running Services (Sanity Check)

```powershell
# Terminal 1: Start backend
Set-Location C:\kilocode\clinic11\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2: Start frontend
Set-Location C:\kilocode\clinic11
pnpm run dev

# Terminal 3: Send a probe
Invoke-RestMethod -Uri "http://localhost:8000/" -Method GET
Invoke-RestMethod -Uri "http://localhost:3001" -Method GET
```

>If any step above fails, stop and fix the dependency or environment issue before proceeding to Phase 1.

---

## Phase 1: Backend — Patient Django Models & Initial Migration

### 1. Goal Description
Define the foundational `Patient` model and associated models (`MedicalHistory`, `EmergencyContact`) in the Django `api` app. Generate and run the initial migration to create the database tables.

### 2. AI Prompts

> **Prompt for Backend (Django Models):**
> "Create a `Patient` model in `backend/api/models.py` for a clinic management system. The model must include the following fields:
> - `id` (AutoField, primary key)
> - `first_name` (CharField, max_length=100)
> - `last_name` (CharField, max_length=100)
> - `date_of_birth` (DateField)
> - `gender` (CharField, choices=(`M`, `F`, `O`), max_length=1)
> - `address` (TextField, optional/blank=True)
> - `phone` (CharField, max_length=20)
> - `email` (EmailField, optional/blank=True, unique)
> - `blood_type` (CharField, max_length=5, optional)
> - `allergies` (TextField, optional)
> - `timestamp` (DateTimeField, auto_now_add=True), `updated` (DateTimeField, auto_now=True)
>
> Also create a `MedicalHistory` model with a ForeignKey to `Patient` containing fields: `condition`, `diagnosis_date`, `notes` and a `EmergencyContact` model with fields: `patient` (FK), `name`, `relationship`, `phone`.
> Ensure the models use `django.db.models` and set `__str__` on `Patient` to return the full name."

> **Prompt for Migrations:**
> "After updating the models, generate the migration with `python manage.py makemigrations`, review the auto-generated file for correctness (e.g., field types, on_delete=CASCADE), and then run `python manage.py migrate` to apply it to SQLite."

### 3. Actionable Steps

1. Open `C:\kilocode\clinic11\backend\api\models.py`.
2. Replace placeholder content with the `Patient`, `MedicalHistory`, and `EmergencyContact` model classes.
3. Save file.
4. Run `python manage.py makemigrations`.
5. Inspect the generated `0002_initial_patients.py` migration.
6. Run `python manage.py migrate` to update `db.sqlite3`.

### 4. File Structure Update

```
backend/
└── api/
    ├── models.py                 # <- new Patient, MedicalHistory, EmergencyContact models added
    └── migrations/
        ├── 0001_initial.py       # existing
        └── 0002_initial_patients.py  # <- new migration created
```

### 5. Verification & Testing Steps

```powershell
Set-Location C:\kilocode\clinic11\backend
.\venv\Scripts\Activate.ps1
python manage.py migrate --dry-run      # preview first
python manage.py migrate
python manage.py shell -c "from api.models import Patient; print(Patient.objects.count())"
# Expected output: 0 (empty table, no errors)
```

---

## Phase 2: Backend — Django REST Framework Serializers, ViewSets & URL Wiring

### 1. Goal Description
Expose the `Patient` data via a fully-functional REST API using Django REST Framework `ModelSerializer` and `ModelViewSet`, with nested read-only `MedicalHistory` and `EmergencyContact`.

### 2. AI Prompts

> **Prompt for Serializers:**
> "In `backend/api/serializers.py`, create three serializers:
> 1. `MedicalHistorySerializer` (ModelSerializer for `api.models.MedicalHistory`, fields all).
> 2. `EmergencyContactSerializer` (ModelSerializer for `api.models.EmergencyContact`, fields all).
> 3. `PatientSerializer` (ModelSerializer for `api.models.Patient`) with `medical_history` and `emergency_contacts` as nested read-only using the above serializers (source `patient.medicalhistory_set` and `patient.emergencycontact_set`). Include fields for all Patient model attributes."

> **Prompt for ViewSets:**
> "In `backend/api/views.py`, create a `PatientViewSet` extending `ModelViewSet`. Use `PatientSerializer` and `Patient.queryset = Patient.objects.all()`. Add a custom `search` filter parameter (`?search=`) on `first_name`, `last_name`, and `email` via `SearchFilter`."

> **Prompt for URL Wiring:**
> "Register the `PatientViewSet` in `backend/api/urls.py` using a `DefaultRouter`. The endpoint should be at `/api/patients/`. Ensure `config/urls.py` already includes `path('api/', include('api.urls'))`."

### 3. Actionable Steps

1. Create `backend/api/serializers.py`.
2. Update `backend/api/views.py` to replace stub content with `PatientViewSet`.
3. Update `backend/api/urls.py` with DRF router.
4. Run backend server and test endpoints manually via browser or cURL.

### 4. File Structure Update

```
backend/
└── api/
    ├── __init__.py
    ├── urls.py                 # <- updated with DRF router + PatientViewSet
    ├── views.py                # <- updated with PatientViewSet + SearchFilter
    ├── models.py               # already updated in Phase 1
    └── serializers.py          # <- new file (Patient, nested serializers)
```

### 5. Verification & Testing Steps

```powershell
Set-Location C:\kilocode\clinic11\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# In another terminal:
Invoke-RestMethod -Uri "http://localhost:8000/api/patients/" -Method GET
# Expected: 200, JSON list, empty array `[]` initially

# Test POST:
Invoke-RestMethod -Uri "http://localhost:8000/api/patients/" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"first_name":"Alice","last_name":"Smith","date_of_birth":"1990-05-20","gender":"F","phone":"555-1234"}'
# Expected: 201, returns created patient object
```

---

## Phase 3: Frontend — Patient TypeScript Types, Zod Schema & API Service

### 1. Goal Description
Define strict TypeScript interfaces and Zod schemas for `Patient`, `MedicalHistory`, and `EmergencyContact`. Create a centralized Axios API client and the React Query hooks (`usePatients`, `useCreatePatient`, etc.).

### 2. AI Prompts

> **Prompt for Types & Zod:**
> "In `apps/web/src/lib/types.ts`, define TypeScript interfaces `Patient`, `MedicalHistory`, `EmergencyContact`, and `CreatePatientInput`. Then in `apps/web/src/lib/validations.ts`, create Zod schemas mirroring these interfaces (`patientSchema`, `medicalHistorySchema`, `emergencyContactSchema`) with appropriate `.min()`, `.email()` validations. Export inferred types from Zod using `z.infer<>`."

> **Prompt for API Client:**
> "Create `apps/web/src/lib/api.ts`. Initialize an `axios` instance with `baseURL: process.env.NEXT_PUBLIC_API_URL`. Attach an `Authorization` header interceptor that reads `accessToken` from `localStorage` (if present) and prepends `Bearer`. Use standard DRF token endpoints for refresh on 401. Export the axios instance as `apiClient`."

> **Prompt for React Query Hooks:**
> "Create `apps/web/src/hooks/use-patients.ts` with the following hooks using Tanstack React Query:
> - `usePatients(search?: string)` — query hook for `GET /patients/`.
> - `useCreatePatient()` — mutation hook for `POST /patients/`.
> - `usePatient(id: string)` — query hook for `GET /patients/{id}/`.
> - `useUpdatePatient(id: string)` — mutation hook for `PATCH /patients/{id}/`.
> - `useDeletePatient(id: string)` — mutation hook for `DELETE /patients/{id}/`.
> Ensure each mutation properly invalidates the `['patients']` query cache on success."

### 3. Actionable Steps

1. Create `apps/web/src/lib/types.ts`.
2. Create `apps/web/src/lib/validations.ts`.
3. Create `apps/web/src/lib/api.ts` with Axios setup.
4. Create `apps/web/src/hooks/use-patients.ts`.
5. Create `apps/web/src/hooks/use-medical-history.ts` (optional if handled inside `use-patients`).

### 4. File Structure Update

```
apps/web/src/
├── lib/
│   ├── types.ts            # <- new (Patient, MedicalHistory, EmergencyContact types)
│   ├── validations.ts      # <- new (Zod schemas)
│   └── api.ts              # <- new (Axios instance & DRF auth interceptors)
└── hooks/
    ├── use-patients.ts     # <- new (React Query CRUD hooks)
    └── use-medical-history.ts   # <- new
```

### 5. Verification & Testing Steps

```powershell
Set-Location C:\kilocode\clinic11
pnpm run check-types
# Expected: zero TypeScript errors

pnpm run lint
# Expected: zero ESLint errors

# Runtime test
# Start both frontend and backend, then open browser at `http://localhost:3001`.
# Open browser DevTools > Network, reload page.
# Expected: React Query fetches `http://localhost:8000/api/patients/` via Axios and caches result.
```

---

## Phase 4: Frontend — Patient Dashboard Pages & UI Components

### 1. Goal Description
Build the visible UI surface: a patient list page (`/patients`), detail page (`/patients/[id]`), and create/edit modals. Integrate shadcn/ui `Table`, `Dialog`, `Form`, `Button`, `Input`, `Sheet`, `Sidebar`, etc.

### 2. AI Prompts

> **Prompt for List Page:**
> "Create `apps/web/src/app/(dashboard)/patients/page.tsx`. This Next.js App Router page (Server Component shell) should:
> 1. Use a React Server Component wrapper that fetches `Patient` via React Query `usePatients('')` only in client components.
> 2. Build a `PatientTable` client component with `shadcn/ui <Table>` showing columns: Full Name, Date of Birth, Gender, Phone, Email, Actions.
> 3. Include a search `<Input>` bound to a state that filters/searches via `usePatients(debouncedSearch)`."

> **Prompt for Detail / Edit Modal:**
> "Create `apps/web/src/app/(dashboard)/patients/[id]/page.tsx` (dynamic segment). Build a `PatientDetail` page that:
> - Calls `usePatient(id)` to load data.
> - Displays patient card with `MedicalHistory` and `EmergencyContact` nested tables.
> - Has an 'Edit' button opening a `shadcn/ui <Dialog>` with a `react-hook-form` form (`zodResolver`) for editing patient fields.
> - On submit, call `useUpdatePatient(id)` mutation."

> **Prompt for Create Modal:**
> "Build a reusable `CreatePatientModal` client component (`apps/web/src/components/patients/create-patient-modal.tsx`) using `shadcn/ui <Dialog>`, `react-hook-form`, and `zodResolver(patientSchema)`. Steps:
> 1. Form fields for all required `Patient` attributes.
> 2. On submit, call `useCreatePatient()`.
> 3. Close the dialog and invalidates the patient list cache on success.
> 4. Show a `shadcn/ui` toast/alert on error."

> **Prompt for Sidebar Entry:**
> "Open `apps/web/src/components/app-sidebar.tsx` and add a new navigation item under 'Patients' linking to `/patients`. Use a `Lucide` user or heart icon. Ensure it renders inside the dashboard sidebar properly."

### 3. Actionable Steps

1. Create `apps/web/src/app/(dashboard)/patients/page.tsx`.
2. Create `apps/web/src/app/(dashboard)/patients/[id]/page.tsx`.
3. Create client sub-components in `apps/web/src/components/patients/`:
   - `patient-table.tsx`
   - `create-patient-modal.tsx`
   - `patient-detail-card.tsx`
   - `medical-history-list.tsx`
4. Update `app-sidebar.tsx` with new `Patients` navigation group.
5. Ensure all client-interactive pieces are marked with `"use client"` directive.

### 4. File Structure Update

```
apps/web/src/
├── app/(dashboard)/
│   └── patients/
│       ├── page.tsx            # <- new (patient list)
│       └── [id]/
│           └── page.tsx        # <- new (patient detail/edit)
└── components/
    └── patients/
        ├── create-patient-modal.tsx    # <- new
        ├── patient-table.tsx           # <- new
        ├── patient-detail-card.tsx     # <- new
        ├── medical-history-list.tsx    # <- new
        └── emergency-contact-card.tsx  # <- new (optional)
```

### 5. Verification & Testing Steps

```powershell
cd C:\kilocode\clinic11
pnpm run check-types
pnpm run lint
pnpm run dev

# Manual UI checklist:
# 1. Visit `http://localhost:3001/patients`
#    - Table should render with header and empty state.
# 2. Click 'Add Patient' → fill modal → submit.
#    - Expected: new row appears in table without full page reload.
# 3. Click a row → visit detail page.
#    - Expected: patient data populates; nested medical history shown.
# 4. Click 'Edit' → modify name → submit.
#    - Expected: table cache invalidates, detail view updates.
# 5. Soft-delete test: click 'Delete' → confirm → row disappears.
#    - Expected: React Query optimistically removes row.
```

---

## Phase 5: Integration, Seed Data & End-to-End Validation

### 1. Goal Description
Populate the SQLite database with realistic fake patient data using Faker. Perform a complete end-to-end integration test and resolve any routing, serialization, or CORS issues.

### 2. AI Prompts

> **Prompt for Seed Command:**
> "Create a custom Django management command `seed_patients` inside `backend/api/management/commands/seed_patients.py`. Use `Faker` to generate:
> - 50 realistic `Patient` records (random names, birthdays, genders, addresses, phones, emails).
> - 1-3 `MedicalHistory` entries linked to each patient.
> - 1 `EmergencyContact` per patient.
> Run the command with `python manage.py seed_patients`. Ensure it is idempotent (truncate table first)."

> **Prompt for CORS / Integration fix:**
> "Inspect `backend/config/settings.py`. Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3001` and `http://localhost:3000`. If any 403 occurs during frontend fetch, verify the JWT middleware order and CORS middleware is placed before `CommonMiddleware`."

### 3. Actionable Steps

1. Create `backend/api/management/commands/seed_patients.py`.
2. Run the seed command to generate 50+ records.
3. Open `http://localhost:3001/patients` and verify table is populated.
4. Test pagination or infinite scroll if implemented.
5. Audit any `console.error` or network 4xx/5xx in DevTools.

### 4. File Structure Update

```
backend/
└── api/
    └── management/
        ├── __init__.py
        └── commands/
            ├── __init__.py
            └── seed_patients.py    # <- new
```

### 5. Verification & Testing Steps

```powershell
# Run seed
Set-Location C:\kilocode\clinic11\backend
.\venv\Scripts\Activate.ps1
python manage.py seed_patients
# Terminal output: "Created 50 patients"

# Verify records in Django admin
python manage.py runserver
# Navigate to http://localhost:8000/admin (log in with a superuser)
# Verify Patient count and nested inlines.

# Frontend end-to-end
Set-Location C:\kilocode\clinic11
pnpm run dev
# Open http://localhost:3001/patients
# Expected: data table renders with 50 rows, search filters correctly, detail page navigable.
```

---

## Appendix: Testing Matrix per Phase

| Phase | Test Type | Command / Manual Step |
|-------|-----------|------------------------|
| 1 | Model Creation | `python manage.py migrate` + shell count |
| 1 | Migration Integrity | `python manage.py makemigrations --dry-run` |
| 2 | API GET | `Invoke-RestMethod http://localhost:8000/api/patients/` |
| 2 | API POST | `Invoke-RestMethod ... -Method POST -Body '{"first_name":"Test"}'` |
| 3 | Type checks | `pnpm run check-types` |
| 3 | Lint checks | `pnpm run lint` |
| 3 | React Query DevTools | Inspect cache keys in browser |
| 4 | UI Smoke | Navigate `/patients`, modal open/close/submit |
| 4 | Frontend Build | `pnpm run build` in `apps/web/` |
| 5 | Seed | `python manage.py seed_patients` |
| 5 | Full E2E | Frontend table renders seeded data |

---

## Final: Checklist Before Calling Feature Complete

- [ ] Backend `Patient`, `MedicalHistory`, `EmergencyContact` models exist and migrated.
- [ ] DRF `PatientViewSet` exposes CRUD with search at `/api/patients/`.
- [ ] TypeScript types & Zod schemas compile with zero errors.
- [ ] React Query hooks perform CRUD and invalidate cache.
- [ ] Dashboard sidebar has a clickable 'Patients' entry.
- [ ] Patient list, detail, create, and edit UI fully functional.
- [ ] Seed data populates realistic clinic records.
- [ ] `pnpm run build` completes for `apps/web/`.
- [ ] No unhandled 4xx/5xx errors in browser DevTools.
