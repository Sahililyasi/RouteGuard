
import pytest

from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    response = client.get("/api/health")

    assert response.status_code == 200


def test_route_missing_origin(client):
    response = client.post(
        "/api/routes/analyze",
        json={"destination": "Indore"},
    )

    assert response.status_code == 400


def test_route_missing_destination(client):
    response = client.post(
        "/api/routes/analyze",
        json={"origin": "Bhopal"},
    )

    assert response.status_code == 400
