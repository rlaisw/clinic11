import django; import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from api.models import SickLeaveCertificate
from django.db.models import Q

# Find the record with reference S001-0000-0000-0011
c = SickLeaveCertificate.objects.get(reference_number='S001-0000-0000-0011')
search = 'xyz'

print(f"Record: ref={c.reference_number}, patient={c.patient_name}")
print(f"  diagnosis: '{c.diagnosis}'")
print(f"  patient_hkid: '{c.patient_hkid}'")
print(f"  consultation_details: '{c.consultation_details}'")
print(f"  qr_code_token: '{c.qr_code_token}'")
print()

# Check which fields contain 'xyz'
for field in ['patient_name', 'patient_hkid', 'diagnosis', 'reference_number', 'consultation_details', 'qr_code_token']:
    val = getattr(c, field, '')
    if val and search.lower() in val.lower():
        print(f"  MATCH: {field} contains '{search}': '{val}'")

# Also show all certs that match 'xyz'
print("\n=== All certs matching 'xyz' ===")
certs = SickLeaveCertificate.objects.filter(
    Q(patient_name__icontains=search) |
    Q(patient_hkid__icontains=search) |
    Q(diagnosis__icontains=search) |
    Q(reference_number__icontains=search) |
    Q(consultation_details__icontains=search) |
    Q(qr_code_token__icontains=search)
)
for c in certs:
    print(f"  {c.reference_number}: diag='{c.diagnosis[:40]}' hkid='{c.patient_hkid}' qr_token='{c.qr_code_token[:30]}...'")