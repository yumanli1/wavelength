from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import GameRoom, RoomPlayer, SpectrumTopic
from serializers import room_to_dict
import random
import os
import json
import urllib.request
import urllib.error

game_bp = Blueprint("games", __name__, url_prefix="/api/game")


PRESET_TOPICS = [
    ("Cold", "Hot"),
    ("Cheap", "Expensive"),
    ("Fantasy", "Sci-Fi"),
    ("Safe", "Dangerous"),
    ("Normal", "Weird"),
    ("Casual", "Competitive"),
    ("Introvert", "Extrovert"),
    ("Calm", "Chaotic"),
    ("Healthy", "Unhealthy"),
    ("Simple", "Complicated"),
    ("Underrated", "Overrated"),
    ("Classic", "Modern"),
    ("Cute", "Scary"),
    ("Sweet", "Savory"),
    ("Clean", "Messy"),
    ("Optimistic", "Pessimistic"),
    ("Easy", "Hard"),
    ("Relaxing", "Stressful"),
    ("Fast", "Slow"),
    ("Bright", "Dark"),
    ("Polite", "Rude"),
    ("Realistic", "Unrealistic"),
    ("Stylish", "Unstylish"),
    ("Quiet", "Loud"),
    ("Common", "Rare"),
    ("Boring", "Exciting"),
    ("Logical", "Emotional"),
    ("Traditional", "Experimental"),
    ("Friendly", "Intimidating"),
    ("Basic", "Fancy"),
]


def _seed_spectrum_topics_if_empty():
    if SpectrumTopic.query.count() > 0:
        return

    for left, right in PRESET_TOPICS:
        db.session.add(SpectrumTopic(left=left, right=right, source="preset"))
    db.session.commit()


def _try_generate_topic_with_openai():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None

    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    timeout_seconds = float(os.environ.get("OPENAI_TIMEOUT_SECONDS", "2.5"))

    prompt = (
        "Generate one fun, family-friendly Wavelength-style spectrum topic as JSON.\n"
        'Return ONLY JSON like: {"left":"Cold","right":"Hot"}.\n'
        "Constraints:\n"
        "- left and right are short (1-3 words each)\n"
        "- avoid slurs, politics, or explicit content\n"
        "- avoid exact duplicates of common examples (Cold/Hot, Cheap/Expensive, Fantasy/Sci-Fi, Safe/Dangerous, Normal/Weird)\n"
    )

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You generate spectrum topic pairs for a party game."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.8,
        "max_tokens": 60,
        "response_format": {"type": "json_object"},
    }

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
        content = (
            resp_data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        parsed = json.loads(content) if isinstance(content, str) else {}
        left = str(parsed.get("left", "")).strip()
        right = str(parsed.get("right", "")).strip()
        if left and right and left.lower() != right.lower():
            return left, right
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, json.JSONDecodeError):
        return None

    return None


def _assign_round_spectrum(room):
    _seed_spectrum_topics_if_empty()

    generated = _try_generate_topic_with_openai()
    if generated:
        left, right = generated
        if not SpectrumTopic.query.filter_by(left=left, right=right).first():
            db.session.add(SpectrumTopic(left=left, right=right, source="ai"))
        room.spectrum_left = left
        room.spectrum_right = right
        return

    topics = SpectrumTopic.query.all()
    if not topics:
        # Shouldn't happen because of seeding, but keep a safe fallback.
        left, right = random.choice(PRESET_TOPICS)
        room.spectrum_left = left
        room.spectrum_right = right
        return

    current_pair = (room.spectrum_left or "", room.spectrum_right or "")
    candidates = [t for t in topics if (t.left, t.right) != current_pair]
    chosen = random.choice(candidates or topics)
    room.spectrum_left = chosen.left
    room.spectrum_right = chosen.right


def calculate_score(target, guess):
    difference = abs(target - guess)

    if difference <= 5:
        return 4
    elif difference <= 12:
        return 3
    elif difference <= 22:
        return 2
    return 0


@game_bp.route("/<room_code>/start", methods=["POST"])
@login_required
def start_game(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    players = RoomPlayer.query.filter_by(room_id=room.id).all()

    if len(players) < 2:
        return jsonify({"error": "At least 2 players are required to start"}), 400

    for player in players:
        player.is_psychic = False

    active_team_players = [player for player in players if player.team == room.active_team]

    psychic = random.choice(active_team_players)
    psychic.is_psychic = True

    room.phase = "psychic_clue"
    _assign_round_spectrum(room)
    room.target = random.randint(0, 180)
    room.hint = ""
    room.guess = None
    room.opposing_guess = None

    db.session.commit()

    return jsonify({
        "message": "Game started",
        "room": room_to_dict(room, current_user_id=current_user.id),
    })


@game_bp.route("/<room_code>/hint", methods=["POST"])
@login_required
def submit_hint(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    data = request.get_json()
    hint = data.get("hint")

    if not hint:
        return jsonify({"error": "Hint is required"}), 400

    room_player = RoomPlayer.query.filter_by(
        room_id=room.id,
        user_id=current_user.id
    ).first()

    if not room_player or not room_player.is_psychic:
        return jsonify({"error": "Only the psychic can submit a hint"}), 403

    room.hint = hint
    room.phase = "team_guess"

    db.session.commit()

    return jsonify({
        "message": "Hint submitted",
        "room": room_to_dict(room, current_user_id=current_user.id),
    })


@game_bp.route("/<room_code>/guess", methods=["POST"])
@login_required
def submit_guess(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    data = request.get_json()
    guess = data.get("guess")

    if guess is None:
        return jsonify({"error": "Guess is required"}), 400

    guess = int(guess)

    if guess < 0 or guess > 180:
        return jsonify({"error": "Guess must be between 0 and 180"}), 400

    room.guess = guess
    room.phase = "reveal"

    db.session.commit()

    return jsonify({
        "message": "Guess submitted",
        "room": room_to_dict(room, current_user_id=current_user.id),
    })


@game_bp.route("/<room_code>/reveal", methods=["POST"])
@login_required
def reveal(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    if room.target is None or room.guess is None:
        return jsonify({"error": "Target and guess are required before reveal"}), 400

    points = calculate_score(room.target, room.guess)

    if room.active_team == "A":
        room.team_a_score += points
    else:
        room.team_b_score += points

    if room.team_a_score >= 10:
        room.winner = "A"
        room.phase = "game_over"
    elif room.team_b_score >= 10:
        room.winner = "B"
        room.phase = "game_over"
    else:
        room.phase = "scored"

    db.session.commit()

    return jsonify({
        "message": "Round revealed",
        "points": points,
        "room": room_to_dict(room, current_user_id=current_user.id),
    })


@game_bp.route("/<room_code>/next-round", methods=["POST"])
@login_required
def next_round(room_code):
    room = GameRoom.query.filter_by(room_code=room_code.upper()).first()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    if room.winner:
        return jsonify({"error": "Game is already over"}), 400

    players = RoomPlayer.query.filter_by(room_id=room.id).all()

    for player in players:
        player.is_psychic = False

    room.active_team = "B" if room.active_team == "A" else "A"
    room.round_number += 1
    room.phase = "psychic_clue"
    _assign_round_spectrum(room)
    room.target = random.randint(0, 180)
    room.hint = ""
    room.guess = None
    room.opposing_guess = None

    active_team_players = [player for player in players if player.team == room.active_team]
    psychic = random.choice(active_team_players)
    psychic.is_psychic = True

    db.session.commit()

    return jsonify({
        "message": "Next round started",
        "room": room_to_dict(room, current_user_id=current_user.id),
    })
