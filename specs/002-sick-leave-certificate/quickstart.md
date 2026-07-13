# Quickstart: Digital Sick Leave Certificate

## Prerequisites

- Python venv activated (`backend/venv/Scripts/activate`)
- Django server running (`python manage.py runserver`)
- Next.js dev server running (`pnpm dev`)
- Seed data loaded (run `python manage.py seed_patients`)
- Doctor user exists with `role=doctor` in Profile

## Setup Commands

```bash
# Backend: Run migrations
cd backend
python manage.py makemigrations api
python manage.py migrate

# Backend: Start server
python manage.py runserver

# Frontend: Start dev server
cd apps/web
pnpm dev
```

## Validation Scenarios

### Scenario 1: Tab Appears

1. Log in as a doctor
2. Navigate to `/doctor/patients`
3. Click any patient to open `/doctor/patients/{id}`
4. **Expected**: A "Sick Leave Certificate" tab is visible alongside Profile & Background, Medication History, Data Visualization, and Prescription tabs
5. Click the new tab
6. **Expected**: A pre-printed sick leave certificate form is displayed

### Scenario 2: Sign and Issue Certificate

1. On the Sick Leave Certificate tab, verify that:
   - Patient's name and HKID are pre-populated and read-only
   - Doctor name, email, phone, clinic name, and clinic address are auto-populated and read-only
   - Consultation Details, Diagnosis, and Recommended Sick Leave fields are editable
   - Today's date is auto-filled
2. Fill in the editable fields
3. Click "Sign & Issue"
4. **Expected**:
   - Certificate is created and saved
   - A unique QR code is displayed on the certificate
   - Success message is shown
   - The certificate data is searchable

### Scenario 3: Print Certificate as PDF

1. After signing, click "Print" or "Download PDF"
2. **Expected**: A PDF file downloads containing the certificate with all fields and the QR code

### Scenario 4: Share Certificate

1. After signing, click "Share"
2. Set max views (e.g., 5)
3. **Expected**: A shareable URL is generated (format: `/api/share/{token}`)
4. Open the share URL in an incognito browser window
5. **Expected**: The PDF certificate downloads

### Scenario 5: Verify QR Code

1. After signing, scan the QR code (or copy the verification link) from the certificate
2. Open the verification URL in a browser
3. **Expected**: "Verified by the clinic and signed by doctor" is displayed with certificate summary
4. Modify the token and refresh
5. **Expected**: "Fake — certificate cannot be verified"

### Scenario 6: Revoke Certificate

1. Navigate to the signed certificate
2. Click "Revoke"
3. **Expected**: Certificate status changes to "revoked"
4. Scan the original QR code again
5. **Expected**: "This certificate has been revoked"

### Scenario 7: Search Certificates

1. Navigate to the search page or use the search field
2. Search by patient name
3. **Expected**: Matching certificates are listed
4. Search by HKID
5. **Expected**: Matching certificates are listed

## Test Commands

```bash
# Backend tests
cd backend
python -m pytest api/tests.py -v -k "sick_leave"

# Frontend tests
cd apps/web
npx jest --testPathPattern="sick-leave"
```

## Expected Outcomes Summary

| Scenario | Key Check | Pass Condition |
|----------|-----------|----------------|
| Tab appears | Layout shows 5th tab | Tab visible and clickable |
| Sign certificate | Certificate created with QR | QR code displayed on cert |
| Print PDF | PDF downloads | PDF contains all fields + QR |
| Share link | Link generates and works | Link delivers PDF, respects view limits |
| Verify QR | Public verification | Real → verified, Fake → fake, Revoked → revoked |
| Revoke | Status changes | Verification shows revoked message |
| Search | Results match query | Correct certificates returned |