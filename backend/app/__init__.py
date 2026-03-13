from flask import Flask, jsonify
from .extensions import db, login_manager
from .config import Config
from flask_cors import CORS
import logging

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS using env variable
    CORS(
        app,
        supports_credentials=True,
        origins=[app.config["FRONTEND_URL"]]
    )

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)

    # Configure Flask-Login
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    # For API responses, return JSON instead of redirecting
    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({
            "success": False,
            "message": "Authentication required"
        }), 401

    # User loader callback
    @login_manager.user_loader
    def load_user(user_id):
        from .models import User
        return db.session.get(User, int(user_id))

    # Register Blueprints
    from .auth.routes import auth_bp
    from .notes.routes import notes_bp
    from .core.routes import health_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(health_bp, url_prefix="/health")

    logging.basicConfig(level=logging.INFO)

    with app.app_context():
        from .models import User, Note
        db.create_all()

    return app