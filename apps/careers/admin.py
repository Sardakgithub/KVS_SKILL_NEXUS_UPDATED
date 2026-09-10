from django.contrib import admin
from apps.careers.models import (
    CareerCategory, CareerPath, CareerRoadmapStage, FavoriteCareer,
    Skill, StageMilestone, StudentCareerProgress,
)


class StageMilestoneInline(admin.TabularInline):
    model = StageMilestone
    extra = 1


class CareerRoadmapStageInline(admin.StackedInline):
    model = CareerRoadmapStage
    extra = 1


@admin.register(CareerCategory)
class CareerCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "created_at")
    search_fields = ("name", "category")


@admin.register(CareerPath)
class CareerPathAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "difficulty_level", "estimated_duration", "is_featured")
    list_filter = ("category", "difficulty_level", "is_featured")
    search_fields = ("title", "description")
    inlines = [CareerRoadmapStageInline]


@admin.register(StudentCareerProgress)
class StudentCareerProgressAdmin(admin.ModelAdmin):
    list_display = ("student", "career_path", "current_stage", "started_at", "completed_at")
