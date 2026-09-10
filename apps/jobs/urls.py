"""URL patterns for jobs & internships — mounted at /api/v1/jobs/."""
from django.urls import path

from apps.jobs import views

app_name = "jobs"

urlpatterns = [
    path("postings/", views.JobListView.as_view(), name="jobs-list"),
    path("internships/", views.InternshipListView.as_view(), name="internships-list"),
    path("apply/", views.ApplyView.as_view(), name="apply"),
    path("my-applications/", views.StudentApplicationsView.as_view(), name="my-applications"),
    path("my-bookmarks/", views.StudentBookmarksView.as_view(), name="my-bookmarks"),
]
