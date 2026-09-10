"""Serializers for assessment module."""
from rest_framework import serializers

from apps.assessments.models import (
    Assessment, AssessmentAssignment, AssessmentAttempt, AttemptAnswer, Option, Question, SkillRecommendation
)
from apps.careers.serializers import SkillSerializer
from apps.careers.models import Skill


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text", "order"]  # Hide is_correct from student quiz view!


class OptionWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Option
        fields = ["id", "text", "is_correct", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id", "text", "question_type", "points", "explanation", "order",
            "starter_code", "programming_language", "test_cases", "options",
        ]


class QuestionWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    options = OptionWriteSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = [
            "id", "text", "question_type", "points", "explanation", "order",
            "starter_code", "programming_language", "test_cases", "options",
        ]


class AssessmentListSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            "id", "title", "description", "instructions", "skill", "difficulty_level",
            "time_limit_minutes", "passing_score", "total_questions", "assignment_type",
            "due_date", "created_by_name", "created_at",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return "Platform Admin"


class AssessmentDetailSerializer(AssessmentListSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(AssessmentListSerializer.Meta):
        fields = AssessmentListSerializer.Meta.fields + ["questions"]


class AssessmentCreateUpdateSerializer(serializers.ModelSerializer):
    skill_id = serializers.IntegerField()
    description = serializers.CharField(required=False, allow_blank=True, default="")
    instructions = serializers.CharField(required=False, allow_blank=True, default="")
    due_date = serializers.DateTimeField(required=False, allow_null=True)
    questions = QuestionWriteSerializer(many=True, required=False)

    class Meta:
        model = Assessment
        fields = [
            "id", "title", "description", "instructions", "skill_id", "difficulty_level",
            "time_limit_minutes", "passing_score", "assignment_type", "due_date", "questions",
        ]


    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        skill_id = validated_data.pop("skill_id")

        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            raise serializers.ValidationError({"skill_id": "Invalid skill ID."})

        assessment = Assessment.objects.create(
            skill=skill,
            total_questions=len(questions_data),
            **validated_data
        )

        for q_idx, q_data in enumerate(questions_data, start=1):
            options_data = q_data.pop("options", [])
            q_data["order"] = q_data.get("order", q_idx)
            question = Question.objects.create(assessment=assessment, **q_data)

            for o_idx, o_data in enumerate(options_data, start=1):
                o_data["order"] = o_data.get("order", o_idx)
                Option.objects.create(question=question, **o_data)

        return assessment

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)
        skill_id = validated_data.pop("skill_id", None)

        if skill_id:
            try:
                instance.skill = Skill.objects.get(id=skill_id)
            except Skill.DoesNotExist:
                raise serializers.ValidationError({"skill_id": "Invalid skill ID."})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if questions_data is not None:
            instance.questions.all().delete()
            instance.total_questions = len(questions_data)
            for q_idx, q_data in enumerate(questions_data, start=1):
                options_data = q_data.pop("options", [])
                q_data.pop("id", None)
                q_data["order"] = q_data.get("order", q_idx)
                question = Question.objects.create(assessment=instance, **q_data)

                for o_idx, o_data in enumerate(options_data, start=1):
                    o_data.pop("id", None)
                    o_data["order"] = o_data.get("order", o_idx)
                    Option.objects.create(question=question, **o_data)

        instance.save()
        return instance


class SubmitAnswerItemSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option_id = serializers.IntegerField(required=False, allow_null=True)
    selected_option_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    text_response = serializers.CharField(required=False, allow_blank=True, default="")
    code_submission = serializers.CharField(required=False, allow_blank=True, default="")
    language = serializers.CharField(required=False, allow_blank=True, default="python")


class AssessmentSubmitSerializer(serializers.Serializer):
    time_taken_seconds = serializers.IntegerField(default=0)
    answers = SubmitAnswerItemSerializer(many=True)


class CodeRunRequestSerializer(serializers.Serializer):
    code = serializers.CharField(allow_blank=True, default="")
    language = serializers.CharField(default="python")
    test_cases = serializers.ListField(child=serializers.DictField(), required=False, default=list)


class AssessmentAssignRequestSerializer(serializers.Serializer):
    target_type = serializers.ChoiceField(choices=["all", "individual", "course"])
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    course_id = serializers.IntegerField(required=False, allow_null=True)
    due_date = serializers.DateTimeField(required=False, allow_null=True)

    def to_internal_value(self, data):
        if isinstance(data, dict) and data.get("due_date") == "":
            data = data.copy()
            data["due_date"] = None
        return super().to_internal_value(data)



class AttemptAnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source="question.id", read_only=True)
    question_text = serializers.CharField(source="question.text", read_only=True)
    question_type = serializers.CharField(source="question.question_type", read_only=True)
    selected_option_text = serializers.CharField(source="selected_option.text", read_only=True, default="")
    selected_options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = AttemptAnswer
        fields = [
            "id", "question_id", "question_text", "question_type", "selected_option_text",
            "selected_options", "text_response", "code_submission", "language",
            "test_cases_passed", "test_cases_total", "points_awarded", "is_correct", "feedback",
        ]


class SkillRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillRecommendation
        fields = ["id", "score_level", "recommendation_text"]


class AssessmentAttemptResultSerializer(serializers.ModelSerializer):
    assessment_id = serializers.UUIDField(source="assessment.id", read_only=True)
    assessment_title = serializers.CharField(source="assessment.title", read_only=True)
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)
    student_email = serializers.EmailField(source="student.user.email", read_only=True)
    answers = AttemptAnswerSerializer(many=True, read_only=True)
    recommendation = SkillRecommendationSerializer(read_only=True)

    class Meta:
        model = AssessmentAttempt
        fields = [
            "id", "assessment_id", "assessment_title", "student_name", "student_email",
            "started_at", "completed_at", "score_percentage", "passed", "status",
            "time_taken_seconds", "answers", "recommendation",
        ]


class ManualGradeItemSerializer(serializers.Serializer):
    answer_id = serializers.IntegerField()
    points_awarded = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    feedback = serializers.CharField(required=False, allow_blank=True)
    is_correct = serializers.BooleanField(required=False)


class ManualGradingRequestSerializer(serializers.Serializer):
    grades = ManualGradeItemSerializer(many=True)


class AssessmentAssignmentSerializer(serializers.ModelSerializer):
    assessment = AssessmentListSerializer(read_only=True)
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True, default="All Platform Students")

    class Meta:
        model = AssessmentAssignment
        fields = ["id", "assessment", "target_type", "student_name", "due_date", "created_at"]

