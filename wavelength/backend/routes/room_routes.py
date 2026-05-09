from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import GameRoom
import random
import string

room_bp = Blueprint("rooms", __name__, url_prefix="/api/rooms")


def generate_room_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


@room_bp.route("/create", methods=["POST"])
@login_required
def create_room():
    room_code = generate_room_code()

    while GameRoom.query.filter_by(room_code=room_code).first():
        room_code = generate_room_code()

    room = GameRoom(room_code=room_code, phase="lobby")

    db.session.add(room)
    db.session.commit()

    return jsonify({
        "message": "Room created successfully",
        "room": {
            "id": room.id,
            "room_code": room.room_code,
            "phase": room.phase,
            "created_by": current_user.username
        }
    }), 201


@room_bp.route("/<room_code>", methods=["GET"])
@login_required
def get_room(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    return jsonify({
        "room": {
            "id": room.id,
            "room_code": room.room_code,
            "phase": room.phase,
            "active_team": room.active_team,
            "team_a_score": room.team_a_score,
            "team_b_score": room.team_b_score,
            "round_number": room.round_number,
            "winner": room.winner
        }
    })