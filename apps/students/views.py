"""Views for student module."""
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent
from apps.common.responses import APIResponse
from apps.students import services
from apps.students.serializers import (
    LearningHistorySerializer,
    StudentDashboardSerializer,
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
    StudentSettingSerializer,
)


@extend_schema(tags=["Students"])
class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(summary="Get student profile", responses={200: StudentProfileSerializer})
    def get(self, request):
        profile = services.get_or_create_student_profile(request.user)
        return APIResponse.success(data=StudentProfileSerializer(profile).data)

    @extend_schema(summary="Update student profile", request=StudentProfileUpdateSerializer)
    def patch(self, request):
        serializer = StudentProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = services.update_student_profile(request.user, serializer.validated_data)
        return APIResponse.success(
            data=StudentProfileSerializer(profile).data,
            message="Profile updated successfully.",
        )

    @extend_schema(summary="Delete student uploaded resume file")
    def delete(self, request):
        profile = services.delete_student_resume_file(request.user)
        return APIResponse.success(
            data=StudentProfileSerializer(profile).data,
            message="Uploaded resume file deleted successfully.",
        )


@extend_schema(tags=["Students"])
class StudentResumeDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Delete student uploaded resume file")
    def delete(self, request):
        profile = services.delete_student_resume_file(request.user)
        return APIResponse.success(
            data=StudentProfileSerializer(profile).data,
            message="Uploaded resume file deleted successfully.",
        )



@extend_schema(tags=["Students"])
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Get student dashboard", responses={200: StudentDashboardSerializer})
    def get(self, request):
        data = services.get_student_dashboard(request.user)
        return APIResponse.success(data=StudentDashboardSerializer(data).data)


@extend_schema(tags=["Students"])
class StudentSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Get student settings", responses={200: StudentSettingSerializer})
    def get(self, request):
        settings = services.get_student_settings(request.user)
        return APIResponse.success(data=StudentSettingSerializer(settings).data)

    @extend_schema(summary="Update student settings", request=StudentSettingSerializer)
    def patch(self, request):
        serializer = StudentSettingSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        settings = services.update_student_settings(request.user, serializer.validated_data)
        return APIResponse.success(
            data=StudentSettingSerializer(settings).data,
            message="Settings updated successfully.",
        )


@extend_schema(tags=["Students"])
class LearningHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Get learning history", responses={200: LearningHistorySerializer(many=True)})
    def get(self, request):
        profile = services.get_or_create_student_profile(request.user)
        history = profile.learning_history.all()[:50]
        return APIResponse.success(data=LearningHistorySerializer(history, many=True).data)
