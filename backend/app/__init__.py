
from flask import Flask
from flask_cors import CORS

from app.routes.route_routes import route_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.get("/api/health")
    def health_check():
        return {
            "status": "ok",
            "service": "RouteGuard API"
        }, 200

    app.register_blueprint(route_bp)

    return app
