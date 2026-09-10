import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestHealthEndpoints:
    def setup_method(self):
        self.client = APIClient()

    def test_liveness_returns_200(self):
        url = reverse("health:liveness")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"]["status"] == "alive"

    def test_readiness_returns_200_when_dependencies_healthy(self):
        url = reverse("health:readiness")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"]["status"] == "ready"
        assert response.data["data"]["checks"]["database"]["healthy"] is True

    def test_health_endpoints_do_not_require_authentication(self):
        for url_name in ("health:liveness", "health:readiness"):
            response = self.client.get(reverse(url_name))
            assert response.status_code != status.HTTP_401_UNAUTHORIZED
