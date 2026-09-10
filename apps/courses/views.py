"""Views for course module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent
from apps.common.responses import APIResponse
from apps.common.pagination import StandardResultsPagination
from apps.courses import services
from apps.courses.models import Course, CourseCategory
from apps.courses.serializers import (
    CourseCategorySerializer, CourseDetailSerializer,
    CourseListSerializer, EnrollmentSerializer,
)
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Courses"])
class CourseCategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List course categories")
    def get(self, request):
        cats = CourseCategory.objects.filter(is_active=True)
        return APIResponse.success(data=CourseCategorySerializer(cats, many=True).data)


@extend_schema(tags=["Courses"])
class CourseListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Browse published courses")
    def get(self, request):
        qs = Course.objects.filter(status="published", is_active=True).select_related("category")

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
        return paginator.get_paginated_response(CourseListSerializer(page, many=True).data)


@extend_schema(tags=["Courses"])
class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get course details with resources")
    def get(self, request, course_id):
        from apps.common.exceptions import ResourceNotFoundError
        try:
            course = Course.objects.select_related("category").prefetch_related("resources").get(id=course_id)
        except Course.DoesNotExist:
            raise ResourceNotFoundError("Course not found.")
        return APIResponse.success(data=CourseDetailSerializer(course).data)


@extend_schema(tags=["Courses"])
class EnrollCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Enroll in a course")
    def post(self, request, course_id):
        student = get_or_create_student_profile(request.user)
        enrollment = services.enroll_in_course(student, course_id)
        return APIResponse.created(
            data=EnrollmentSerializer(enrollment).data,
            message="Enrolled in course successfully.",
        )


@extend_schema(tags=["Courses"])
class CompleteResourceView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Mark a learning resource as completed")
    def post(self, request, course_id, resource_id):
        student = get_or_create_student_profile(request.user)
        services.mark_resource_completed(student, course_id, resource_id)
        return APIResponse.success(message="Resource marked as completed.")


@extend_schema(tags=["Courses"])
class StudentEnrollmentsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="List student's course enrollments")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        enrollments = student.enrollments.select_related("course__category")
        return APIResponse.success(data=EnrollmentSerializer(enrollments, many=True).data)
