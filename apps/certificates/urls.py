"""URL patterns for certificates — mounted at /api/v1/certificates/."""
from django.urls import path

from apps.certificates import views

app_name = "certificates"

urlpatterns = [
    path("my-certificates/", views.StudentCertificatesView.as_view(), name="my-certificates"),
    path("verify/<str:code>/", views.VerifyCertificateView.as_view(), name="verify"),
]
