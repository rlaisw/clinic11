# API Contracts: Create Sick Leave Improvement

## 1. SREF Preview Endpoint

### GET `/api/sref-preview/`

Returns a preview of the next SREF (Sick Leave Reference) that would be assigned to a new certificate.

**Authentication**: Bearer token (Doctor permission required)

**Response** (200 OK):
```json
{
  "sref": "S001-0000-0001-0001"
}
```

**Errors**:
- 401: Unauthorized
- 403: Forbidden (Doctor permission required)

---

## 2. Create Sick Leave Certificate (Updated)

### POST `/api/patients/{patient_id}/sick-leave-certificates/`

Creates a new sick leave certificate with optional remarks field.

**Authentication**: Bearer token (Doctor permission required)

**Path Parameters**:
- `patient_id` (string, required): Patient UUID

**Request Body**:
```json
{
  "consultation_details": "string (required)",
  "diagnosis": "string (required)",
  "recommended_sick_leave": "string (required)",
  "remarks": "string (optional, max 500 chars)"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "reference_number": "S001-0000-0001-0001",
  "patient": "patient-uuid",
  "doctor_name": "string",
  "doctor_display_name": "string",
  "doctor_email": "string",
  "doctor_phone": "string",
  "clinic_name": "string",
  "clinic_address": "string",
  "patient_name": "string",
  "patient_hkid": "string",
  "consultation_details": "string",
  "diagnosis": "string",
  "recommended_sick_leave": "string",
  "remarks": "string",
  "issue_date": "2026-07-29",
  "expiry_date": "2036-07-29",
  "qr_code_token": "string",
  "status": "active",
  "signature_timestamp": "2026-07-29T14:00:00Z",
  "revoked_timestamp": null,
  "created_at": "2026-07-29T14:00:00Z",
  "updated_at": "2026-07-29T14:00:00Z"
}
```

**Errors**:
- 400: Validation error (missing required fields)
- 401: Unauthorized
- 403: Forbidden (Doctor permission required)
- 404: Patient not found

---

## Frontend TypeScript Types (Updated)

### `CreateSickLeaveCertificateInput`

```typescript
interface CreateSickLeaveCertificateInput {
  consultation_details: string;
  diagnosis: string;
  recommended_sick_leave: string;
  remarks?: string; // NEW - optional, max 500 chars
}
```

### `SickLeaveCertificate`

```typescript
interface SickLeaveCertificate {
  id: string;
  reference_number: string;
  patient: string;
  doctor_name: string;
  doctor_display_name: string;
  doctor_email: string;
  doctor_phone: string;
  clinic_name: string;
  clinic_address: string;
  patient_name: string;
  patient_hkid: string;
  consultation_details: string;
  diagnosis: string;
  recommended_sick_leave: string;
  remarks: string; // NEW
  issue_date: string; // ISO date
  expiry_date: string; // ISO date
  qr_code_token: string;
  status: 'active' | 'revoked';
  signature_timestamp: string; // ISO datetime
  revoked_timestamp: string | null;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```
