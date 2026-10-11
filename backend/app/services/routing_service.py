
import requests

OSRM_BASE_URL = "https://router.project-osrm.org"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "User-Agent": "RouteGuard/0.1 (student logistics project)"
}


def geocode_place(place: str) -> dict:
    response = requests.get(
        NOMINATIM_URL,
        params={
            "q": place,
            "format": "jsonv2",
            "limit": 1,
            "countrycodes": "in",
        },
        headers=HEADERS,
        timeout=15,
    )
    response.raise_for_status()
    results = response.json()

    if not results:
        raise ValueError(f"Place not found: {place}")

    return {
        "name": results[0]["display_name"],
        "latitude": float(results[0]["lat"]),
        "longitude": float(results[0]["lon"]),
    }


def get_road_route(origin: str, destination: str) -> dict:
    start = geocode_place(origin)
    end = geocode_place(destination)

    coordinates = (
        f'{start["longitude"]},{start["latitude"]};'
        f'{end["longitude"]},{end["latitude"]}'
    )

    response = requests.get(
        f"{OSRM_BASE_URL}/route/v1/driving/{coordinates}",
        params={
            "overview": "full",
            "geometries": "geojson",
            "alternatives": "false",
            "steps": "false",
        },
        timeout=20,
    )
    response.raise_for_status()
    result = response.json()

    if result.get("code") != "Ok" or not result.get("routes"):
        raise ValueError("No road route could be found.")

    route = result["routes"][0]

    return {
        "origin": start,
        "destination": end,
        "distance_km": round(route["distance"] / 1000, 2),
        "duration_minutes": round(route["duration"] / 60),
        "geometry": route["geometry"],
        "provider": "OSRM",
    }
