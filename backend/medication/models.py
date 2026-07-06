from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver

class Inventory(models.Model):
    """Track historical stock changes for medications"""
    
    medication = models.ForeignKey('medication.Medication', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    old_stock_value = models.PositiveIntegerField()
    new_stock_value = models.PositiveIntegerField()
    changed_by = models.CharField(max_length=100, default="System")
    reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']

class Medication(models.Model):
    """Medication inventory model with comprehensive medication details"""
    threshold_stock_value = models.PositiveIntegerField(null=True, blank=True, help_text='Stock level at which to trigger low stock alert')
    
    UNIT_CHOICES = [
        ('MG', 'Milligrams'),
        ('G', 'Grams'),
        ('ML', 'Milliliters'),
        ('L', 'Liters'),
        ('TAB', 'Tablets'),
        ('CAP', 'Capsules'),
        ('IU', 'International Units'),
    ]
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('BID', 'Twice daily'),
        ('TID', 'Three times daily'),
        ('QID', 'Four times daily'),
        ('PRN', 'As needed'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    generic_name = models.CharField(max_length=255, blank=True, db_index=True)
    category = models.CharField(max_length=100, db_index=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    strength = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Dosage and administration
    dosage_strength = models.CharField(max_length=100)  # e.g., "5mg", "10mg/5ml"
    administration_route = models.CharField(max_length=50)  # e.g., "oral", "IV", "IM", "SC"
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    dosage_instructions = models.JSONField(default=dict)
    
    # Side effects and warnings
    side_effects = models.TextField()
    contraindications = models.TextField(blank=True)
    warnings = models.TextField(blank=True)
    
    # Stock management
    stock_value = models.PositiveIntegerField(default=0)
    min_stock_level = models.PositiveIntegerField(default=10, help_text="Alert when stock drops below this level")
    max_stock_level = models.PositiveIntegerField(default=1000, help_text="Restock target level")
    
    # Supplier information
    supplier_name = models.CharField(max_length=255, db_index=True)
    supplier_contact = models.CharField(max_length=100)
    supplier_email = models.EmailField(blank=True)
    supplier_phone = models.CharField(max_length=20, blank=True)
    supplier_address = models.TextField()
    
    # Pricing and cost
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_value = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    
    # Expiry tracking
    expiry_date = models.DateField(db_index=True)
    batch_number = models.CharField(max_length=100, blank=True)
    manufacturing_date = models.DateField(null=True, blank=True)
    
    # Status tracking
    is_active = models.BooleanField(default=True)
    requires_refrigeration = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_stock_update = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Compute total_value before saving
        if self.unit_cost is not None:
            self.total_value = self.unit_cost * self.stock_value
        else:
            self.total_value = 0
        created = self.pk is None
        super().save(*args, **kwargs)
        if not created:
            try:
                old = Medication.objects.get(pk=self.pk)
                if old.stock_value != self.stock_value:
                    Inventory.objects.create(
                        medication=self,
                        old_stock_value=old.stock_value,
                        new_stock_value=self.stock_value,
                        changed_by="System",
                        reason="Stock level updated"
                    )
                    # Trigger real-time alerts
                    if self.threshold_stock_value is not None and self.stock_value <= self.threshold_stock_value:
                        print(f"ALERT: Stock for {self.name} is below threshold {self.threshold_stock_value}")
                    elif self.is_low_stock():
                        print(f"ALERT: Stock for {self.name} is low!")
                    if self.is_expiring_soon():
                        print(f"ALERT: Stock for {self.name} expires soon!")
            except Medication.DoesNotExist:
                pass

    def get_stock_status(self):
        """Get current stock status"""
        if self.stock_value == 0:
            return "OUT_OF_STOCK"
        elif self.is_low_stock():
            return "LOW_STOCK"
        elif self.is_expiring_soon():
            return "EXPIRING_SOON"
        elif self.stock_value >= self.max_stock_level * 0.8:
            return "HIGH_STOCK"
        else:
            return "NORMAL_STOCK"
    
    @property
    def is_low_stock(self):
        return self.stock_value <= self.min_stock_level
    
    @property
    def is_expiring_soon(self):
        return (self.expiry_date - timezone.now().date()).days <= 30
    
    class Meta:
        ordering = ['-name', 'category']
        indexes = [
            models.Index(fields=['name', 'category']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['stock_value']),
            models.Index(fields=['supplier_name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.dosage_strength})"