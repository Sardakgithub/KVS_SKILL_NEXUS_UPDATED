"""Views for jobs & internships module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent
from apps.common.responses import APIResponse
from apps.common.pagination import StandardResultsPagination
from apps.jobs import services
from apps.jobs.models import Application, Bookmark, Company, Internship, Job
from apps.jobs.serializers import (
    ApplicationCreateSerializer, ApplicationSerializer, BookmarkSerializer,
    CompanySerializer, InternshipSerializer, JobSerializer,
)
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Jobs & Internships"])
class JobListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Browse active job postings")
    def get(self, request):
        qs = Job.objects.filter(is_active=True).select_related("company").prefetch_related("skills_required")
        search = request.query_params.get("search")
        job_type = request.query_params.get("job_type")

        if search:
            qs = qs.filter(title__icontains=search)
        if job_type:
            qs = qs.filter(job_type=job_type)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(JobSerializer(page, many=True).data)


@extend_schema(tags=["Jobs & Internships"])
class InternshipListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Browse active internship postings")
    def get(self, request):
        qs = Internship.objects.filter(is_active=True).select_related("company").prefetch_related("skills_required")
        search = request.query_params.get("search")
        is_remote = request.query_params.get("is_remote")

        if search:
            qs = qs.filter(title__icontains=search)
        if is_remote is not None:
            qs = qs.filter(is_remote=is_remote.lower() == "true")

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(InternshipSerializer(page, many=True).data)


@extend_schema(tags=["Jobs & Internships"])
class ApplyView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Apply for a job or internship", request=ApplicationCreateSerializer)
    def post(self, request):
        serializer = ApplicationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = get_or_create_student_profile(request.user)
        app = services.apply_for_opportunity(student, serializer.validated_data)
        return APIResponse.created(data=ApplicationSerializer(app).data, message="Application submitted.")


@extend_schema(tags=["Jobs & Internships"])
class StudentApplicationsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="List student's applications")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        apps = student.applications.select_related("job__company", "internship__company")
        return APIResponse.success(data=ApplicationSerializer(apps, many=True).data)


@extend_schema(tags=["Jobs & Internships"])
class StudentBookmarksView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="List student's bookmarked opportunities")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        bms = student.bookmarks.select_related("job__company", "internship__company")
        return APIResponse.success(data=BookmarkSerializer(bms, many=True).data)
