from django.contrib import admin
from apps.certificates.models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("verification_code", "student", "title", "certificate_type", "issued_at")
    list_filter = ("certificate_type",)
    search_fields = ("verification_code", "title", "student__user__email")
