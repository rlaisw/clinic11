from rest_framework import serializers
from ..models import Receipt


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