"""
BaseModel / UUIDBaseModel behavior testing using concrete model.
"""
import pytest
from apps.careers.models import Skill


@pytest.mark.django_db
class TestBaseModel:
    def test_defaults_on_create(self):
        skill = Skill.objects.create(name="GizmoSkill", category="Test")
        assert skill.is_active is True
        assert skill.is_deleted is False
        assert skill.created_at is not None
        assert skill.updated_at is not None

    def test_soft_delete_excludes_from_default_manager(self):
        skill = Skill.objects.create(name="GadgetSkill", category="Test")
        skill.delete()

        assert not Skill.objects.filter(id=skill.id).exists()
        assert Skill.all_objects.filter(id=skill.id).exists()

    def test_restore_brings_it_back(self):
        skill = Skill.objects.create(name="ThingSkill", category="Test")
        skill.delete()
        skill.restore()

        assert Skill.objects.filter(id=skill.id).exists()

    def test_hard_delete_removes_row_permanently(self):
        skill = Skill.objects.create(name="TempSkill", category="Test")
        skill.delete(hard=True)

        assert not Skill.all_objects.filter(id=skill.id).exists()

