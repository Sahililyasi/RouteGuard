
from flask import Blueprint, request
import requests

from app.services.routing_service import get_road_route

route_bp = Blueprint("routes", __name__, url_prefix="/api/routes")


@route_bp.post("/analyze")
def analyze_route():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return {
            "error": "Request body must be valid JSON."
        }, 400

    origin = data.get("origin")
    destination = data.get("destination")

    if not isinstance(origin, str) or not origin.strip():
        return {"error": "Origin is required."}, 400

    if not isinstance(destination, str) or not destination.strip():
        return {"error": "Destination is required."}, 400

    try:
        route = get_road_route(
            origin.strip(),
            destination.strip()
        )

        return {
            "message": "Route analyzed successfully.",
            "status": "route_found",
            **route
        }, 200

    except ValueError as error:
        return {
            "error": str(error)
        }, 404

    except requests.exceptions.RequestException:
        return {
            "error": "Routing service is temporarily unavailable. Please try again."
        }, 502
