"""URL patterns for admin panel — mounted at /api/v1/admin-panel/."""
from django.urls import path

from apps.admin_panel import views

app_name = "admin_panel"

urlpatterns = [
    path("dashboard/", views.AdminDashboardView.as_view(), name="dashboard"),
    path("health/", views.SystemHealthView.as_view(), name="system-health"),
    path("users/", views.AdminUserListView.as_view(), name="all-users"),
    path("users/<int:user_id>/status/", views.AdminUserStatusToggleView.as_view(), name="toggle-user-status"),
    path("broadcast/", views.AdminBroadcastView.as_view(), name="send-broadcast"),
    path("mentors/pending/", views.PendingMentorApprovalsView.as_view(), name="pending-mentors"),
    path("mentors/all/", views.AdminMentorListView.as_view(), name="all-mentors"),
    path("mentors/create/", views.AdminCreateMentorView.as_view(), name="create-mentor"),
    path("mentors/<int:mentor_id>/delete/", views.AdminDeleteMentorView.as_view(), name="delete-mentor"),
    path("mentors/<int:mentor_id>/approval/", views.MentorApprovalActionView.as_view(), name="mentor-approval"),
]
