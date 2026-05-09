from flask import Blueprint

game_bp = Blueprint("games", __name__, url_prefix="/api/game")