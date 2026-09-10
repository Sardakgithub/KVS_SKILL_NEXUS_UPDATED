"""Views for platform analytics module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.analytics import services
from apps.common.permissions import IsAdmin
from apps.common.responses import APIResponse


@extend_schema(tags=["Analytics"])
class UserGrowthAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Get monthly user registration growth")
    def get(self, request):
        return APIResponse.success(data=services.get_user_growth_analytics())


@extend_schema(tags=["Analytics"])
class CourseAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Get course popularity and completion stats")
    def get(self, request):
        return APIResponse.success(data=services.get_course_analytics())


@extend_schema(tags=["Analytics"])
class CareerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Get career path engagement stats")
    def get(self, request):
        return APIResponse.success(data=services.get_career_analytics())


@extend_schema(tags=["Analytics"])
class JobAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Get job & internship application stats")
    def get(self, request):
        return APIResponse.success(data=services.get_job_application_analytics())
