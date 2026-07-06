import os
import sys
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from medication.models import Medication
from django.utils import timezone
import random

units = ['MG', 'G', 'ML', 'L', 'TAB', 'CAP', 'IU']
frequencies = ['DAILY', 'BID', 'TID', 'QID', 'PRN', 'WEEKLY', 'MONTHLY']
categories = ['Pain Relief', 'Antibiotic', 'Cardiac', 'Diabetes', 'Respiratory', 'Neurological', 'Gastrointestinal']

medications = [
    ('Paracetamol', 'Acetaminophen', 'Pain Relief'),
    ('Ibuprofen', 'Ibuprofen', 'Pain Relief'),
    ('Amoxicillin', 'Amoxicillin', 'Antibiotic'),
    ('Metformin', 'Metformin', 'Diabetes'),
    ('Atorvastatin', 'Atorvastatin', 'Cardiac'),
    ('Salbutamol', 'Salbutamol', 'Respiratory'),
    ('Lisinopril', 'Lisinopril', 'Cardiac'),
    ('Levothyroxine', 'Levothyroxine', 'Thyroid'),
    ('Omeprazole', 'Omeprazole', 'Gastrointestinal'),
    ('Diazepam', 'Diazepam', 'Neurological'),
    ('Aspirin', 'Acetylsalicylic Acid', 'Pain Relief'),
    ('Warfarin', 'Warfarin', 'Cardiac'),
    ('Simvastatin', 'Simvastatin', 'Cardiac'),
    ('Losartan', 'Losartan', 'Cardiac'),
    ('Glyburide', 'Glyburide', 'Diabetes'),
    ('Glipizide', 'Glipizide', 'Diabetes'),
    ('Insulin', 'Insulin', 'Diabetes'),
    ('Albuterol', 'Albuterol', 'Respiratory'),
    ('Fluticasone', 'Fluticasone', 'Respiratory'),
    ('Montelukast', 'Montelukast', 'Respiratory'),
    ('Prednisone', 'Prednisone', 'Anti-inflammatory'),
    ('Azithromycin', 'Azithromycin', 'Antibiotic'),
    ('Cephalexin', 'Cephalexin', 'Antibiotic'),
    ('Ciprofloxacin', 'Ciprofloxacin', 'Antibiotic'),
    ('Doxycycline', 'Doxycycline', 'Antibiotic'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Naproxen', 'Naproxen', 'Pain Relief'),
    ('Tramadol', 'Tramadol', 'Pain Relief'),
    ('Morphine', 'Morphine', 'Pain Relief'),
    ('Codeine', 'Codeine', 'Pain Relief'),
    ('Hydrochlorothiazide', 'Hydrochlorothiazide', 'Cardiac'),
    ('Amlodipine', 'Amlodipine', 'Cardiac'),
    ('Metoprolol', 'Metoprolol', 'Cardiac'),
    ('Enalapril', 'Enalapril', 'Cardiac'),
    ('Ramipril', 'Ramipril', 'Cardiac'),
    ('Furosemide', 'Furosemide', 'Cardiac'),
    ('Digoxin', 'Digoxin', 'Cardiac'),
    ('Clopidogrel', 'Clopidogrel', 'Cardiac'),
    ('Bisoprolol', 'Bisoprolol', 'Cardiac'),
    ('Carvedilol', 'Carvedilol', 'Cardiac'),
    ('Pioglitazone', 'Pioglitazone', 'Diabetes'),
    ('Sitagliptin', 'Sitagliptin', 'Diabetes'),
    ('Exenatide', 'Exenatide', 'Diabetes'),
    ('Metoprolol', 'Metoprolol', 'Cardiac'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
    ('Acetaminophen', 'Acetaminophen', 'Pain Relief'),
]

for i, (name, generic, category) in enumerate(medications, 1):
    Medication.objects.create(
        name=f'{name} {i}',
        generic_name=generic,
        category=category,
        unit=random.choice(units),
        strength=round(random.uniform(1, 500), 2),
        dosage_strength='5mg',
        administration_route='oral',
        frequency=random.choice(frequencies),
        dosage_instructions={'adult': 'Once daily'},
        side_effects='Common side effects may include nausea',
        contraindications='',
        warnings='Keep out of reach of children',
        stock_value=random.randint(10, 500),
        min_stock_level=10,
        max_stock_level=1000,
        supplier_name='MediSupply Corp',
        supplier_contact='John Smith',
        supplier_email='supplier@medisupply.com',
        supplier_phone='+1-555-0100',
        supplier_address='123 Pharmacy Ave, Suite 100',
        unit_cost=round(random.uniform(5, 50), 2),
        total_value=0,
        expiry_date=timezone.now().date().replace(year=timezone.now().year + 2),
        batch_number=f'BATCH{i:04d}',
        manufacturing_date=timezone.now().date(),
        is_active=True,
        requires_refrigeration=False,
    )

print(f'Created {len(medications)} medication records')