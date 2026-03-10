from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/")
def health_check():
    return jsonify({
            "success": True,
            "message": "Cloud Notes API is healthy"
        }), 200