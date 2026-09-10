"""Views for careers module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent, ReadOnlyOrIsAdmin
from apps.common.responses import APIResponse
from apps.common.pagination import StandardResultsPagination
from apps.careers import services
from apps.careers.models import CareerCategory, CareerPath, Skill
from apps.careers.serializers import (
    CareerCategorySerializer, CareerPathDetailSerializer,
    CareerPathListSerializer, FavoriteCareerSerializer, SkillSerializer,
    StudentCareerProgressSerializer,
)
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Careers"])
class CareerCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List all career categories")
    def get(self, request):
        categories = CareerCategory.objects.filter(is_active=True)
        return APIResponse.success(data=CareerCategorySerializer(categories, many=True).data)


@extend_schema(tags=["Careers"])
class SkillListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List all skills")
    def get(self, request):
        skills = Skill.objects.filter(is_active=True)
        return APIResponse.success(data=SkillSerializer(skills, many=True).data)


@extend_schema(tags=["Careers"])
class CareerPathListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Browse career paths")
    def get(self, request):
        qs = CareerPath.objects.filter(is_active=True).select_related("category").prefetch_related("required_skills")

        category = request.query_params.get("category")
        difficulty = request.query_params.get("difficulty")
        search = request.query_params.get("search")

        if category:
            qs = qs.filter(category_id=category)
        if difficulty:
            qs = qs.filter(difficulty_level=difficulty)
        if search:
            qs = qs.filter(title__icontains=search)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        data = CareerPathListSerializer(page, many=True).data
        return paginator.get_paginated_response(data)


@extend_schema(tags=["Careers"])
class CareerPathDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get career path detail with roadmap")
    def get(self, request, career_id):
        from apps.common.exceptions import ResourceNotFoundError
        try:
            path = CareerPath.objects.select_related("category").prefetch_related(
                "required_skills", "stages__milestones"
            ).get(id=career_id, is_active=True)
        except CareerPath.DoesNotExist:
            raise ResourceNotFoundError("Career path not found.")

        return APIResponse.success(data=CareerPathDetailSerializer(path).data)


@extend_schema(tags=["Careers"])
class EnrollCareerPathView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Enroll in a career path")
    def post(self, request, career_id):
        student = get_or_create_student_profile(request.user)
        progress = services.enroll_in_career_path(student, career_id)
        return APIResponse.created(
            data=StudentCareerProgressSerializer(progress).data,
            message="Enrolled in career path successfully.",
        )


@extend_schema(tags=["Careers"])
class ToggleFavoriteCareerView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Toggle favorite career path")
    def post(self, request, career_id):
        student = get_or_create_student_profile(request.user)
        is_fav = services.toggle_favorite_career(student, career_id)
        msg = "Added to favorites." if is_fav else "Removed from favorites."
        return APIResponse.success(data={"favorited": is_fav}, message=msg)


@extend_schema(tags=["Careers"])
class StudentCareerProgressView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Get enrolled career paths progress")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        progress = student.career_progress.select_related("career_path__category", "current_stage").prefetch_related("completed_milestones")
        return APIResponse.success(data=StudentCareerProgressSerializer(progress, many=True).data)


@extend_schema(tags=["Careers"])
class FavoriteCareerListView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Get favorited career paths")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        favs = student.favorite_careers.select_related("career_path__category")
        return APIResponse.success(data=FavoriteCareerSerializer(favs, many=True).data)
