from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import GameRoom, RoomPlayer, ChatMessage


chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


def _is_user_in_room(room_id, user_id):
    return RoomPlayer.query.filter_by(room_id=room_id, user_id=user_id).first() is not None


def _message_to_dict(chat_message):
    return {
        "id": chat_message.id,
        "room_id": chat_message.room_id,
        "user_id": chat_message.user_id,
        "username": chat_message.user.username,
        "message": chat_message.message,
        "created_at": f"{chat_message.created_at.isoformat()}Z",
    }


@chat_bp.route("/<room_code>", methods=["GET"])
@login_required
def get_messages(room_code):
    normalized_code = room_code.strip().upper()
    room = GameRoom.query.filter_by(room_code=normalized_code).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    if not _is_user_in_room(room.id, current_user.id):
        return jsonify({"error": "You are not a member of this room"}), 403

    limit = 50
    messages = (
        ChatMessage.query.filter_by(room_id=room.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    messages.reverse()

    return jsonify({"messages": [_message_to_dict(m) for m in messages]})


@chat_bp.route("/<room_code>", methods=["POST"])
@login_required
def send_message(room_code):
    normalized_code = room_code.strip().upper()
    room = GameRoom.query.filter_by(room_code=normalized_code).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    if not _is_user_in_room(room.id, current_user.id):
        return jsonify({"error": "You are not a member of this room"}), 403

    data = request.get_json(silent=True) or {}
    raw_message = data.get("message", "")
    trimmed = str(raw_message).strip()

    if not trimmed:
        return jsonify({"error": "Message cannot be blank"}), 400

    if len(trimmed) > 250:
        return jsonify({"error": "Message must be 250 characters or fewer"}), 400

    chat_message = ChatMessage(
        room_id=room.id,
        user_id=current_user.id,
        message=trimmed,
    )

    db.session.add(chat_message)
    db.session.commit()

    # Return the saved message for immediate display.
    return jsonify({"message": _message_to_dict(chat_message)}), 201

