# Quickstart Guide: Receipt Feature Validation

## Prerequisites
Before validation, ensure the following are in place:

1. **Backend Setup**
   ```bash
   cd backend
   python manage.py migrate
   python manage.py createsuperuser  # if needed
   ```

2. **Template File**
   - Verify `C:\kilocode\clinic11\template\receipt-f1.pdf` exists
   - Open and inspect the fillable form fields

3. **Environment Configuration**
   - `RECEIPT_TEMPLATE_PATH=C:\kilocode\clinic11\template\receipt-f1.pdf`
   - `QR_CODE_BASE_URL=https://your-domain.com` (for production)
   - Ensure `NEXT_PUBLIC_API_URL` is configured

4. **User Setup**
   - Doctor user with proper permissions
   - At least one patient record with consultation data

## Validation Steps

### 1. Tab Navigation Test
**Steps**:
1. Log in as doctor
2. Navigate to patient dashboard
3. Observe tab navigation

**Expected**: 
- "Receipt" tab visible before "Sick Leave Certificate" tab
- Tab switches work correctly
- Active state persists after refresh

### 2. Form Rendering Test
**Steps**:
1. Click "Receipt" tab
2. Observe receipt form rendering
3. Verify all fields are present

**Expected**:
- Form loads with patient data populated
- All required fields displayed
- No console errors in devtools

### 3. Receipt Generation Test
**Steps**:
1. Fill all required fields:
   - Patient name
   - Date
   - Consultation details
   - Diagnosis
   - Recommended sick leave
   - Financial fields
2. Click "Generate Receipt" button
3. Wait for processing

**Expected**:
- Success message displayed
- QR code appears
- PDF preview renders in modal
- Receipt record saved to database

### 4. PDF Generation Test
**Steps**:
1. After successful generation:
2. Click downloadable link
3. Save PDF to local machine
4. Open saved PDF

**Expected**:
- PDF opens without errors
- All fields correctly filled
- QR code visible and scannable
- Form fields remain editable

### 5. QR Code Verification Test
**Steps**:
1. Simulate QR scan (or copy token from console)
2. Navigate to verification URL or scan with phone
3. Observe verification results

**Expected**:
- Verification page loads
- Shows "Verified receipt" message
- Displays receipt details
- No authentication required

### 6. Error Handling Test
**Steps**:
1. Submit form with missing required fields
2. Attempt to generate receipt with empty data
3. Try accessing receipt after revocation

**Expected**:
- Form validation errors display clearly
- Generation prevented with helpful messages
- Revoked receipts show "This receipt has been revoked" on verification

### 7. Role Restriction Test
**Steps**:
1. Log in as non-doctor user
2. Navigate to patient page
3. Attempt to access Receipt tab

**Expected**:
- Receipt tab not visible to non-doctor
- 403/redirect when accessing URL directly

## Test Commands

```bash
# Frontend tests
cd apps/web && npx jest --testPathPattern="receipt" --coverage

# Backend tests  
cd backend && python -m pytest api/tests.py -v -k "receipt"

# Integration tests
cd apps/web && npx playwright test receipt-validation

# Manual verification
cd backend && python manage.py shell -c "from api.models import Receipt; print('Models load correctly')"
```

## Expected Outcomes Summary

| Test | Success Metric |
|------|---------------|
| Tab Navigation | 100% correct visible tabs |
| Form Rendering | 0 console errors, all fields present |
| Receipt Generation | <2s average, 0 validation errors |
| PDF Generation | 100% valid PDFs with correct data |
| QR Verification | Scannable, accurate results |
| Error Handling | Clear, user-friendly messages |
| Role Restriction | Proper access control enforced |

## Troubleshooting

**Issue**: Template not found
- Solution: Verify `RECEIPT_TEMPLATE_PATH` is set correctly

**Issue**: PDF generation fails
- Solution: Check template is not corrupted, verify reportlab/weasyprint installed

**Issue**: QR code not generating
- Solution: Verify qr_code library available, check token uniqueness constraint

**Issue**: API returns 403 for doctor
- Solution: Verify user has DoctorPermission, check token validity