from django.contrib import admin
from apps.resumes.models import (
    Achievement, Certification, Education, Experience, Language, Project,
    ResumeProfile, ResumeSkill,
)


@admin.register(ResumeProfile)
class ResumeProfileAdmin(admin.ModelAdmin):
    list_display = ("student", "title", "created_at")
