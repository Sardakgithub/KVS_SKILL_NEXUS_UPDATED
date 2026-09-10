"""Views for certificate module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from apps.certificates import services
from apps.certificates.serializers import CertificateSerializer
from apps.common.permissions import IsStudent
from apps.common.responses import APIResponse
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Certificates"])
class StudentCertificatesView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="List student certificates")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        certs = student.certificates.all()
        return APIResponse.success(data=CertificateSerializer(certs, many=True).data)


@extend_schema(tags=["Certificates"])
class VerifyCertificateView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Publicly verify a certificate code")
    def get(self, request, code):
        cert = services.verify_certificate(code)
        return APIResponse.success(
            data=CertificateSerializer(cert).data,
            message="Certificate is authentic.",
        )
