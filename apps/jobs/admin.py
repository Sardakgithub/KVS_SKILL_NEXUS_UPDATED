from django.contrib import admin
from apps.jobs.models import Application, Bookmark, Company, Internship, Job


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "industry", "location")


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "job_type", "location", "is_active")
    list_filter = ("job_type", "is_active")


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "duration", "is_remote", "is_active")
    list_filter = ("is_remote", "is_active")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("student", "opportunity_type", "status", "applied_at")
    list_filter = ("status", "opportunity_type")
