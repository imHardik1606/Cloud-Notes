import pytest

import sys
from pathlib import Path
from werkzeug.security import generate_password_hash

# Add parent directory to path so 'app' can be imported
sys.path.insert(0, str(Path(__file__).parent.parent))

from app import create_app
from app.models import User, Note
from app.extensions import db

@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client, app):
    with app.app_context():

        #create test user
        user = User(
            username="testuser",
            email="iamtest@example.com",
            password=generate_password_hash("pass@1234")
        )

        db.session.add(user)
        db.session.commit()

        #login test user
        response = client.post(
            "/auth/login",
            json={
                "email": "iamtest@example.com",
                "password":"pass@1234"
            }
        )

        #flask login uses session cookie
        return {
            "Content-Type":"application/json"
        }

@pytest.fixture(autouse=True)
def cleanup_db(app):
    """Clears database before each test"""
    with app.app_context():
        db.session.query(Note).delete()
        db.session.query(User).delete()
        db.session.commit()

@pytest.fixture
def created_note(app, auth_headers):
    """Create a test note for the authenticated user"""
    with app.app_context():
        user = User.query.filter_by(email="iamtest@example.com").first()
        note = Note(
            title="Test Note",
            content="This is a test note",
            user_id=user.id
        )
        db.session.add(note)
        db.session.commit()
        note_id = str(note.id)
        return note_id

@pytest.fixture
def other_user_note(app):
    """Create a note for a different user to test authorization"""
    with app.app_context():
        other_user = User(
            username="otheruser",
            email="otheruser@example.com",
            password=generate_password_hash("pass@1234")
        )
        db.session.add(other_user)
        db.session.commit()
        
        note = Note(
            title="Other User's Note",
            content="This note belongs to another user",
            user_id=other_user.id
        )
        db.session.add(note)
        db.session.commit()
        return note