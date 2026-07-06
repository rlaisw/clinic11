from rest_framework import viewsets, permissions
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Medication
from .serializers import MedicationSerializer


@method_decorator(csrf_exempt, name='dispatch')
class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [permissions.AllowAny]