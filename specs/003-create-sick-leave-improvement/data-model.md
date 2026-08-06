# Data Model: Create Sick Leave Improvement

## Current Model

### SickLeaveCertificate (backend/api/models.py)

```python
class SickLeaveCertificate(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('revoked', 'Revoked'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_number = models.CharField(max_length=32, unique=True, blank=True, null=True)
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='sick_leave_certificates'
    )
    doctor_name = models.CharField(max_length=255, blank=True)
    doctor_display_name = models.CharField(max_length=255, blank=True, default='')
    doctor_email = models.EmailField(blank=True)
    doctor_phone = models.CharField(max_length=20, blank=True)
    clinic_name = models.CharField(max_length=255, blank=True)
    clinic_address = models.TextField(blank=True)
    patient_name = models.CharField(max_length=255, blank=True)
    patient_hkid = models.CharField(max_length=20, blank=True)
    consultation_details = models.TextField()
    diagnosis = models.TextField()
    recommended_sick_leave = models.CharField(max_length=255)
    issue_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField()
    qr_code_token = models.CharField(max_length=512, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    signature_timestamp = models.DateTimeField(auto_now_add=True)
    revoked_timestamp = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Changes Required

### 1. Add `remarks` field to SickLeaveCertificate model

```python
class SickLeaveCertificate(models.Model):
    # ... existing fields ...
    remarks = models.TextField(blank=True, default='')
```

- Type: `TextField` (supports long text, up to 500 characters per spec)
- Default: empty string
- Blank: allowed (optional field)

### 2. SREF Preview Endpoint

No new model needed. The SREF is generated using the existing `generate_reference_number` function and `CertificateCounter` model.

For the preview endpoint, we can generate a "next" SREF without persisting it:

```python
# In views.py
class SrefPreviewView(generics.GenericAPIView):
    permission_classes = [DoctorPermission]
    
    def get(self, request):
        from .utils import generate_reference_number
        from datetime import date
        next_sref = generate_reference_number(date.today())
        # Note: This consumes a sequence number. 
        # Alternative: Calculate without incrementing
        return Response({'sref': next_sref})
```

**Important**: The `generate_reference_number` function increments the counter. For a preview, we should calculate the next SREF without incrementing, or use a separate preview calculation.

### 3. Serializer Changes

Add `remarks` to `SickLeaveCertificateSerializer`:

```python
class SickLeaveCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SickLeaveCertificate
        fields = [
            'id', 'reference_number', 'patient', 'doctor_name', 'doctor_display_name', 'doctor_email', 'doctor_phone',
            'clinic_name', 'clinic_address', 'patient_name', 'patient_hkid',
            'consultation_details', 'diagnosis', 'recommended_sick_leave',
            'remarks',  # NEW
            'issue_date', 'expiry_date', 'qr_code_token', 'status',
            'signature_timestamp', 'revoked_timestamp', 'created_at', 'updated_at',
        ]
```

## Migration

A new Django migration is needed to add the `remarks` field:

```python
# migrations/0013_sickleavecertificate_remarks.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0012_certificatecounter_and_more'),
    ]
    operations = [
        migrations.AddField(
            model_name='sickleavecertificate',
            name='remarks',
            field=models.TextField(blank=True, default=''),
        ),
    ]
```

## Entity Relationships

No changes to entity relationships. The `remarks` field is a simple text field on the existing `SickLeaveCertificate` entity.

## SREF Generation Logic

The SREF format is: `S{year_code:03d}-{digits[0:4]}-{digits[4:8]}-{digits[8:12]}`

Where:
- `year_code` = current year - 2025 (e.g., 2026 ? 001)
- `digits` = 12-digit zero-padded sequence number from `CertificateCounter`

Example: `S001-0000-0001-0001`
',
