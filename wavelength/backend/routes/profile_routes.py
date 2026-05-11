from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import User, UserProfile, GameRoom, RoomPlayer


profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

PRESET_AVATARS = {"🐱", "🐶", "🚀", "🌙", "🎮", "🧠", "🔥"}
DEFAULT_AVATAR = "🎮"


def _effective_profile(user, profile):
    display_name = (profile.display_name.strip() if profile and profile.display_name else "") or user.username
    avatar = (profile.avatar.strip() if profile and profile.avatar else "") or DEFAULT_AVATAR
    return {
        "user_id": user.id,
        "username": user.username,
        "display_name": display_name,
        "avatar": avatar,
    }


@profile_bp.route("/me", methods=["GET"])
@login_required
def get_my_profile():
    user = User.query.get(int(current_user.id))
    profile = UserProfile.query.get(int(current_user.id))
    return jsonify({"profile": _effective_profile(user, profile)})


@profile_bp.route("/me", methods=["POST"])
@login_required
def update_my_profile():
    data = request.get_json(silent=True) or {}

    display_name = str(data.get("display_name", "")).strip()
    avatar = str(data.get("avatar", "")).strip()

    if display_name == "":
        display_name = None
    elif len(display_name) > 80:
        return jsonify({"error": "Display name must be 80 characters or fewer"}), 400

    if avatar == "":
        avatar = None
    elif avatar not in PRESET_AVATARS:
        return jsonify({"error": "Invalid avatar selection"}), 400

    profile = UserProfile.query.get(int(current_user.id))
    if not profile:
        profile = UserProfile(user_id=int(current_user.id))
        db.session.add(profile)

    profile.display_name = display_name
    profile.avatar = avatar
    db.session.commit()

    user = User.query.get(int(current_user.id))
    return jsonify({"profile": _effective_profile(user, profile)})


@profile_bp.route("/room/<room_code>", methods=["GET"])
@login_required
def get_room_profiles(room_code):
    normalized_code = room_code.strip().upper()
    room = GameRoom.query.filter_by(room_code=normalized_code).first()
    if not room:
        return jsonify({"error": "Room not found"}), 404

    is_member = RoomPlayer.query.filter_by(room_id=room.id, user_id=current_user.id).first() is not None
    if not is_member:
        return jsonify({"error": "You are not a member of this room"}), 403

    players = RoomPlayer.query.filter_by(room_id=room.id).all()
    user_ids = [p.user_id for p in players]

    users = User.query.filter(User.id.in_(user_ids)).all()
    profiles = UserProfile.query.filter(UserProfile.user_id.in_(user_ids)).all()
    profile_map = {p.user_id: p for p in profiles}

    return jsonify({
        "profiles": {
            str(u.id): _effective_profile(u, profile_map.get(u.id))
            for u in users
        }
    })

