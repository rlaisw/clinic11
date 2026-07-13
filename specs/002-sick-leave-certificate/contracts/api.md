# API Contracts: Digital Sick Leave Certificate

## Base URL

`http://localhost:8000/api`

## Authentication

All doctor-only endpoints require JWT token in `Authorization: Bearer <token>` header. The verification endpoint is public.

## Endpoints

### 1. Create Sick Leave Certificate

Signs and issues a new sick leave certificate.

**POST** `/patients/{patient_id}/sick-leave-certificates/`

**Request Body**:
```json
{
  "consultation_details": "string",
  "diagnosis": "string",
  "recommended_sick_leave": "string"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "patient_name": "string",
  "patient_hkid": "string",
  "consultation_details": "string",
  "diagnosis": "string",
  "recommended_sick_leave": "string",
  "clinic_name": "string",
  "clinic_address": "string",
  "doctor_name": "string",
  "doctor_email": "string",
  "doctor_phone": "string",
  "issue_date": "2026-07-12",
  "expiry_date": "2036-07-12",
  "status": "active",
  "qr_code_base64": "string",
  "signature_timestamp": "2026-07-12T09:00:00Z",
  "created_at": "2026-07-12T09:00:00Z"
}
```

**Errors**:
- 400: Validation error (missing fields)
- 401: Not authenticated
- 403: Not a doctor
- 404: Patient not found

### 2. List Sick Leave Certificates for a Patient

**GET** `/patients/{patient_id}/sick-leave-certificates/`

**Query Params**: `?search=name|hkid`

**Response** (200):
```json
[
  {
    "id": "uuid",
    "patient_name": "string",
    "issue_date": "2026-07-12",
    "diagnosis": "string",
    "status": "active",
    "qr_code_token": "string"
  }
]
```

### 3. Get Single Certificate

**GET** `/sick-leave-certificates/{id}/`

**Response** (200): Full certificate details (same shape as create response without `qr_code_base64`)

### 4. Revoke Certificate

**PATCH** `/sick-leave-certificates/{id}/revoke/`

**Response** (200):
```json
{
  "id": "uuid",
  "status": "revoked",
  "revoked_timestamp": "2026-07-12T10:00:00Z"
}
```

### 5. Generate PDF

**GET** `/sick-leave-certificates/{id}/pdf/`

**Response** (200): `application/pdf` binary stream

### 6. Generate Share Link

**POST** `/sick-leave-certificates/{id}/share-link/`

**Request Body**:
```json
{
  "max_views": 5
}
```

**Response** (201):
```json
{
  "share_url": "http://localhost:8000/api/share/{token}",
  "expires_at": "2026-08-12T09:00:00Z",
  "max_views": 5
}
```

### 7. Download from Share Link

**GET** `/share/{token}/`

**Response** (200): `application/pdf` binary stream (increments view count)

**Errors**:
- 404: Token not found
- 410: Link expired or max views reached
- 410: Link deactivated

### 8. Verify Certificate (Public)

**GET** `/verify/{qr_code_token}/`

**Response** (200):
```json
{
  "verified": true,
  "message": "Verified by the clinic and signed by doctor",
  "certificate": {
    "patient_name": "string",
    "doctor_name": "string",
    "clinic_name": "string",
    "issue_date": "2026-07-12",
    "diagnosis": "string"
  }
}
```

**Response** (200 — fake/tampered):
```json
{
  "verified": false,
  "message": "Fake — certificate cannot be verified"
}
```

**Response** (200 — revoked):
```json
{
  "verified": false,
  "message": "This certificate has been revoked"
}
```

**Response** (200 — expired):
```json
{
  "verified": false,
  "message": "This certificate has expired"
}
```

## Rate Limiting

- **Verification endpoint** (`/verify/`): 100 requests per IP per minute (DRF `AnonRateThrottle`)
- **All other endpoints**: Standard DRF `UserRateThrottle`