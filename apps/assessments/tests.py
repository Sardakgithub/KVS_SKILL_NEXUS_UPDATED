from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.accounts.models import Roles
from apps.students.models import StudentProfile
from apps.careers.models import Skill
from apps.assessments.models import Assessment, Question, Option, AssessmentAttempt, AssessmentAssignment
from apps.assessments import services

User = get_user_model()


class AssessmentModuleTests(TestCase):
    def setUp(self):
        self.mentor_user = User.objects.create_user(
            email="mentor@test.com", password="Password123", role=Roles.MENTOR, first_name="Test", last_name="Mentor"
        )
        self.student_user = User.objects.create_user(
            email="student@test.com", password="Password123", role=Roles.STUDENT, first_name="Test", last_name="Student"
        )
        self.student_profile = StudentProfile.objects.create(user=self.student_user)
        self.skill = Skill.objects.create(name="Python Test", category="Programming")

    def test_execute_code_test_cases(self):
        code = "import sys\nlines = sys.stdin.read().split()\nprint(int(lines[0]) + int(lines[1]))"
        test_cases = [
            {"input": "10 20\n", "expected_output": "30", "is_hidden": False},
            {"input": "-5 15\n", "expected_output": "10", "is_hidden": True},
        ]
        result = services.execute_code_test_cases(code, "python", test_cases)
        self.assertEqual(result["passed"], 2)
        self.assertEqual(result["total"], 2)

    def test_create_and_assign_assessment(self):
        assessment = Assessment.objects.create(
            title="Coding Assessment Test",
            description="Testing code runner",
            skill=self.skill,
            created_by=self.mentor_user,
            passing_score=70,
            time_limit_minutes=20,
        )
        q = Question.objects.create(
            assessment=assessment,
            text="Write a program to add 2 numbers",
            question_type="coding",
            points=5,
            programming_language="python",
            test_cases=[{"input": "2 3\n", "expected_output": "5", "is_hidden": False}]
        )

        assignments = services.assign_assessment(
            assessment=assessment,
            assigned_by_user=self.mentor_user,
            target_type="individual",
            student_ids=[self.student_profile.id],
        )

        self.assertEqual(len(assignments), 1)
        self.assertEqual(assignments[0].student, self.student_profile)
        self.assertEqual(assessment.assignment_type, "individual")

    def test_submit_coding_assessment(self):
        assessment = Assessment.objects.create(
            title="Submit Test",
            skill=self.skill,
            passing_score=50,
        )
        q = Question.objects.create(
            assessment=assessment,
            text="Print hello",
            question_type="coding",
            points=10,
            test_cases=[{"input": "", "expected_output": "hello", "is_hidden": False}]
        )

        attempt = services.start_assessment(self.student_profile, assessment.id)
        submitted_data = {
            "time_taken_seconds": 60,
            "answers": [
                {
                    "question_id": q.id,
                    "code_submission": "print('hello')",
                    "language": "python",
                }
            ]
        }
        res_attempt = services.submit_assessment(self.student_profile, attempt.id, submitted_data)

        self.assertTrue(res_attempt.passed)
        self.assertEqual(res_attempt.score_percentage, 100.0)
        self.assertEqual(res_attempt.status, "submitted")
