from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from extensions import db
from models import GameRoom, RoomPlayer, Reaction, UserProfile


reaction_bp = Blueprint("reactions", __name__, url_prefix="/api/reactions")

PRESET_REACTIONS = {"👍", "😂", "😮", "😡", "🔥"}
DEFAULT_AVATAR = "🎮"


def _is_user_in_room(room_id, user_id):
    return RoomPlayer.query.filter_by(room_id=room_id, user_id=user_id).first() is not None


def _user_to_dict(user):
    profile = UserProfile.query.get(int(user.id))
    display_name = (profile.display_name.strip() if profile and profile.display_name else "") or user.username
    avatar = (profile.avatar.strip() if profile and profile.avatar else "") or DEFAULT_AVATAR
    return {
        "id": user.id,
        "username": user.username,
        "display_name": display_name,
        "avatar": avatar,
    }


def _reaction_to_dict(reaction):
    return {
        "id": reaction.id,
        "room_id": reaction.room_id,
        "user_id": reaction.user_id,
        "emoji": reaction.emoji,
        "created_at": f"{reaction.created_at.isoformat()}Z",
        "user": _user_to_dict(reaction.user),
    }


def _parse_since(value):
    if not value:
        return None, None

    raw = str(value).strip()
    if raw == "":
        return None, None

    if raw.isdigit():
        return int(raw), None

    # Epoch seconds (supports floats)
    try:
        seconds = float(raw)
        if seconds > 0:
            return None, datetime.utcfromtimestamp(seconds)
    except Exception:
        pass

    # ISO timestamp (optionally with trailing Z)
    try:
        cleaned = raw[:-1] if raw.endswith("Z") else raw
        return None, datetime.fromisoformat(cleaned)
    except Exception:
        return None, None


@reaction_bp.route("/<room_code>", methods=["POST"])
@login_required
def send_reaction(room_code):
    normalized_code = room_code.strip().upper()
    room = GameRoom.query.filter_by(room_code=normalized_code).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    if not _is_user_in_room(room.id, current_user.id):
        return jsonify({"error": "You are not a member of this room"}), 403

    data = request.get_json(silent=True) or {}
    emoji = str(data.get("emoji", "")).strip()

    if emoji not in PRESET_REACTIONS:
        return jsonify({"error": "Invalid reaction emoji"}), 400

    reaction = Reaction(
        room_id=room.id,
        user_id=current_user.id,
        emoji=emoji,
    )

    db.session.add(reaction)
    db.session.commit()

    return jsonify({"reaction": _reaction_to_dict(reaction)}), 201


@reaction_bp.route("/<room_code>", methods=["GET"])
@login_required
def get_reactions(room_code):
    normalized_code = room_code.strip().upper()
    room = GameRoom.query.filter_by(room_code=normalized_code).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    if not _is_user_in_room(room.id, current_user.id):
        return jsonify({"error": "You are not a member of this room"}), 403

    since_param = request.args.get("since")
    since_id, since_dt = _parse_since(since_param)

    window_seconds = 120
    cutoff = datetime.utcnow() - timedelta(seconds=window_seconds)

    query = Reaction.query.filter(Reaction.room_id == room.id, Reaction.created_at >= cutoff)
    if since_id is not None:
        query = query.filter(Reaction.id > since_id)
    elif since_dt is not None:
        query = query.filter(Reaction.created_at > since_dt)

    reactions = query.order_by(Reaction.id.asc()).all()
    latest_id = reactions[-1].id if reactions else since_id or 0

    return jsonify({
        "reactions": [_reaction_to_dict(r) for r in reactions],
        "latest_id": latest_id,
    })

