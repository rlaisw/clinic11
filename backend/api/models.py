from django.db import models

class PatientBackground(models.Model):
    patient = models.OneToOneField(
        'Patient', on_delete=models.CASCADE, related_name='background'
    )
    chief_complaint = models.TextField(blank=True)
    past_medical_history = models.JSONField(default=dict)
    social_family_history = models.JSONField(default=dict)
    occupation = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Background for {self.patient}"


class ActiveMedication(models.Model):
    ROUTE_CHOICES = [
        ('oral', 'Oral'),
        ('IV', 'IV'),
        ('IM', 'IM'),
        ('SC', 'SC'),
        ('topical', 'Topical'),
        ('inhalation', 'Inhalation'),
    ]

    patient = models.ForeignKey(
        'Patient', on_delete=models.CASCADE, related_name='active_medications'
    )
    item = models.PositiveIntegerField(default=1)
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    route = models.CharField(max_length=20, choices=ROUTE_CHOICES, default='oral')
    frequency = models.CharField(max_length=100)
    days_supply = models.PositiveIntegerField(null=True, blank=True)
    diagnostic_result = models.CharField(max_length=255, blank=True, default='')
    start_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} ({self.patient})"


class PastMedication(models.Model):
    ROUTE_CHOICES = [
        ('oral', 'Oral'),
        ('IV', 'IV'),
        ('IM', 'IM'),
        ('SC', 'SC'),
        ('topical', 'Topical'),
        ('inhalation', 'Inhalation'),
    ]

    patient = models.ForeignKey(
        'Patient', on_delete=models.CASCADE, related_name='past_medications'
    )
    item = models.PositiveIntegerField(default=1)
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    route = models.CharField(max_length=20, choices=ROUTE_CHOICES, default='oral')
    frequency = models.CharField(max_length=100)
    days_supply = models.PositiveIntegerField(null=True, blank=True)
    diagnostic_result = models.CharField(max_length=255, blank=True, default='')
    start_date = models.DateField()
    end_date = models.DateField()
    reason_discontinuation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-end_date']

    def __str__(self):
        return f"{self.name} ({self.patient})"


class Allergy(models.Model):
    SEVERITY_CHOICES = [
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]

    patient = models.ForeignKey(
        'Patient', on_delete=models.CASCADE, related_name='patient_allergies'
    )
    substance = models.CharField(max_length=255)
    reaction = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='mild')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.substance} ({self.patient})"


class PrescriptionMedication(models.Model):
    ROUTE_CHOICES = [
        ('oral', 'Oral'),
        ('IV', 'IV'),
        ('IM', 'IM'),
        ('SC', 'SC'),
        ('topical', 'Topical'),
        ('inhalation', 'Inhalation'),
    ]

    patient = models.ForeignKey(
        'Patient', on_delete=models.CASCADE, related_name='prescription_medications'
    )
    item = models.PositiveIntegerField(default=1)
    medication_name = models.CharField(max_length=255)
    dosage_amount = models.DecimalField(max_digits=10, decimal_places=2)
    dosage_unit = models.CharField(max_length=20)
    route = models.CharField(max_length=20, choices=ROUTE_CHOICES)
    frequency = models.CharField(max_length=100)
    days_supply = models.PositiveIntegerField(null=True, blank=True)
    diagnostic_result = models.CharField(max_length=255, blank=True, default='')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['item']

    def __str__(self):
        return f"{self.medication_name} ({self.patient})"


class Patient(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, unique=True, null=True)
    blood_type = models.CharField(max_length=5, blank=True, default='')
    allergies = models.TextField(blank=True, default='')
    hkid = models.CharField(max_length=20, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class MedicalHistory(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='medical_history'
    )
    condition = models.CharField(max_length=255)
    diagnosis_date = models.DateField()
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-diagnosis_date']

    def __str__(self):
        return f"{self.condition} ({self.patient})"


class EmergencyContact(models.Model):
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='emergency_contacts'
    )
    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} ({self.relationship})"


class QueueEntry(models.Model):
    VISIT_TYPE_CHOICES = [
        ('follow_up', 'Follow-up'),
        ('walkin', 'Walk-in'),
        ('appointment', 'Appointment'),
        ('emergency', 'Emergency'),
    ]
    QUEUE_STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('in_consultation', 'In Consultation'),
        ('completed', 'Completed'),
    ]

    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='queue_entries'
    )
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPE_CHOICES, default='walkin')
    reason = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=QUEUE_STATUS_CHOICES, default='waiting')
    check_in_time = models.DateTimeField(auto_now_add=True)
    doctor_name = models.CharField(max_length=100, blank=True, default='')
    room_name = models.CharField(max_length=100, blank=True, default='')
    consultation_start_time = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-check_in_time']

    def __str__(self):
        return f"{self.patient} - {self.get_status_display()}"
