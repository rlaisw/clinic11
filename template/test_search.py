import django; import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from api.models import SickLeaveCertificate, Receipt
from django.db.models import Q

# Show sample data
print("=== Sample Sick Leave Certificates ===")
for c in SickLeaveCertificate.objects.all()[:5]:
    print(f"  Ref: {c.reference_number} | Patient: {c.patient_name} | Diag: {c.diagnosis[:40] if c.diagnosis else '(none)'}")

print("\n=== Sample Receipts ===")
for r in Receipt.objects.all()[:5]:
    print(f"  Ref: {r.rref} | Patient: {r.patient_name} | Diag: {r.diagnosis[:40] if r.diagnosis else '(none)'}")

# Test search
for search in ['David', 'test', 'diag']:
    print(f"\n=== Search: '{search}' ===")
    
    certs = SickLeaveCertificate.objects.filter(
        Q(patient_name__icontains=search) |
        Q(patient_hkid__icontains=search) |
        Q(diagnosis__icontains=search) |
        Q(reference_number__icontains=search) |
        Q(consultation_details__icontains=search) |
        Q(qr_code_token__icontains=search)
    )
    print(f"  Sick leave matches: {certs.count()}")
    
    receipts = Receipt.objects.filter(
        Q(patient_name__icontains=search) |
        Q(patient_hkid__icontains=search) |
        Q(diagnosis__icontains=search) |
        Q(rref__icontains=search) |
        Q(qr_code_token__icontains=search)
    )
    print(f"  Receipt matches: {receipts.count()}")