from django.contrib import admin
from apps.students.models import StudentProfile, LearningHistory, StudentSetting


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "education_level", "institution", "graduation_year", "created_at")
    list_filter = ("education_level",)
    search_fields = ("user__email", "user__first_name", "user__last_name", "institution")
    raw_id_fields = ("user",)


@admin.register(LearningHistory)
class LearningHistoryAdmin(admin.ModelAdmin):
    list_display = ("student", "event_type", "title", "created_at")
    list_filter = ("event_type",)


@admin.register(StudentSetting)
class StudentSettingAdmin(admin.ModelAdmin):
    list_display = ("student", "email_notifications", "profile_visibility")
