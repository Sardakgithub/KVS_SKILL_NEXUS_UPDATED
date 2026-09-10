"""
Celery application for KVS Skill Nexus.

Every domain app can define tasks in `apps/<app>/tasks.py`; Celery
auto-discovers them via `app.autodiscover_tasks()` below, so nothing further
needs to change here as new modules are added.
"""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("kvs_skill_nexus")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
