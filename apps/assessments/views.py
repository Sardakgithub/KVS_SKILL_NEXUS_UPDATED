"""Views for assessment module."""
from drf_spectacular.utils import extend_schema
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent, IsMentorOrAdmin
from apps.common.responses import APIResponse
from apps.common.pagination import StandardResultsPagination
from apps.common.exceptions import ResourceNotFoundError, ApplicationError
from apps.assessments import services
from apps.assessments.models import Assessment, AssessmentAssignment, AssessmentAttempt
from apps.assessments.serializers import (
    AssessmentAssignRequestSerializer, AssessmentAssignmentSerializer,
    AssessmentAttemptResultSerializer, AssessmentCreateUpdateSerializer,
    AssessmentDetailSerializer, AssessmentListSerializer, AssessmentSubmitSerializer,
    CodeRunRequestSerializer, ManualGradingRequestSerializer
)
from apps.students.models import StudentProfile
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Assessments"])
class AssessmentListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List available skill assessments")
    def get(self, request):
        qs = Assessment.objects.filter(is_active=True).select_related("skill", "created_by")
        difficulty = request.query_params.get("difficulty")
        skill_id = request.query_params.get("skill")

        if difficulty:
            qs = qs.filter(difficulty_level=difficulty)
        if skill_id:
            qs = qs.filter(skill_id=skill_id)

        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(AssessmentListSerializer(page, many=True).data)


@extend_schema(tags=["Assessments"])
class StudentAssignedAssessmentsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="List assessments specifically assigned to the student")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        # Find individual assignments or platform-wide (all) assignments
        assignments = AssessmentAssignment.objects.filter(
            Q(target_type="all") | Q(student=student)
        ).select_related("assessment__skill", "assigned_by")

        data = AssessmentAssignmentSerializer(assignments, many=True).data
        return APIResponse.success(data=data)


@extend_schema(tags=["Assessments"])
class AssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get assessment detail with questions")
    def get(self, request, assessment_id):
        try:
            assessment = Assessment.objects.select_related("skill", "created_by").prefetch_related(
                "questions__options"
            ).get(id=assessment_id, is_active=True)
        except Assessment.DoesNotExist:
            raise ResourceNotFoundError("Assessment not found.")
        return APIResponse.success(data=AssessmentDetailSerializer(assessment).data)


@extend_schema(tags=["Assessments"])
class StartAssessmentView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Start a new assessment attempt")
    def post(self, request, assessment_id):
        assignment_id = request.data.get("assignment_id")
        student = get_or_create_student_profile(request.user)
        attempt = services.start_assessment(student, assessment_id, assignment_id=assignment_id)
        return APIResponse.created(
            data={"attempt_id": attempt.id, "started_at": attempt.started_at},
            message="Assessment attempt started.",
        )


@extend_schema(tags=["Assessments"])
class SubmitAssessmentView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Submit answers for an assessment attempt", request=AssessmentSubmitSerializer)
    def post(self, request, attempt_id):
        serializer = AssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = get_or_create_student_profile(request.user)
        attempt = services.submit_assessment(student, attempt_id, serializer.validated_data)
        return APIResponse.success(
            data=AssessmentAttemptResultSerializer(attempt).data,
            message="Assessment submitted and graded.",
        )


@extend_schema(tags=["Assessments"])
class RunCodePlaygroundView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Test run student code against test cases", request=CodeRunRequestSerializer)
    def post(self, request):
        serializer = CodeRunRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        eval_result = services.execute_code_test_cases(
            code=data.get("code", ""),
            language=data.get("language", "python"),
            test_cases=data.get("test_cases", []),
        )
        return APIResponse.success(data=eval_result)


@extend_schema(tags=["Assessments"])
class StudentAttemptsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="List student's assessment attempt history")
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        attempts = student.assessment_attempts.select_related("assessment", "recommendation").prefetch_related("answers")
        return APIResponse.success(data=AssessmentAttemptResultSerializer(attempts, many=True).data)


# --- MENTOR ASSESSMENT MANAGEMENT VIEWS ---

@extend_schema(tags=["Mentor Assessments"])
class MentorAssessmentListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsMentorOrAdmin]

    @extend_schema(summary="List assessments created by mentor")
    def get(self, request):
        qs = Assessment.objects.select_related("skill").prefetch_related("questions").order_by("-created_at")
        if not request.user.is_superuser and getattr(request.user, "role", None) != "admin":
            qs = qs.filter(created_by=request.user)

        serializer = AssessmentDetailSerializer(qs, many=True)
        return APIResponse.success(data=serializer.data)

    @extend_schema(summary="Create a new assessment with questions and coding test cases", request=AssessmentCreateUpdateSerializer)
    def post(self, request):
        serializer = AssessmentCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save(created_by=request.user)
        return APIResponse.created(
            data=AssessmentDetailSerializer(assessment).data,
            message="Assessment created successfully."
        )


@extend_schema(tags=["Mentor Assessments"])
class MentorAssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsMentorOrAdmin]

    def get_object(self, assessment_id, user):
        try:
            qs = Assessment.objects.select_related("skill").prefetch_related("questions__options")
            if not user.is_superuser and getattr(user, "role", None) != "admin":
                qs = qs.filter(created_by=user)
            return qs.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise ResourceNotFoundError("Assessment not found or permission denied.")

    @extend_schema(summary="Get mentor assessment detail")
    def get(self, request, assessment_id):
        assessment = self.get_object(assessment_id, request.user)
        return APIResponse.success(data=AssessmentDetailSerializer(assessment).data)

    @extend_schema(summary="Update an assessment", request=AssessmentCreateUpdateSerializer)
    def put(self, request, assessment_id):
        assessment = self.get_object(assessment_id, request.user)
        serializer = AssessmentCreateUpdateSerializer(assessment, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_assessment = serializer.save()
        return APIResponse.success(
            data=AssessmentDetailSerializer(updated_assessment).data,
            message="Assessment updated successfully."
        )

    @extend_schema(summary="Delete an assessment")
    def delete(self, request, assessment_id):
        assessment = self.get_object(assessment_id, request.user)
        assessment.delete()
        return APIResponse.success(message="Assessment deleted successfully.")


@extend_schema(tags=["Mentor Assessments"])
class MentorAssignAssessmentView(APIView):
    permission_classes = [IsAuthenticated, IsMentorOrAdmin]

    @extend_schema(summary="Assign assessment to individual students or whole platform", request=AssessmentAssignRequestSerializer)
    def post(self, request, assessment_id):
        serializer = AssessmentAssignRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            assessment = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            raise ResourceNotFoundError("Assessment not found.")

        assignments = services.assign_assessment(
            assessment=assessment,
            assigned_by_user=request.user,
            target_type=data["target_type"],
            student_ids=data.get("student_ids", []),
            course_id=data.get("course_id"),
            due_date=data.get("due_date"),
        )
        return APIResponse.success(
            data={"assigned_count": len(assignments)},
            message=f"Assessment assigned successfully ({data['target_type']})."
        )


@extend_schema(tags=["Mentor Assessments"])
class MentorAssessmentSubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsMentorOrAdmin]

    @extend_schema(summary="List all student submissions for a specific assessment")
    def get(self, request, assessment_id):
        attempts = AssessmentAttempt.objects.filter(
            assessment_id=assessment_id
        ).select_related("student__user", "assessment", "recommendation").prefetch_related("answers__question", "answers__selected_option", "answers__selected_options")

        data = AssessmentAttemptResultSerializer(attempts, many=True).data
        return APIResponse.success(data=data)


@extend_schema(tags=["Mentor Assessments"])
class MentorGradeSubmissionView(APIView):
    permission_classes = [IsAuthenticated, IsMentorOrAdmin]

    @extend_schema(summary="Manually grade or override points for a student submission", request=ManualGradingRequestSerializer)
    def post(self, request, attempt_id):
        serializer = ManualGradingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        attempt = services.grade_attempt_manually(request.user, attempt_id, serializer.validated_data)
        return APIResponse.success(
            data=AssessmentAttemptResultSerializer(attempt).data,
            message="Submission graded successfully."
        )


@extend_schema(tags=["Mentor Assessments"])
class MentorStudentListView(APIView):
    permission_classes = [IsAuthenticated, IsMentorOrAdmin]

    @extend_schema(summary="Search active students for targeted assignment")
    def get(self, request):
        search = request.query_params.get("search", "")
        qs = StudentProfile.objects.select_related("user").all()
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        data = [
            {
                "id": st.id,
                "name": st.user.get_full_name() or st.user.username,
                "email": st.user.email,
                "headline": st.headline,
            }
            for st in qs[:50]
        ]
        return APIResponse.success(data=data)

