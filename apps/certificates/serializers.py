"""Serializers for certificate module."""
from rest_framework import serializers

from apps.certificates.models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)

    class Meta:
        model = Certificate
        fields = [
            "id", "student_name", "certificate_type", "title",
            "description", "verification_code", "issued_at",
        ]
