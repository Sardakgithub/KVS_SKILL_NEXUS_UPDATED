"""URL patterns for students — mounted at /api/v1/students/."""
from django.urls import path

from apps.students import views

app_name = "students"

urlpatterns = [
    path("profile/resume/", views.StudentResumeDeleteView.as_view(), name="profile-resume-delete"),
    path("profile/", views.StudentProfileView.as_view(), name="profile"),
    path("dashboard/", views.StudentDashboardView.as_view(), name="dashboard"),
    path("settings/", views.StudentSettingsView.as_view(), name="settings"),
    path("learning-history/", views.LearningHistoryView.as_view(), name="learning-history"),
]
