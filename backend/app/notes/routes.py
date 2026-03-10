from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from marshmallow import ValidationError

from app.schemas import NoteSchema
from app.models import Note
from app.extensions import db

notes_bp = Blueprint('notes', __name__, url_prefix='/notes')

notes_schema = NoteSchema()

@notes_bp.route('/create', methods=["POST"])
@login_required
def create_note():
    try:
        data = notes_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "errors": err.messages
        }), 400
    
    new_note = Note(user_id = current_user.id, title = data['title'], content = data['content'], created_at = datetime.now())

    db.session.add(new_note)
    db.session.commit()
    return jsonify({"success": True, "message": "Note created successfully!"}), 201

@notes_bp.route('/', methods=["GET"])
@login_required
def all_notes():
    notes = Note.query.filter_by(user_id = current_user.id).order_by(Note.created_at.desc()).all()
    return jsonify({
        "notes" : [
            {
                "id" : note.id,
                "title" : note.title,
                "content" : note.content,
                "created_at" : note.created_at.strftime("%Y-%m-%d %H:%M:%SZ"),
                "last_edited" : note.last_edited.strftime("%Y-%m-%d %H:%M:%SZ")
            }
            for note in notes
        ]
    })

@notes_bp.route('/<string:note_id>', methods=["GET"])
@login_required
def get_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()

    if not note:
        return jsonify({"success": False, "message": "Note not found!"}), 404
    
    return jsonify({
        "id" : note.id,
        "title" : note.title,
        "content" : note.content,
        "created_at" : note.created_at.strftime("%Y-%m-%d %H:%M:%SZ"),
        "last_edited" : note.last_edited.strftime("%Y-%m-%d %H:%M:%SZ")
    })

@notes_bp.route('/update/<string:note_id>', methods=["PUT"])
@login_required
def update_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()

    if not note:
        return jsonify({
            "success": False,
            "message": "Note not found"
        }), 404

    try:
        data = notes_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "message": err.messages
        }), 404

    note.title = data["title"]
    note.content = data["content"]

    db.session.commit()

    return jsonify({
            "success": True,
            "message": "Note updated successfully"
        }), 200

@notes_bp.route("/notes/<string:note_id>", methods=["DELETE"])
@login_required
def delete_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()

    if not note or note.user_id != current_user.id:
        return jsonify({
            "success": False,
            "message": "Note not found"
        }), 404

    db.session.delete(note)
    db.session.commit()
    return jsonify({
            "success": True,
            "message": "Note deleted successfully"
        }), 200