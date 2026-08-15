from django.contrib import admin
from .models import VisitSummary


@admin.register(VisitSummary)
class VisitSummaryAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient_name', 'visit_date', 'visit_type', 'status']
    list_filter = ['status', 'visit_date']
    search_fields = ['patient_name', 'diagnosis']
    readonly_fields = ['id', 'created_at', 'updated_at']
