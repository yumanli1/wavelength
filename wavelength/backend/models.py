from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from extensions import db


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class GameRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_code = db.Column(db.String(10), unique=True, nullable=False)
    phase = db.Column(db.String(30), default="lobby")

    active_team = db.Column(db.String(1), default="A")
    team_a_score = db.Column(db.Integer, default=0)
    team_b_score = db.Column(db.Integer, default=0)

    spectrum_left = db.Column(db.String(100), default="Cold")
    spectrum_right = db.Column(db.String(100), default="Hot")

    target = db.Column(db.Integer, nullable=True)
    hint = db.Column(db.String(255), default="")
    guess = db.Column(db.Integer, nullable=True)
    opposing_guess = db.Column(db.String(10), nullable=True)

    round_number = db.Column(db.Integer, default=1)
    winner = db.Column(db.String(1), nullable=True)

class RoomPlayer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
        
    room_id = db.Column(db.Integer, db.ForeignKey("game_room.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
        
    team = db.Column(db.String(1), nullable=False)
    is_psychic = db.Column(db.Boolean, default=False)
        
    room = db.relationship("GameRoom", backref="players")
    user = db.relationship("User", backref="rooms")


class SpectrumTopic(db.Model):
    __table_args__ = (db.UniqueConstraint("left", "right", name="uq_spectrum_left_right"),)

    id = db.Column(db.Integer, primary_key=True)
    left = db.Column(db.String(80), nullable=False)
    right = db.Column(db.String(80), nullable=False)
    source = db.Column(db.String(20), default="preset")
