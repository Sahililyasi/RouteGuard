
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



def test_route_success(client, monkeypatch):
    from app.routes import route_routes

    def fake_get_road_route(origin, destination):
        return {
            "status": "route_found",
            "origin": origin,
            "destination": destination,
            "distance_km": 186.29,
            "duration_minutes": 205,
            "geometry": {
                "type": "LineString",
                "coordinates": [[77.4126, 23.2599], [75.8577, 22.7196]],
            },
            "provider": "OSRM",
        }

    monkeypatch.setattr(route_routes, "get_road_route", fake_get_road_route)

    response = client.post(
        "/api/routes/analyze",
        json={"origin": "Bhopal", "destination": "Indore"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "route_found"
    assert data["distance_km"] == 186.29
    assert data["duration_minutes"] == 205
    assert data["geometry"]["type"] == "LineString"
