"""Views for notification module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.pagination import StandardResultsPagination
from apps.common.responses import APIResponse
from apps.notifications import services
from apps.notifications.serializers import NotificationSerializer


@extend_schema(tags=["Notifications"])
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List user notifications")
    def get(self, request):
        qs = request.user.notifications.all()
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(NotificationSerializer(page, many=True).data)


@extend_schema(tags=["Notifications"])
class MarkReadNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Mark a specific notification as read")
    def patch(self, request, notification_id):
        notif = services.mark_notification_read(request.user, notification_id)
        if not notif:
            return APIResponse.not_found("Notification not found.")
        return APIResponse.success(message="Notification marked as read.")


@extend_schema(tags=["Notifications"])
class MarkAllReadNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Mark all notifications as read")
    def post(self, request):
        services.mark_all_notifications_read(request.user)
        return APIResponse.success(message="All notifications marked as read.")
