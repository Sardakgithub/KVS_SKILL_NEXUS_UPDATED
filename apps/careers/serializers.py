"""Serializers for career module."""
from rest_framework import serializers

from apps.careers.models import (
    CareerCategory, CareerPath, CareerRoadmapStage, FavoriteCareer,
    Skill, StageMilestone, StudentCareerProgress,
)


class CareerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerCategory
        fields = ["id", "name", "description", "icon"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "description"]


class StageMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = StageMilestone
        fields = ["id", "title", "description", "order"]


class CareerRoadmapStageSerializer(serializers.ModelSerializer):
    milestones = StageMilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = CareerRoadmapStage
        fields = ["id", "title", "description", "order", "estimated_duration", "milestones"]


class CareerPathListSerializer(serializers.ModelSerializer):
    category = CareerCategorySerializer(read_only=True)
    required_skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = CareerPath
        fields = [
            "id", "title", "slug", "category", "description",
            "overview_summary", "skill_growth_highlights",
            "required_skills", "estimated_duration", "difficulty_level",
            "is_featured", "icon", "created_at",
        ]


class CareerPathDetailSerializer(CareerPathListSerializer):
    stages = CareerRoadmapStageSerializer(many=True, read_only=True)

    class Meta(CareerPathListSerializer.Meta):
        fields = CareerPathListSerializer.Meta.fields + ["stages"]


class StudentCareerProgressSerializer(serializers.ModelSerializer):
    career_path = CareerPathListSerializer(read_only=True)
    current_stage = CareerRoadmapStageSerializer(read_only=True)
    completed_milestones = StageMilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = StudentCareerProgress
        fields = [
            "id", "career_path", "current_stage", "completed_milestones",
            "started_at", "completed_at",
        ]


class FavoriteCareerSerializer(serializers.ModelSerializer):
    career_path = CareerPathListSerializer(read_only=True)

    class Meta:
        model = FavoriteCareer
        fields = ["id", "career_path", "created_at"]
