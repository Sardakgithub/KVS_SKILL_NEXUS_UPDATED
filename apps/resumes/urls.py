"""URL patterns for resume builder — mounted at /api/v1/resumes/."""
from django.urls import path

from apps.resumes import views

app_name = "resumes"

urlpatterns = [
    path("", views.ResumeDetailView.as_view(), name="detail"),
    path("detail/", views.ResumeDetailView.as_view(), name="detail-alias"),
    path("education/", views.EducationView.as_view(), name="education-create"),
    path("education/<int:item_id>/", views.EducationDetailView.as_view(), name="education-delete"),
    path("experience/", views.ExperienceView.as_view(), name="experience-create"),
    path("experience/<int:item_id>/", views.ExperienceDetailView.as_view(), name="experience-delete"),
    path("projects/", views.ProjectView.as_view(), name="project-create"),
    path("projects/<int:item_id>/", views.ProjectDetailView.as_view(), name="project-delete"),
    path("skills/", views.SkillView.as_view(), name="skill-create"),
    path("skills/<int:item_id>/", views.SkillDetailView.as_view(), name="skill-delete"),
]
