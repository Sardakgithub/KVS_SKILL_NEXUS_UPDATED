from django.contrib import admin
from apps.courses.models import Course, CourseCategory, CourseProgress, Enrollment, LearningResource


class LearningResourceInline(admin.TabularInline):
    model = LearningResource
    extra = 1


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "difficulty_level", "duration_hours", "status")
    list_filter = ("status", "difficulty_level", "category")
    search_fields = ("title", "description")
    inlines = [LearningResourceInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "progress_percentage", "enrolled_at", "completed_at")
