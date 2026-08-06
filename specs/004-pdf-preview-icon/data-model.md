# Data Model: PDF Preview Icon

## Frontend State (Not Persisted)

### SickLeaveCertificatePreviewModal
Manages the state of the PDF preview modal for sick leave certificates.

#### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| isOpen | boolean | false | Whether the modal is currently displayed |
| patientId | string | null | The ID of the patient whose certificate is being previewed |
| pdfUrl | string | null | The URL to fetch the PDF (from API endpoint) |
| loadingState | 'idle' \| 'loading' \| 'success' \| 'error' | 'idle' | Current loading state of PDF |
| error | Error \| null | null | Error object if PDF loading failed |
| zoomLevel | number | 1.0 | Current zoom level for pinch-to-zoom |
| panPosition | { x: number; y: number } | {0, 0} | Current pan position for touch dragging |

#### State Transitions

```
[idle] ──(openModal)──> [loading] ──(PDF loads)──> [success]
[loading] ──(error)──> [error]
[error] ──(retry)──> [loading]
[success/error] ──(closeModal)──> [idle]
```

#### Validation Rules

- `patientId` MUST be a valid UUID when `isOpen` is true
- `pdfUrl` MUST be generated from `/api/sick-leave-certificates/{certificateId}/pdf`
- `zoomLevel` MUST be clamped between 0.5 and 3.0

## Existing Backend Models (Reused)

### SickLeaveCertificate
Already defined in spec 002-sick-leave-certificate. No changes needed.

Key fields relevant to this feature:
- `id` (UUID) - Certificate identifier
- `patient` (FK) - Patient reference
- `qr_code_token` (CharField) - HMAC-SHA256 token for verification
- `status` (CharField) - active/revoked
- `expiry_date` (DateField) - issue_date + 10 years

The existing PDF generation endpoint at `GET /api/sick-leave-certificates/{certificateId}/pdf` returns the PDF content directly.

## API Integration Points

### GET /api/sick-leave-certificates/{certificateId}/pdf

| Aspect | Specification |
|--------|---------------|
| Method | GET |
| Auth | DoctorPermission (requires authenticated doctor) |
| Response | application/pdf (binary) |
| Errors | 401 (unauthenticated), 403 (not doctor), 404 (no certificate), 500 (generation error) |

This endpoint takes the certificate ID and returns the PDF content directly for preview.