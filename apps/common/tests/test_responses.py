from apps.common.responses import APIResponse


class TestAPIResponse:
    def test_success_envelope_shape(self):
        response = APIResponse.success(data={"id": 1}, message="OK")
        assert response.status_code == 200
        assert response.data == {
            "success": True,
            "message": "OK",
            "data": {"id": 1},
            "errors": None,
            "meta": None,
        }

    def test_created_returns_201(self):
        response = APIResponse.created(data={"id": 1})
        assert response.status_code == 201
        assert response.data["success"] is True

    def test_error_envelope_shape(self):
        response = APIResponse.error(message="Bad input", errors={"name": ["required"]})
        assert response.status_code == 400
        assert response.data["success"] is False
        assert response.data["errors"] == {"name": ["required"]}

    def test_not_found_returns_404(self):
        response = APIResponse.not_found()
        assert response.status_code == 404
        assert response.data["success"] is False

    def test_validation_error_returns_422(self):
        response = APIResponse.validation_error(errors={"email": ["invalid"]})
        assert response.status_code == 422
