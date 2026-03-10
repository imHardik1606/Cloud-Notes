from flask import Flask
from .extensions import db, login_manager
from .config import Config
import logging

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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

    # Set up logging
    logging.basicConfig(level=logging.INFO)

    with app.app_context():
        from .models import User, Note  # Import models to register them with SQLAlchemy
        db.create_all()  # Create tables if they don't exist

    return app