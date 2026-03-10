from flask import Flask
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