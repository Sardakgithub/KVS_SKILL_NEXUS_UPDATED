"""URL patterns for notifications — mounted at /api/v1/notifications/."""
from django.urls import path

from apps.notifications import views

app_name = "notifications"

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="list"),
    path("<int:notification_id>/read/", views.MarkReadNotificationView.as_view(), name="mark-read"),
    path("read-all/", views.MarkAllReadNotificationView.as_view(), name="mark-all-read"),
]
