# Data Model: Digital Sick Leave Certificate

## SickLeaveCertificate

Represents an issued digital sick leave certificate for a patient, signed by a doctor.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| patient | FK -> Patient | NOT NULL, indexed | The patient this certificate is for |
| doctor_name | CharField(255) | NOT NULL | Doctor's name (snapshot at signing time) |
| doctor_email | EmailField | NOT NULL | Doctor's email at signing time |
| doctor_phone | CharField(20) | NOT NULL | Doctor's telephone number at signing time |
| clinic_name | CharField(255) | NOT NULL | Clinic name (from doctor's profile) |
| clinic_address | TextField | NOT NULL | Clinic address |
| patient_name | CharField(255) | NOT NULL | Patient's full name at signing time |
| patient_hkid | CharField(20) | NOT NULL | Patient's HKID at signing time |
| consultation_details | TextField | NOT NULL | Description of the consultation |
| diagnosis | TextField | NOT NULL | Medical diagnosis |
| recommended_sick_leave | CharField(255) | NOT NULL | Recommended sick leave duration/period |
| issue_date | DateField | auto_now_add | Date the certificate was issued |
| expiry_date | DateField | NOT NULL | `issue_date + 10 years` |
| qr_code_token | CharField(512) | UNIQUE, NOT NULL | HMAC-SHA256 signed token embedded in QR |
| status | CharField(10) | choices: active/revoked, default=active | Current lifecycle status |
| signature_timestamp | DateTimeField | auto_now_add | When the doctor signed |
| revoked_timestamp | DateTimeField | NULL, blank | When the certificate was revoked (if applicable) |
| created_at | DateTimeField | auto_now_add | Record creation timestamp |
| updated_at | DateTimeField | auto_now | Last update timestamp |

### State Transitions

```
[active] ──(doctor revokes)──> [revoked]
[active] ──(10 years elapsed)──> [expired] (computed, not stored)
```

### Validation Rules

- `expiry_date` MUST be exactly `issue_date + 10 years`
- `qr_code_token` MUST be unique across all certificates
- Status can only transition from `active` to `revoked` (never back)
- All doctor fields are snapshots — they do not change if the doctor updates their profile later

## ShareLink

Represents a time-limited share link for a certificate PDF.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| certificate | FK -> SickLeaveCertificate | NOT NULL, indexed | The certificate being shared |
| token | CharField(64) | UNIQUE, NOT NULL, indexed | Random UUID token for URL |
| expires_at | DateTimeField | NOT NULL | 31 days from creation |
| max_views | PositiveIntegerField | NULL | Max number of times the link can be accessed (NULL = unlimited) |
| view_count | PositiveIntegerField | default=0 | Number of times the link has been accessed |
| is_active | BooleanField | default=True | Can be deactivated by doctor |
| created_at | DateTimeField | auto_now_add | Record creation timestamp |

### Validation Rules

- `expires_at` MUST be `created_at + 31 days`
- View is counted when the PDF download is initiated
- Link is considered expired when `now > expires_at` OR `is_active=False` OR `view_count >= max_views`

## CertificateVerification

Represents the verification record for QR code lookups (could be a View or computed — not stored separately).

### Computed Attributes (not stored as separate model)

| Attribute | Source | Description |
|-----------|--------|-------------|
| verification_token | SickLeaveCertificate.qr_code_token | Token from QR code |
| certificate_ref | SickLeaveCertificate.id | Reference to the certificate |
| patient_visit_date_key | SickLeaveCertificate.patient_id + issue_date | Composite uniqueness key |
| status | SickLeaveCertificate.status | active/revoked/expired |

### Verification Logic

1. Scan QR code → extract `qr_code_token`
2. Verify HMAC-SHA256 signature against server secret
3. If signature invalid → return "Fake — certificate cannot be verified"
4. Look up `SickLeaveCertificate` by `qr_code_token`
5. If not found → return "Fake — certificate cannot be verified"
6. If `status == 'revoked'` → return "This certificate has been revoked"
7. If `now > expiry_date` → return "This certificate has expired"
8. If `status == 'active'` and `now <= expiry_date` → return "Verified by the clinic and signed by doctor" + certificate summary

## Patient

Existing entity (no changes needed). Referenced for: `patient.id`, `patient.first_name + last_name`, `patient.hkid`.

## Doctor

Existing entity via `Profile` on `User` model. Referenced for: `doctor name`, `email`, `phone`, `clinic name`, `clinic address`.

### Note on Clinic Info

The existing `Profile` model does not have clinic name/address fields. These should be added to the `Profile` model in `accounts/` as optional fields, or configured as environment-level settings for a single-clinic deployment. For v1, assume single-clinic: clinic name and address can be set via Django settings or environment variables.