from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import PatientViewSet, QueueEntryViewSet, ActiveMedicationViewSet, PastMedicationViewSet, AllergyViewSet, PrescriptionMedicationViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'queue', QueueEntryViewSet, basename='queue')
router.register(r'medications/active', ActiveMedicationViewSet, basename='active-medication')
router.register(r'medications/past', PastMedicationViewSet, basename='past-medication')
router.register(r'allergies', AllergyViewSet, basename='allergy')
router.register(r'prescriptions', PrescriptionMedicationViewSet, basename='prescription')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]