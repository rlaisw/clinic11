# Research: Digital Sick Leave Certificate

## Technology Decisions

### QR Code Generation
- **Decision**: Use `qrcode` Python library (pure Python, no external service dependency)
- **Rationale**: No external API calls needed for QR generation. The QR code encodes a cryptographically signed verification token (HMAC-SHA256) combining patient ID, visit date, and a server-side secret.
- **Alternatives considered**: External QR API service (adds latency and dependency), manual generation (error-prone)

### PDF Generation
- **Decision**: Use `weasyprint` or `reportlab` for server-side PDF generation
- **Rationale**: Full control over layout/template, no external service dependency, integrates with Django
- **Alternatives considered**: Client-side HTML-to-PDF (browser-dependent), external PDF API (cost, latency)

### Verification Token Signing
- **Decision**: HMAC-SHA256 signed token embedded in QR code
- **Rationale**: Symmetric key approach is simple, no need for public key infrastructure. Token includes `{patient_id}|{visit_date}|{expiry}|{nonce}` signed with server secret.
- **Alternatives considered**: JWT (heavier), RSA signing (key management overhead)

### Share Link Mechanism
- **Decision**: Server-generated UUID token stored in DB, linked to certificate record
- **Rationale**: Simple, revocable, no external storage needed. Token has expiry timestamp and view count limit.
- **Alternatives considered**: Signed URL with expiry in JWT (harder to revoke), cloud presigned URL (external dependency)

## Dependency Analysis

### Existing Backend API Patterns
- All patient-scoped resources use nested actions on `PatientViewSet` (e.g., `patients/{id}/prescriptions/`)
- Doctor-only actions use `DoctorPermission` (role-based access)
- Follow these conventions for the sick leave certificate endpoints

### Existing Frontend Patterns
- Tab layout uses `Link` navigation with `border-b-2` active indicator
- Data fetching uses TanStack React Query with per-patient query keys
- Forms use `react-hook-form` with Zod validation schemas
- Follow all existing patterns for consistency

## Decisions Log

| Decision | Value | Rationale |
|----------|-------|-----------|
| QR library | `qrcode` (Python) | Pure Python, no external deps |
| PDF library | `weasyprint` or `reportlab` | Server-side, full control |
| Token signing | HMAC-SHA256 | Simple, no PKI |
| Share link | DB-stored UUID token | Revocable, no external deps |
| Verification endpoint | Public GET with token param | No auth needed for verifiers |
| Rate limiting | Django throttle classes (100/IP/min) | Built-in DRF support |