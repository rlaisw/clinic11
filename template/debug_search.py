import django; import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from api.models import SickLeaveCertificate
from django.db.models import Q

search = '123'
refs = [
    'S001-0000-0000-0028', 'S001-0000-0000-0027', 'S001-0000-0000-0003',
    'S001-0000-0000-0004', 'S001-0000-0000-0008', 'S001-0000-0000-0009',
    'S001-0000-0000-0010', 'S001-0000-0000-0012', 'S001-0000-0000-0014',
    'S001-0000-0000-0019', 'S001-0000-0000-0020', 'S001-0000-0000-0022',
    'S001-0000-0000-0015'
]

for ref in refs:
    c = SickLeaveCertificate.objects.get(reference_number=ref)
    fields = ['patient_name', 'patient_hkid', 'diagnosis', 'reference_number', 'qr_code_token']
    matches = [f for f in fields if search.lower() in str(getattr(c, f, '')).lower()]
    if not matches:
        print(f"NO MATCH FOUND: {ref} diag='{c.diagnosis}' hkid='{c.patient_hkid}' qr='{c.qr_code_token[:40]}'")
    else:
        print(f"MATCH in {matches}: {ref} diag='{c.diagnosis}'")