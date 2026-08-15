from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import PatientViewSet, QueueEntryViewSet, ActiveMedicationViewSet, PastMedicationViewSet, AllergyViewSet, PrescriptionMedicationViewSet, SickLeaveCertificateViewSet, VerifyCertificateView, ShareLinkDownloadView, SrefPreviewView, VisitSummaryViewSet
from .receipts.views import ReceiptViewSet, VerifyReceiptView

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'queue', QueueEntryViewSet, basename='queue')
router.register(r'medications/active', ActiveMedicationViewSet, basename='active-medication')
router.register(r'medications/past', PastMedicationViewSet, basename='past-medication')
router.register(r'allergies', AllergyViewSet, basename='allergy')
router.register(r'prescriptions', PrescriptionMedicationViewSet, basename='prescription')
router.register(r'sick-leave-certificates', SickLeaveCertificateViewSet, basename='sick-leave-certificate')
router.register(r'receipts', ReceiptViewSet, basename='receipt')
router.register(r'visit-summaries', VisitSummaryViewSet, basename='visit-summary')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/<str:qr_code_token>/', VerifyCertificateView.as_view(), name='verify-certificate'),
    path('share/<str:token>/', ShareLinkDownloadView.as_view(), name='share-link-download'),
    path('sref-preview/', SrefPreviewView.as_view(), name='sref-preview'),
    path('verify-receipt/<str:token>/', VerifyReceiptView.as_view(), name='verify-receipt'),
]