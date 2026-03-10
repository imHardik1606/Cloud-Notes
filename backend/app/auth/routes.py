from flask import Blueprint, request, jsonify
from flask_login import login_required, login_user, logout_user
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db
from app.models import User
from app.schemas import SignupSchema, LoginSchema

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

signup_schema = SignupSchema()
login_schema = LoginSchema()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = signup_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "errors": err.messages
        }), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"success": False, "message": "Email already exists!"}), 400
    
    username = data['username']
    email = data['email']
    password = data['password']

    hashed_password = generate_password_hash(password)

    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": True, "message": "User created successfully!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "errors": err.messages
        }), 400    
    
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"success": True, "message": "Logged in successfully!"}), 200
    else:
        return jsonify({"success": False, "message": "Invalid email or password!"}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out successfully!"}), 200
