# Research: Create Sick Leave Improvement

## Current State Analysis

### SREF Generation (Already Implemented)

The SREF (reference number) is already generated server-side in `backend/api/utils.py`:

```python
def generate_reference_number(issue_date: date) -> str:
    from .models import CertificateCounter
    year_code = issue_date.year - 2025
    with transaction.atomic():
        counter, _ = CertificateCounter.objects.select_for_update().get_or_create(id=1)
        counter.last_sequence += 1
        counter.save(update_fields=['last_sequence'])
        seq = counter.last_sequence
    digits = f"{seq:012d}"
    return f"S{year_code:03d}-{digits[0:4]}-{digits[4:8]}-{digits[8:12]}"
```

This function:
- Uses a `CertificateCounter` model to maintain a sequential counter
- Generates a format like `S001-0000-0001-0001` (S + year code + 12-digit sequence split into groups)
- Is called in the `SickLeaveCertificate.save()` method

### Remarks Field (Not Yet Implemented)

The `SickLeaveCertificate` model does NOT currently have a `remarks` field. The form in `sick-leave-certificate-tabs.tsx` has fields for:
- consultation_details (Textarea)
- diagnosis (Textarea)
- recommended_sick_leave (Input)

No remarks field exists in the form or backend.

### Form Component

The form is in `apps/web/components/doctor/sick-leave-certificate-tabs.tsx`:
- Uses React Hook Form (`useForm`)
- Fields: consultation_details, diagnosis, recommended_sick_leave
- Submits via `createMutation.mutateAsync(data)`
- The `SickLeaveCertificateFormProps.onSubmit` type only accepts `{ consultation_details, diagnosis, recommended_sick_leave }`

### API Layer

The API endpoint for creating certificates is:
- POST `/api/patients/{patientId}/sick-leave-certificates/`
- Handled by `PatientViewSet.sick_leave_certificates` action
- The `SickLeaveCertificateSerializer` includes all model fields

### Frontend Types

The `CreateSickLeaveCertificateInput` type is defined in `apps/web/lib/types.ts` and needs to be checked for the remarks field.

## Implementation Approach

### Option 1: Generate SREF Preview via API Endpoint
- Add a new API endpoint: `GET /api/sref-preview/` that returns the next SREF without creating a certificate
- Pros: Accurate, uses same generation logic
- Cons: Additional API call, potential race condition (SREF consumed by another request)

### Option 2: Generate SREF Client-Side
- Generate a preview SREF format client-side (e.g., "S001-XXXX-XXXX-XXXX" placeholder)
- Pros: No API call needed, instant display
- Cons: Not the actual SREF that will be assigned

### Option 3: Generate SREF Server-Side Before Form Display
- Add an API endpoint that generates and reserves an SREF
- Pass it to the form for display
- Include it in the certificate creation request
- Pros: Accurate SREF displayed, no race condition
- Cons: More complex, requires SREF reservation logic

### Recommended Approach: Option 1
Generate a preview SREF via a lightweight API endpoint. This shows the doctor what the SREF will look like. The actual SREF is generated server-side during certificate creation. This is the simplest approach that meets the requirement of "showing SREF on the create screen."

For the Remarks field, simply add it to the form, serializer, and model.

## Key Findings

1. SREF generation logic already exists and is tested
2. The form component is well-structured with React Hook Form
3. The backend follows Django REST Framework patterns
4. No new dependencies are needed
5. The `remarks` field needs to be added to the model, serializer, and form
6. For SREF preview, a new endpoint or extending the existing create flow is needed
