"""Serializers for course module."""
from rest_framework import serializers

from apps.courses.models import Course, CourseCategory, CourseProgress, Enrollment, LearningResource


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ["id", "name", "description"]


class LearningResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningResource
        fields = ["id", "title", "resource_type", "content_url", "content_text", "order"]


class CourseListSerializer(serializers.ModelSerializer):
    category = CourseCategorySerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "category", "description",
            "duration_hours", "difficulty_level", "learning_objectives",
            "thumbnail", "status", "created_at",
        ]


class CourseDetailSerializer(CourseListSerializer):
    resources = LearningResourceSerializer(many=True, read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ["resources"]


class CourseProgressSerializer(serializers.ModelSerializer):
    resource = LearningResourceSerializer(read_only=True)

    class Meta:
        model = CourseProgress
        fields = ["id", "resource", "is_completed", "completed_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "course", "enrolled_at", "completed_at", "progress_percentage"]
