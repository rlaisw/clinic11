# API Contracts: Receipt Feature

## Overview
This document defines the external API contracts for the receipt feature. These contracts specify how other components interact with the receipt generation and verification system.

## Public API Endpoints

### POST /api/receipts/
- **Purpose**: Generate a new receipt for a patient
- **Authentication**: DoctorPermission required
- **Request Body Fields**:
  - patient_id (UUID) - Required
  - consultation (string) - Required
  - diagnosis (string) - Required
  - recommended_sick_leave (string) - Required
  - consultation_free (number) - Optional
  - medications_free (number) - Optional
  - investigations_free (number) - Optional
  - procedures_free (number) - Optional
  - misc_free (number) - Optional
  - total_dollars (string) - Required (English words)
  - diagnosis (string) - Required
  - qr_code_token (auto-generated)
- **Response (201 Created)**:
  ```json
  {
    "receipt_id": "UUID",
    "rref": "RYYY-XXXX-XXXX-XXXX",
    "pdf_url": "/api/receipts/{id}/pdf",
    "qr_code_token": "token_for_verification",
    "status": "active"
  }
  ```
- **Authentication**: DoctorPermission
- **Validation Errors**:
  - 400 Bad Request: Missing required fields or invalid format
  - 403 Forbidden: User not authorized

### GET /api/receipts/{id}/
- **Purpose**: Retrieve receipt details by ID
- **Authentication**: DoctorPermission required
- **Response**:
  ```json
  {
    "id": "UUID",
    "rref": "RYYY-XXXX-XXXX-XXXX",
    "patient_name": "Full Name",
    "date": "2026-08-07",
    "doctor_name": "Dr. Name",
    "doctor_email": "dr@clinic.com",
    "doctor_phone": "123-456-7890",
    "clinic_name": "Clinic Name",
    "clinic_address": "123 Main St",
    "patient_name": "Patient Name",
    "patient_hkid": "HK123",
    "consultation_details": "Consultation description",
    "diagnosis": "Diagnosis description",
    "quantities": {
      "consultation_free": 0.00,
      "medications_free": 0.00,
      "investigations_free": 0.00,
      "procedures_free": 0.00,
      "misc_free": 0.00,
      "total_dollars": "One thousand two hundred thirty-four dollars"
    },
    "qr_code_token": "unique_token_value",
    "status": "active"
  }
  ```
- **Error Responses**:
  - 400 Bad Request: Invalid ID format
  - 403 Forbidden: User not authorized
  - 404 Not Found: Receipt not found

### GET /api/receipts/{id}/pdf
- **Purpose**: Generate PDF version of receipt
- **Authentication**: DoctorPermission required
- **Response**:
  - Binary PDF data with Content-Type: application/pdf
  - Content-Disposition: attachment; filename="receipt-{id}.pdf"

### PATCH /api/receipts/{id}/revoke
- **Purpose**: Mark receipt as revoked
- **Authentication**: DoctorPermission required
- **Request Body**:
  ```json
  {
    "reason": "optional reason for revocation"
  }
  ```
  ```
  {
    "status": "revoked",
    "revoked_timestamp": "2026-08-07T14:30:00Z"
  }
  ```
  - **Response (200 OK)**:
    ```json
    {
      "id": "UUID",
      "status": "revoked",
      "revoked_timestamp": "2026-08-07T14:30:00Z"
    }
    ```

### GET /api/verify-receipt/{token}
- **Purpose**: Public verification endpoint for QR codes
- **Authentication**: None required (public)
- **Response (200 OK)**:
  ```json
  {
    "status": "Verified",
    "message": "Verified receipt",
    "receipt_id": "UUID",
    "qr_code_token": "unique_token_value",
    "verified_at": "2026-08-07T15:30:00Z"
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "error": "Invalid token"
  }
  ```
- **Response (403 Forbidden)**:
  ```json
  {
    "error": "This receipt has been revoked."
  }
- **Response (405 Method Not Allowed)**:
  ```json
  {
    "error": "Invalid HTTP method"
  }
  ```

## Technical Requirements
1. **Authentication**: All endpoints except verification use DoctorPermission
2. **Rate Limiting**: Public verification endpoint limited to 100 requests/IP/minute
3. **Content Types**: 
   - JSON for all request/response payloads
   - Binary PDF for `/pdf` endpoint
- **Content-Disposition**: Responses should include appropriate Content-Disposition headers
- **Versioning**: API paths use `/api/v1/...` pattern
- **Error Format**: Consistent JSON error objects with `error` and `message` fields

## Service Contracts
1. **Receipt Service**: Responsible for:
   - Creating receipt records
   - Generating PDFs
   - Managing verification tokens
   - Handling revocation workflow
2. **Verification Service**: 
   - Publicly accessible endpoint
   - Returns structured verification results
3. **PDF Generation Service**:
   - Uses existing template-based approach
   - Maintains fillable field functionality
   - Supports QR code embedding

## Integration Points
1. **Frontend**: New `useReceipts` and `useCreateReceipt` hooks
2. **Database**: New Receipt and ReceiptCounter models
3. **Frontend UI**: New tab page and modal workflow
3. **Backend Job Queue**: Optional background processing for verification

## Testing Requirements
1. **API Test Cases**:
   - Valid receipt creation
   - Invalid request format
   - Missing authentication
   - Invalid ID format
   - PDF generation failure
4. **Integration Tests**:
   - End-to-end receipt workflow
   - Verification flow with real QR codes
   - Role-based access control

## Compatibility Requirements
1. Must work with existing DoctorPermission system
2. Must respect existing tab navigation patterns
2. Must not break existing sick leave certificate workflows
3. Must maintain compatibility with existing PDF generation infrastructure