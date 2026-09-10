"""URL patterns for careers — mounted at /api/v1/careers/."""
from django.urls import path

from apps.careers import views

app_name = "careers"

urlpatterns = [
    path("categories/", views.CareerCategoryListView.as_view(), name="categories"),
    path("skills/", views.SkillListView.as_view(), name="skills"),
    path("", views.CareerPathListView.as_view(), name="list"),
    path("my-progress/", views.StudentCareerProgressView.as_view(), name="my-progress"),
    path("favorites/", views.FavoriteCareerListView.as_view(), name="favorites"),
    path("<uuid:career_id>/", views.CareerPathDetailView.as_view(), name="detail"),
    path("<uuid:career_id>/enroll/", views.EnrollCareerPathView.as_view(), name="enroll"),
    path("<uuid:career_id>/favorite/", views.ToggleFavoriteCareerView.as_view(), name="toggle-favorite"),
]
