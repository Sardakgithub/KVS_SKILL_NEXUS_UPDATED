"""Views for admin management panel."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.accounts.serializers import UserSerializer
from apps.admin_panel import services
from apps.admin_panel.serializers import (
    AdminDashboardSummarySerializer,
    MentorApprovalActionSerializer,
    AdminCreateMentorSerializer,
    SystemHealthSerializer,
    UserStatusToggleSerializer,
    BroadcastNotificationSerializer,
)
from apps.common.permissions import IsAdmin
from apps.common.responses import APIResponse
from apps.common.pagination import StandardResultsPagination
from apps.mentors.models import MentorProfile
from apps.mentors.serializers import MentorProfileSerializer


@extend_schema(tags=["Admin Panel"])
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Get system-wide admin metrics summary")
    def get(self, request):
        metrics = services.get_admin_dashboard_metrics()
        return APIResponse.success(data=AdminDashboardSummarySerializer(metrics).data)


@extend_schema(tags=["Admin Panel"])
class SystemHealthView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Get system operational health status")
    def get(self, request):
        health_data = services.get_system_health()
        return APIResponse.success(data=SystemHealthSerializer(health_data).data)


@extend_schema(tags=["Admin Panel"])
class PendingMentorApprovalsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="List mentors pending admin approval")
    def get(self, request):
        pending = MentorProfile.objects.filter(is_approved=False).select_related("user")
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(pending, request)
        return paginator.get_paginated_response(MentorProfileSerializer(page, many=True).data)


@extend_schema(tags=["Admin Panel"])
class MentorApprovalActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Approve or reject a mentor application", request=MentorApprovalActionSerializer)
    def post(self, request, mentor_id):
        serializer = MentorApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mentor = services.approve_or_reject_mentor(
            mentor_id=mentor_id,
            approve=serializer.validated_data["approve"],
            notes=serializer.validated_data.get("notes", ""),
        )
        status_text = "approved" if serializer.validated_data["approve"] else "rejected"
        return APIResponse.success(
            data=MentorProfileSerializer(mentor).data,
            message=f"Mentor application {status_text}.",
        )


@extend_schema(tags=["Admin Panel"])
class AdminMentorListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="List all mentors (approved and pending)")
    def get(self, request):
        mentors = MentorProfile.objects.all().select_related("user")
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(mentors, request)
        return paginator.get_paginated_response(MentorProfileSerializer(page, many=True).data)


@extend_schema(tags=["Admin Panel"])
class AdminCreateMentorView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Create a new mentor account from Admin UI", request=AdminCreateMentorSerializer)
    def post(self, request):
        serializer = AdminCreateMentorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mentor = services.create_mentor_by_admin(serializer.validated_data)
        return APIResponse.created(
            data=MentorProfileSerializer(mentor).data,
            message="Mentor account successfully created by Admin.",
        )


@extend_schema(tags=["Admin Panel"])
class AdminDeleteMentorView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Delete a mentor account and profile")
    def delete(self, request, mentor_id):
        services.delete_mentor_by_admin(mentor_id)
        return APIResponse.success(message="Mentor account successfully deleted.")


@extend_schema(tags=["Admin Panel"])
class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="List all users with search, role filter, and status filter")
    def get(self, request):
        query = request.query_params.get("search")
        role = request.query_params.get("role")
        is_active_param = request.query_params.get("is_active")
        is_active = None
        if is_active_param is not None:
            is_active = is_active_param.lower() in ["true", "1"]

        users = services.get_all_users_admin(query=query, role=role, is_active=is_active)
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(users, request)
        return paginator.get_paginated_response(UserSerializer(page, many=True).data)


@extend_schema(tags=["Admin Panel"])
class AdminUserStatusToggleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Toggle user active status or email verification", request=UserStatusToggleSerializer)
    def patch(self, request, user_id):
        serializer = UserStatusToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = services.toggle_user_status(
            user_id=user_id,
            is_active=serializer.validated_data.get("is_active"),
            is_email_verified=serializer.validated_data.get("is_email_verified"),
        )
        return APIResponse.success(
            data=UserSerializer(user).data,
            message="User status updated successfully.",
        )


@extend_schema(tags=["Admin Panel"])
class AdminBroadcastView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(summary="Send broadcast notification to users", request=BroadcastNotificationSerializer)
    def post(self, request):
        serializer = BroadcastNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        count = services.send_broadcast_notification(
            title=serializer.validated_data["title"],
            message=serializer.validated_data["message"],
            target_role=serializer.validated_data.get("target_role", "all"),
        )
        return APIResponse.success(
            message=f"Broadcast notification dispatched successfully to {count} users."
        )


