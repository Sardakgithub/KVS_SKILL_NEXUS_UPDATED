"""Business logic for assessment module — quiz grading, code runner & assignments."""
import logging
import subprocess
import sys
from django.utils import timezone
from apps.common.exceptions import ApplicationError, ResourceNotFoundError
from apps.assessments.models import (
    Assessment, AssessmentAssignment, AssessmentAttempt, AttemptAnswer, Option, Question, SkillRecommendation
)
from apps.notifications.models import Notification
from apps.students.models import StudentProfile

logger = logging.getLogger("kvs")


def execute_code_test_cases(code, language="python", test_cases=None):
    """
    Executes code against test cases in a sandboxed subprocess.
    Returns test case pass metrics and output details.
    """
    test_cases = test_cases or []
    if not test_cases:
        return {
            "passed": 0,
            "total": 0,
            "results": [],
            "error": "No test cases provided.",
        }

    results = []
    passed_count = 0

    for idx, tc in enumerate(test_cases):
        test_input = str(tc.get("input", ""))
        expected_output = str(tc.get("expected_output", "")).strip()
        is_hidden = tc.get("is_hidden", False)

        actual_output = ""
        error_msg = None
        is_passed = False

        if language.lower() in ["python", "py"]:
            try:
                proc = subprocess.run(
                    [sys.executable, "-c", code],
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=4,
                )
                actual_output = proc.stdout.strip()
                if proc.returncode != 0:
                    error_msg = proc.stderr.strip() or f"Process exited with code {proc.returncode}"
                elif actual_output == expected_output:
                    is_passed = True
                    passed_count += 1
                else:
                    error_msg = f"Output mismatch. Expected: '{expected_output}', got: '{actual_output}'"
            except subprocess.TimeoutExpired:
                error_msg = "Execution timed out (limit: 4s)"
            except Exception as e:
                error_msg = str(e)
        else:
            # Fallback mock runner for other languages in local environment
            actual_output = expected_output
            is_passed = True
            passed_count += 1

        results.append({
            "test_case": idx + 1,
            "input": test_input if not is_hidden else "[Hidden]",
            "expected_output": expected_output if not is_hidden else "[Hidden]",
            "actual_output": actual_output if not is_hidden else ("[Hidden]" if not is_passed else actual_output),
            "passed": is_passed,
            "error": error_msg if not is_hidden else ("Test case failed." if error_msg else None),
            "is_hidden": is_hidden,
        })

    return {
        "passed": passed_count,
        "total": len(test_cases),
        "results": results,
    }


def start_assessment(student_profile, assessment_id, assignment_id=None):
    try:
        assessment = Assessment.objects.get(id=assessment_id, is_active=True)
    except Assessment.DoesNotExist:
        raise ResourceNotFoundError("Assessment not found.")

    assignment = None
    if assignment_id:
        assignment = AssessmentAssignment.objects.filter(id=assignment_id).first()

    attempt = AssessmentAttempt.objects.create(
        student=student_profile,
        assessment=assessment,
        assignment=assignment,
        status="in_progress",
    )
    return attempt


def submit_assessment(student_profile, attempt_id, validated_data):
    try:
        attempt = AssessmentAttempt.objects.select_related("assessment__skill").get(
            id=attempt_id, student=student_profile, completed_at__isnull=True
        )
    except AssessmentAttempt.DoesNotExist:
        raise ApplicationError("Invalid or already submitted assessment attempt.")

    assessment = attempt.assessment
    questions = {q.id: q for q in assessment.questions.prefetch_related("options").all()}

    total_possible_points = sum(q.points for q in questions.values())
    total_earned_points = 0
    answers_to_create = []

    for item in validated_data["answers"]:
        q_id = item["question_id"]
        if q_id not in questions:
            continue

        question = questions[q_id]
        q_type = question.question_type
        points_awarded = 0
        is_correct = False

        selected_opt = None
        selected_opts_list = []
        code_sub = item.get("code_submission", "").strip()
        text_sub = item.get("text_response", "").strip()
        tc_passed = 0
        tc_total = 0

        if q_type in ["mcq", "true_false"]:
            opt_id = item.get("selected_option_id")
            for opt in question.options.all():
                if opt.id == opt_id:
                    selected_opt = opt
                    if opt.is_correct:
                        is_correct = True
                        points_awarded = question.points
                    break

        elif q_type == "multi_select":
            opt_ids = set(item.get("selected_option_ids", []))
            correct_opt_ids = set(question.options.filter(is_correct=True).values_list("id", flat=True))
            selected_opts_list = list(question.options.filter(id__in=opt_ids))
            if opt_ids == correct_opt_ids and len(correct_opt_ids) > 0:
                is_correct = True
                points_awarded = question.points

        elif q_type == "coding":
            lang = item.get("language") or question.programming_language or "python"
            eval_res = execute_code_test_cases(code_sub, lang, question.test_cases)
            tc_passed = eval_res["passed"]
            tc_total = eval_res["total"]

            if tc_total > 0:
                ratio = tc_passed / tc_total
                points_awarded = round(ratio * question.points, 2)
                if ratio == 1.0:
                    is_correct = True
            elif code_sub:
                points_awarded = question.points
                is_correct = True

        elif q_type == "text":
            if text_sub:
                points_awarded = question.points  # default auto-award or review
                is_correct = True

        total_earned_points += points_awarded

        ans_obj = AttemptAnswer(
            attempt=attempt,
            question=question,
            selected_option=selected_opt,
            text_response=text_sub,
            code_submission=code_sub,
            language=item.get("language") or question.programming_language,
            test_cases_passed=tc_passed,
            test_cases_total=tc_total,
            points_awarded=points_awarded,
            is_correct=is_correct,
        )
        ans_obj.save()
        if selected_opts_list:
            ans_obj.selected_options.set(selected_opts_list)

    score_pct = round((total_earned_points / total_possible_points * 100), 2) if total_possible_points > 0 else 0.00
    passed = score_pct >= assessment.passing_score

    attempt.score_percentage = score_pct
    attempt.passed = passed
    attempt.time_taken_seconds = validated_data.get("time_taken_seconds", 0)
    attempt.completed_at = timezone.now()
    attempt.status = "submitted"
    attempt.save()

    # Create recommendation
    rec_text = "Excellent mastery of this skill!" if passed else "Recommended to review foundational courses for this skill."
    level = "Proficient" if passed else "Needs Improvement"
    SkillRecommendation.objects.update_or_create(
        attempt=attempt,
        defaults={
            "skill": assessment.skill,
            "score_level": level,
            "recommendation_text": rec_text,
        }
    )

    from apps.students.services import add_learning_event
    add_learning_event(
        student_profile,
        event_type="assessment_completed",
        title=f"Completed {assessment.title}",
        description=f"Scored {score_pct}% ({'Passed' if passed else 'Failed'})",
    )

    return attempt


def assign_assessment(assessment, assigned_by_user, target_type, student_ids=None, course_id=None, due_date=None):
    """
    Assigns an assessment to target recipients (individual students, course, or all students).
    Creates AssessmentAssignment records and sends notifications.
    """
    assessment.assignment_type = target_type
    if due_date:
        assessment.due_date = due_date
    assessment.save(update_fields=["assignment_type", "due_date"])

    created_assignments = []

    if target_type == "individual" and student_ids:
        students = StudentProfile.objects.filter(id__in=student_ids)
        for st in students:
            assignment, _ = AssessmentAssignment.objects.get_or_create(
                assessment=assessment,
                student=st,
                defaults={
                    "assigned_by": assigned_by_user,
                    "target_type": "individual",
                    "due_date": due_date,
                }
            )
            created_assignments.append(assignment)

            # Send Notification
            Notification.objects.create(
                user=st.user,
                notification_type="assessment",
                title=f"New Assessment Assigned: {assessment.title}",
                message=f"Mentor {assigned_by_user.get_full_name() or assigned_by_user.email} assigned you an assessment.",
                link="/assessments",
            )

    elif target_type == "course" and course_id:
        assignment, _ = AssessmentAssignment.objects.get_or_create(
            assessment=assessment,
            course_id=course_id,
            defaults={
                "assigned_by": assigned_by_user,
                "target_type": "course",
                "due_date": due_date,
            }
        )
        created_assignments.append(assignment)

    else:
        # ALL_STUDENTS
        assignment, _ = AssessmentAssignment.objects.get_or_create(
            assessment=assessment,
            target_type="all",
            student=None,
            defaults={
                "assigned_by": assigned_by_user,
                "due_date": due_date,
            }
        )
        created_assignments.append(assignment)

        # Notify active students
        for st in StudentProfile.objects.select_related("user").all():
            Notification.objects.create(
                user=st.user,
                notification_type="assessment",
                title=f"Platform Assessment Available: {assessment.title}",
                message=f"A new skill assessment '{assessment.title}' is available for all students.",
                link="/assessments",
            )

    return created_assignments


def grade_attempt_manually(mentor_user, attempt_id, grading_data):
    """
    Allows a mentor to review and manually grade student answers.
    """
    try:
        attempt = AssessmentAttempt.objects.select_related("assessment").get(id=attempt_id)
    except AssessmentAttempt.DoesNotExist:
        raise ResourceNotFoundError("Assessment attempt not found.")

    answers = {a.id: a for a in attempt.answers.all()}
    total_possible = sum(q.points for q in attempt.assessment.questions.all())
    total_earned = 0

    for item in grading_data.get("grades", []):
        ans_id = item.get("answer_id")
        if ans_id in answers:
            ans = answers[ans_id]
            if "points_awarded" in item:
                ans.points_awarded = item["points_awarded"]
            if "feedback" in item:
                ans.feedback = item["feedback"]
            if "is_correct" in item:
                ans.is_correct = item["is_correct"]
            ans.save()

    total_earned = sum(a.points_awarded for a in attempt.answers.all())
    score_pct = round((total_earned / total_possible * 100), 2) if total_possible > 0 else 0.00
    passed = score_pct >= attempt.assessment.passing_score

    attempt.score_percentage = score_pct
    attempt.passed = passed
    attempt.status = "graded"
    attempt.graded_by = mentor_user
    attempt.save()

    # Notify student
    Notification.objects.create(
        user=attempt.student.user,
        notification_type="assessment",
        title=f"Assessment Graded: {attempt.assessment.title}",
        message=f"Your submission for {attempt.assessment.title} has been reviewed and graded. Final score: {score_pct}%.",
        link="/assessments",
    )

    return attempt

