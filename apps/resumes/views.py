"""Views for resume builder module."""
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.common.permissions import IsStudent
from apps.common.responses import APIResponse
from apps.resumes import services
from apps.resumes.models import (
    Achievement, Certification, Education, Experience, Language, Project, ResumeSkill
)
from apps.resumes.serializers import (
    AchievementSerializer, CertificationSerializer, EducationSerializer,
    ExperienceSerializer, FullResumeSerializer, LanguageSerializer,
    ProjectSerializer, ResumeSkillSerializer,
)
from apps.students.services import get_or_create_student_profile


@extend_schema(tags=["Resume Builder"])
class ResumeDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @extend_schema(summary="Get full student resume profile", responses={200: FullResumeSerializer})
    def get(self, request):
        student = get_or_create_student_profile(request.user)
        resume = services.get_or_create_resume(student)
        return APIResponse.success(data=FullResumeSerializer(resume).data)

    @extend_schema(summary="Update resume summary/title")
    def patch(self, request):
        student = get_or_create_student_profile(request.user)
        resume = services.update_resume_summary(
            student,
            title=request.data.get("title"),
            summary=request.data.get("summary"),
        )
        return APIResponse.success(data=FullResumeSerializer(resume).data, message="Resume updated.")


# --- Generic Section CRUD helper ---
class SectionListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
    model = None
    serializer_class = None
    related_name = None

    def post(self, request):
        student = get_or_create_student_profile(request.user)
        resume = services.get_or_create_resume(student)
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(resume=resume)
        return APIResponse.created(data=self.serializer_class(item).data)


class SectionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
    model = None
    serializer_class = None

    def delete(self, request, item_id):
        student = get_or_create_student_profile(request.user)
        resume = services.get_or_create_resume(student)
        item = self.model.objects.get(id=item_id, resume=resume)
        item.delete()
        return APIResponse.no_content()


class EducationView(SectionListCreateView):
    model = Education
    serializer_class = EducationSerializer


class EducationDetailView(SectionDetailView):
    model = Education


class ExperienceView(SectionListCreateView):
    model = Experience
    serializer_class = ExperienceSerializer


class ExperienceDetailView(SectionDetailView):
    model = Experience


class ProjectView(SectionListCreateView):
    model = Project
    serializer_class = ProjectSerializer


class ProjectDetailView(SectionDetailView):
    model = Project


class SkillView(SectionListCreateView):
    model = ResumeSkill
    serializer_class = ResumeSkillSerializer


class SkillDetailView(SectionDetailView):
    model = ResumeSkill
