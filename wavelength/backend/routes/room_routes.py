from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import GameRoom, RoomPlayer
from serializers import room_to_dict
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

    room_player = RoomPlayer(
        room_id=room.id,
        user_id=current_user.id,
        team="A",
        is_psychic=False
    )

    db.session.add(room_player)
    db.session.commit()

    return jsonify({
        "message": "Room created successfully",
        "room": room_to_dict(room, current_user_id=current_user.id)
    }), 201


@room_bp.route("/<room_code>/join", methods=["POST"])
@login_required
def join_room(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    existing_player = RoomPlayer.query.filter_by(
        room_id=room.id,
        user_id=current_user.id
    ).first()

    if existing_player:
        return jsonify({
            "message": "You are already in this room",
            "room": room_to_dict(room, current_user_id=current_user.id)
        })

    team_a_count = RoomPlayer.query.filter_by(room_id=room.id, team="A").count()
    team_b_count = RoomPlayer.query.filter_by(room_id=room.id, team="B").count()

    assigned_team = "A" if team_a_count <= team_b_count else "B"

    room_player = RoomPlayer(
        room_id=room.id,
        user_id=current_user.id,
        team=assigned_team,
        is_psychic=False
    )

    db.session.add(room_player)
    db.session.commit()

    return jsonify({
        "message": "Joined room successfully",
        "room": room_to_dict(room, current_user_id=current_user.id)
    })


@room_bp.route("/<room_code>", methods=["GET"])
@login_required
def get_room(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    return jsonify({
        "room": room_to_dict(room, current_user_id=current_user.id)
    })
