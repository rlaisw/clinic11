from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Patient, QueueEntry, PatientBackground, ActiveMedication, PastMedication, Allergy, PrescriptionMedication
from .serializers import PatientSerializer, QueueEntrySerializer, QueueCheckInSerializer, PatientBackgroundSerializer, ActiveMedicationSerializer, PastMedicationSerializer, AllergySerializer, PrescriptionMedicationSerializer


class DoctorPermission(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view) or not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role == 'doctor'


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'email', 'hkid']
    ordering = ['-timestamp']

    @action(detail=True, methods=['get', 'patch'], permission_classes=[DoctorPermission])
    def background(self, request, pk=None):
        try:
            background_obj = PatientBackground.objects.get(patient_id=pk)
        except PatientBackground.DoesNotExist:
            if request.method == 'GET':
                return Response({'patient': str(pk), 'chief_complaint': '', 'past_medical_history': {}, 'social_family_history': {}, 'occupation': ''})
            background_obj = PatientBackground.objects.create(patient_id=pk)

        if request.method == 'GET':
            return Response(PatientBackgroundSerializer(background_obj).data)

        serializer = PatientBackgroundSerializer(background_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], url_path='medications/active', permission_classes=[DoctorPermission])
    def active_medications(self, request, pk=None):
        if request.method == 'GET':
            meds = ActiveMedication.objects.filter(patient_id=pk)
            return Response(ActiveMedicationSerializer(meds, many=True).data)
        serializer = ActiveMedicationSerializer(data={**request.data, 'patient': pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='medications/past', permission_classes=[DoctorPermission])
    def past_medications(self, request, pk=None):
        if request.method == 'GET':
            meds = PastMedication.objects.filter(patient_id=pk)
            return Response(PastMedicationSerializer(meds, many=True).data)
        serializer = PastMedicationSerializer(data={**request.data, 'patient': pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='allergies', permission_classes=[DoctorPermission])
    def allergies(self, request, pk=None):
        if request.method == 'GET':
            allergy_list = Allergy.objects.filter(patient_id=pk)
            return Response(AllergySerializer(allergy_list, many=True).data)
        serializer = AllergySerializer(data={**request.data, 'patient': pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='prescriptions', permission_classes=[DoctorPermission])
    def prescriptions(self, request, pk=None):
        if request.method == 'GET':
            presc_list = PrescriptionMedication.objects.filter(patient_id=pk)
            return Response(PrescriptionMedicationSerializer(presc_list, many=True).data)
        serializer = PrescriptionMedicationSerializer(data={**request.data, 'patient': pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class QueueEntryViewSet(viewsets.ModelViewSet):
    queryset = QueueEntry.objects.all()
    serializer_class = QueueEntrySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return QueueEntry.objects.all().select_related('patient').order_by('-check_in_time')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        waiting_count = QueueEntry.objects.filter(status='waiting').count()
        in_consultation_count = QueueEntry.objects.filter(status='in_consultation').count()
        in_clinic_count = waiting_count + in_consultation_count

        next_up = QueueEntry.objects.filter(status='waiting').order_by('check_in_time').first()

        avg_wait_time = 0
        waiting_entries = QueueEntry.objects.filter(status='waiting')
        if waiting_entries.exists() and waiting_entries.count() > 0:
            total_minutes = sum(int((timezone.now() - e.check_in_time).total_seconds() / 60) for e in waiting_entries)
            avg_wait_time = total_minutes // waiting_entries.count()

        return Response({
            'waiting': waiting_count,
            'in_consultation': in_consultation_count,
            'in_clinic': in_clinic_count,
            'next_up': QueueEntrySerializer(next_up).data if next_up else None,
            'avg_wait_time': avg_wait_time,
        })

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        serializer = QueueCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = Patient.objects.get(id=serializer.validated_data['patient_id'])
        entry = QueueEntry.objects.create(
            patient=patient,
            visit_type=serializer.validated_data['visit_type'],
            reason=serializer.validated_data.get('reason', ''),
        )
        return Response(QueueEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def call(self, request, pk=None):
        entry = self.get_object()
        entry.status = 'in_consultation'
        entry.consultation_start_time = timezone.now()
        entry.save()
        return Response(QueueEntrySerializer(entry).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        entry = self.get_object()
        entry.status = 'completed'
        entry.completed_at = timezone.now()
        entry.save()
        return Response(QueueEntrySerializer(entry).data)

    @action(detail=False, methods=['delete'])
    def completed(self, request):
        deleted_count, _ = QueueEntry.objects.filter(status='completed').delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)


class ActiveMedicationViewSet(viewsets.ModelViewSet):
    queryset = ActiveMedication.objects.all()
    serializer_class = ActiveMedicationSerializer
    permission_classes = [DoctorPermission]


class PastMedicationViewSet(viewsets.ModelViewSet):
    queryset = PastMedication.objects.all()
    serializer_class = PastMedicationSerializer
    permission_classes = [DoctorPermission]


class AllergyViewSet(viewsets.ModelViewSet):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
    permission_classes = [DoctorPermission]


class PrescriptionMedicationViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionMedication.objects.all()
    serializer_class = PrescriptionMedicationSerializer
    permission_classes = [DoctorPermission]