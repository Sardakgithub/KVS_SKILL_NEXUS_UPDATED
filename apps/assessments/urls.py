"""URL patterns for assessments — mounted at /api/v1/assessments/."""
from django.urls import path

from apps.assessments import views

app_name = "assessments"

urlpatterns = [
    # Student Routes
    path("", views.AssessmentListView.as_view(), name="list"),
    path("assigned/", views.StudentAssignedAssessmentsView.as_view(), name="assigned"),
    path("my-attempts/", views.StudentAttemptsView.as_view(), name="my-attempts"),
    path("run-code/", views.RunCodePlaygroundView.as_view(), name="run-code"),
    path("<uuid:assessment_id>/", views.AssessmentDetailView.as_view(), name="detail"),
    path("<uuid:assessment_id>/start/", views.StartAssessmentView.as_view(), name="start"),
    path("attempts/<uuid:attempt_id>/submit/", views.SubmitAssessmentView.as_view(), name="submit"),

    # Mentor & Admin Routes
    path("mentor/my-assessments/", views.MentorAssessmentListCreateView.as_view(), name="mentor-list-create"),
    path("mentor/students-list/", views.MentorStudentListView.as_view(), name="mentor-students-list"),
    path("mentor/<uuid:assessment_id>/", views.MentorAssessmentDetailView.as_view(), name="mentor-detail"),
    path("mentor/<uuid:assessment_id>/assign/", views.MentorAssignAssessmentView.as_view(), name="mentor-assign"),
    path("mentor/<uuid:assessment_id>/submissions/", views.MentorAssessmentSubmissionsView.as_view(), name="mentor-submissions"),
    path("mentor/attempts/<uuid:attempt_id>/grade/", views.MentorGradeSubmissionView.as_view(), name="mentor-grade"),
]

