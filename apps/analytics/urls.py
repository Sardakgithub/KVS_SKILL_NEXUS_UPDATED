"""URL patterns for analytics — mounted at /api/v1/analytics/."""
from django.urls import path

from apps.analytics import views

app_name = "analytics"

urlpatterns = [
    path("user-growth/", views.UserGrowthAnalyticsView.as_view(), name="user-growth"),
    path("courses/", views.CourseAnalyticsView.as_view(), name="courses"),
    path("careers/", views.CareerAnalyticsView.as_view(), name="careers"),
    path("jobs/", views.JobAnalyticsView.as_view(), name="jobs"),
]
