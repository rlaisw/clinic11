# Data Model: Receipt Feature

## Overview
This document describes the data model for the receipt feature, including all entities, fields, relationships, and validation rules.

## Entities

### Receipt
The main entity representing a financial receipt issued to a patient.

#### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID (Primary Key) | Unique identifier for the receipt | Auto-generated |
| patient | Foreign Key (Patient) | Reference to the patient | Required, on_delete=CASCADE |
| patient_name | CharField (max_length=255) | Patient's full name | Required |
| patient_hkid | CharField (max_length=20) | Patient's HKID | Required |
| date | DateField | Date of receipt generation | Auto-set to today |
| rref | CharField (max_length=32, unique=True) | Receipt Reference Number | Auto-generated format: RYYYY-XXXX-XXXX-XXXX |
| doctor_name | CharField (max_length=255) | Doctor's full name | From request.user |
| doctor_display_name | CharField (max_length=255) | Doctor's display name | From profile, default '' |
| doctor_email | EmailField | Doctor's email address | From request.user |
| doctor_phone | CharField (max_length=20) | Doctor's phone number | From profile |
| clinic_name | CharField (max_length=255) | Clinic name | From profile |
| clinic_address | TextField | Clinic address | From profile |

#### Financial Fields
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| total_free | DecimalField (max_digits=10, decimal_places=2) | Total amount before deductions | Required |
| consultation | TextField | Consultation description | Required |
| medications | TextField | Medications description | Optional |
| investigations | TextField | Investigations description | Optional |
| procedures | TextField | Procedures description | Optional |
| misc | TextField | Miscellaneous description | Optional |
| consultation_free | DecimalField (max_digits=10, decimal_places=2) | Consultation deduction amount | Default: 0 |
| medications_free | DecimalField (max_digits=10, decimal_places=2) | Medications deduction amount | Default: 0 |
| investigations_free | DecimalField (max_digits=10, decimal_places=2) | Investigations deduction amount | Default: 0 |
| procedures_free | DecimalField (max_digits=10, decimal_places=2) | Procedures deduction amount | Default: 0 |
| misc_free | DecimalField (max_digits=10, decimal_places=2) | Miscellaneous deduction amount | Default: 0 |
| total_dollars | TextField | Total amount in English words (e.g., "One thousand two hundred thirty-four dollars") | Required |
| diagnosis | TextField | Diagnosis description | Required |

#### System Fields
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| qr_code_token | CharField (max_length=512, unique=True) | Unique token for QR code generation | Auto-generated, unique |
| status | CharField (max_length=10, choices=[('active', 'Active'), ('revoked', 'Revoked'), ('expired', 'Expired')]) | Receipt status | Default: 'active' |
| signature_timestamp | DateTimeField | When receipt was generated/signed | Auto-set on creation |
| created_at | DateTimeField | Record creation timestamp | Auto-set |
| updated_at | DateTimeField | Last update timestamp | Auto-updated |

### ReceiptCounter
Helper entity for generating sequential receipt numbers.

#### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | AutoField (Primary Key) | Counter identifier | Always 1 |
| last_sequence | BigIntegerField | Last sequence number used | Default: 0 |

## Relationships

### Receipt → Patient
- **Type**: Many-to-one
- **Description**: Each receipt belongs to exactly one patient
- **Foreign Key**: `patient` field in Receipt model
- **Related Name**: `receipts` (Patient can access all receipts via `patient.receipts.all()`)
- **On Delete**: CASCADE (deleting patient deletes their receipts)

### Patient → Receipt
- **Type**: One-to-many
- **Description**: Each patient can have multiple receipts over time
- **Access Pattern**: `patient.receipts.all()`

## Validation Rules

### Field-Level Validation
1. `patient_name`: Required, max 255 characters
2. `patient_hkid`: Required, max 20 characters
3. `total_free`: Required, positive decimal
4. `consultation`: Required, non-empty text
5. `diagnosis`: Required, non-empty text
6. `total_dollars`: Required, matches English word representation of total_free
7. `qr_code_token`: Required, unique across all receipts
8. `status`: Required, must be one of ['active', 'revoked', 'expired']

### Cross-Field Validation
1. `total_free` must equal the sum of all financial fields minus deductions:
   ```
   total_free = consultation + medications + investigations + procedures + misc
               - consultation_free - medications_free - investigations_free
               - procedures_free - misc_free
   ```

### State Transition Rules
1. **Created** → **active** (automatic on creation)
2. **active** → **revoked** (doctor action via API endpoint)
3. **active** → **expired** (automatic, 10 years from date field)
4. **revoked** → No further transitions (terminal state)
5. **expired** → No further transitions (terminal state)

## Indexes
For performance optimization, the following indexes should be created:
1. `patient_id` (foreign key) - for patient-based queries
2. `qr_code_token` (unique) - for fast verification lookups
3. `status` - for filtering active/revoked/expired receipts
4. `date` - for date-range queries
5. `rref` (unique) - for receipt reference lookups

## Storage Considerations
- Receipt metadata is persisted in the database
- PDF files are generated on-demand (not stored)
- QR code tokens are stored as text in the database
- All monetary values stored as Decimals for precision
- Date fields use native Date types

## Audit Trail
All receipt records maintain:
- Creation timestamp (signature_timestamp)
- Last update timestamp (updated_at)
- Status history (implicit through status field)
- Link to originating patient record

## Security Considerations
- Receipts are isolated by patient - doctors can only access receipts for their patients
- QR code verification endpoint is public but rate-limited
- Sensitive financial data (total_free, etc.) is only accessible via authenticated API endpoints
- No personal health information (PHI) is stored beyond what's needed for the receipt