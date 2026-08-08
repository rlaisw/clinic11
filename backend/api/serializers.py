from rest_framework import serializers
from .models import Patient, MedicalHistory, EmergencyContact, QueueEntry, PatientBackground, ActiveMedication, PastMedication, Allergy, PrescriptionMedication, SickLeaveCertificate, ShareLink, Receipt, ReceiptCounter


class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = ['id', 'condition', 'diagnosis_date', 'notes']


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['id', 'name', 'relationship', 'phone']


class PatientSerializer(serializers.ModelSerializer):
    medical_history = MedicalHistorySerializer(many=True, read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = [
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'address',
            'phone',
            'email',
            'blood_type',
            'allergies',
            'hkid',
            'timestamp',
            'updated',
            'medical_history',
            'emergency_contacts',
        ]


class QueueEntrySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    initials = serializers.SerializerMethodField()
    wait_time_minutes = serializers.SerializerMethodField()

    class Meta:
        model = QueueEntry
        fields = [
            'id',
            'patient',
            'patient_name',
            'initials',
            'visit_type',
            'reason',
            'status',
            'check_in_time',
            'doctor_name',
            'room_name',
            'wait_time_minutes',
            'consultation_start_time',
            'completed_at',
        ]

    def get_initials(self, obj):
        first = obj.patient.first_name[0] if obj.patient.first_name else ''
        last = obj.patient.last_name[0] if obj.patient.last_name else ''
        return (first + last).upper()

    def get_wait_time_minutes(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.check_in_time
        return int(delta.total_seconds() / 60)


class QueueCheckInSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    visit_type = serializers.ChoiceField(choices=QueueEntry.VISIT_TYPE_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        patient = Patient.objects.get(id=validated_data['patient_id'])
        entry = QueueEntry.objects.create(
            patient=patient,
            visit_type=validated_data['visit_type'],
            reason=validated_data.get('reason', ''),
        )
        return entry


class PatientBackgroundSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)

    class Meta:
        model = PatientBackground
        fields = ['id', 'patient', 'chief_complaint', 'past_medical_history', 'social_family_history', 'occupation', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at']


class ActiveMedicationSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = ActiveMedication
        fields = ['id', 'patient', 'patient_id', 'item', 'name', 'dosage', 'route', 'frequency', 'days_supply', 'diagnostic_result', 'start_date', 'created_at']
        read_only_fields = ['id', 'created_at']


class PastMedicationSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = PastMedication
        fields = ['id', 'patient', 'patient_id', 'item', 'name', 'dosage', 'route', 'frequency', 'days_supply', 'diagnostic_result', 'start_date', 'end_date', 'reason_discontinuation', 'created_at']
        read_only_fields = ['id', 'created_at']


class AllergySerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Allergy
        fields = ['id', 'patient', 'patient_id', 'substance', 'reaction', 'severity', 'created_at']
        read_only_fields = ['id', 'created_at']


class PrescriptionMedicationSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False)
    dosage_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    days_supply = serializers.IntegerField(allow_null=True, required=False)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    diagnostic_result = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = PrescriptionMedication
        fields = ['id', 'patient', 'item', 'medication_name', 'dosage_amount', 'dosage_unit', 'route', 'frequency', 'days_supply', 'diagnostic_result', 'start_date', 'end_date', 'created_at']
        read_only_fields = ['id', 'created_at']


class SickLeaveCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SickLeaveCertificate
        fields = [
            'id', 'reference_number', 'patient', 'doctor_name', 'doctor_display_name', 'doctor_email', 'doctor_phone',
            'clinic_name', 'clinic_address', 'patient_name', 'patient_hkid',
            'consultation_details', 'diagnosis', 'recommended_sick_leave',
            'remarks',
            'issue_date', 'expiry_date', 'qr_code_token', 'status',
            'signature_timestamp', 'revoked_timestamp', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'issue_date', 'status',
            'signature_timestamp', 'revoked_timestamp', 'created_at', 'updated_at',
        ]


class SickLeaveCertificateListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SickLeaveCertificate
        fields = ['id', 'reference_number', 'patient_name', 'patient_hkid', 'issue_date', 'diagnosis', 'remarks', 'status', 'qr_code_token']
        read_only_fields = fields


class ShareLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareLink
        fields = ['id', 'certificate', 'token', 'expires_at', 'max_views', 'view_count', 'is_active', 'created_at']
        read_only_fields = ['id', 'token', 'expires_at', 'view_count', 'is_active', 'created_at']


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = [
            'id', 'rref', 'patient', 'doctor_name', 'doctor_display_name', 'doctor_email', 'doctor_phone',
            'clinic_name', 'clinic_address', 'patient_name', 'patient_hkid',
            'date', 'consultation', 'medications', 'investigations', 'procedures', 'misc',
            'consultation_free', 'medications_free', 'investigations_free', 'procedures_free', 'misc_free',
            'total_free', 'total_dollars', 'diagnosis',
            'qr_code_token', 'status',
            'signature_timestamp', 'revoked_timestamp', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'date', 'status',
            'signature_timestamp', 'revoked_timestamp', 'created_at', 'updated_at',
        ]


class ReceiptListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ['id', 'rref', 'patient_name', 'patient_hkid', 'date', 'diagnosis', 'total_free', 'status', 'qr_code_token']
        read_only_fields = fields


class ReceiptVerifySerializer(serializers.Serializer):
    token = serializers.CharField()