"""Business logic for certificate generation and verification."""
import logging
from apps.common.exceptions import ResourceNotFoundError
from apps.certificates.models import Certificate

logger = logging.getLogger("kvs")


def issue_certificate(student_profile, cert_type, title, description=""):
    cert = Certificate.objects.create(
        student=student_profile,
        certificate_type=cert_type,
        title=title,
        description=description,
    )
    logger.info("Issued certificate %s to student %s", cert.verification_code, student_profile.id)
    return cert


def verify_certificate(verification_code):
    try:
        cert = Certificate.objects.select_related("student__user").get(verification_code=verification_code)
        return cert
    except Certificate.DoesNotExist:
        raise ResourceNotFoundError("Certificate not found or verification code is invalid.")
