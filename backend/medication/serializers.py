from rest_framework import serializers
from .models import Medication


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = [
            'id',
            'name',
            'generic_name',
            'category',
            'unit',
            'strength',
            'dosage_strength',
            'administration_route',
            'frequency',
            'dosage_instructions',
'side_effects',
             'contraindications',
             'warnings',
             'stock_value',
             'threshold_stock_value',
             'min_stock_level',
            'max_stock_level',
            'supplier_name',
            'supplier_contact',
            'supplier_email',
            'supplier_phone',
            'supplier_address',
            'unit_cost',
            'total_value',
            'expiry_date',
            'batch_number',
            'manufacturing_date',
            'is_active',
            'requires_refrigeration',
            'created_at',
            'updated_at',
            'last_stock_update',
        ]
        extra_kwargs = {
            'name': {'required': True, 'allow_blank': False},
            'stock_value': {'min_value': 0},
            'unit_cost': {'min_value': 0, 'required': False},
            'expiry_date': {'required': True},
            'unit': {'required': False},
            'strength': {'required': False},
            'dosage_strength': {'required': False},
            'administration_route': {'required': False},
            'frequency': {'required': False},
            'side_effects': {'required': False},
            'supplier_name': {'required': True},
            'supplier_contact': {'required': False},
            'supplier_address': {'required': False},
        }
    
    def create(self, validated_data):
        validated_data.setdefault('unit', 'TAB')
        validated_data.setdefault('strength', 0)
        validated_data.setdefault('dosage_strength', '')
        validated_data.setdefault('administration_route', 'oral')
        validated_data.setdefault('frequency', 'DAILY')
        validated_data.setdefault('side_effects', 'None known')
        validated_data.setdefault('supplier_address', 'N/A')
        validated_data.setdefault('supplier_contact', 'N/A')
        validated_data.setdefault('threshold_stock_value', None)
        return super().create(validated_data)