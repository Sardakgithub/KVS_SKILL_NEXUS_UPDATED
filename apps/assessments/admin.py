from django.contrib import admin
from apps.assessments.models import (
    Assessment, AssessmentAttempt, AttemptAnswer, Option, Question, SkillRecommendation
)


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("title", "skill", "difficulty_level", "passing_score", "time_limit_minutes")
    list_filter = ("difficulty_level", "skill")
    search_fields = ("title", "description")


@admin.register(AssessmentAttempt)
class AssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ("student", "assessment", "score_percentage", "passed", "started_at", "completed_at")
    list_filter = ("passed",)
