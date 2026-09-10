"""URL patterns for courses — mounted at /api/v1/courses/."""
from django.urls import path

from apps.courses import views

app_name = "courses"

urlpatterns = [
    path("categories/", views.CourseCategoryListView.as_view(), name="categories"),
    path("", views.CourseListView.as_view(), name="list"),
    path("my-enrollments/", views.StudentEnrollmentsView.as_view(), name="my-enrollments"),
    path("<uuid:course_id>/", views.CourseDetailView.as_view(), name="detail"),
    path("<uuid:course_id>/enroll/", views.EnrollCourseView.as_view(), name="enroll"),
    path("<uuid:course_id>/resources/<int:resource_id>/complete/", views.CompleteResourceView.as_view(), name="complete-resource"),
]
