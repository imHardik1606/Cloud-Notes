from marshmallow import Schema, fields, validate

class SignupSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

class NoteSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    content = fields.Str(required=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))