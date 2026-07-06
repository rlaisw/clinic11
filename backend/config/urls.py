from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "ok",
        "service": "clinic11 API",
        "version": "1.0.0"
    })

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('api.urls')),
    path('api/', include('medication.urls')),
]