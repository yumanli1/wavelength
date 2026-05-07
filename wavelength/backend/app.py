from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from your React frontend

games = {}

@app.route("/api/new_game", methods=["POST"])
def new_game():
    game_id = str(len(games) + 1)
    games[game_id] = {
        "players": [],
        "target": None,
        "hint": "",
        "guess": None
    }
    return jsonify({"game_id": game_id})

@app.route("/api/game/<game_id>", methods=["GET"])
def get_game(game_id):
    return jsonify(games.get(game_id, {}))

@app.route("/api/game/<game_id>", methods=["POST"])
def update_game(game_id):
    data = request.json
    games[game_id].update(data)
    return jsonify(games[game_id])

if __name__ == "__main__":
    app.run(debug=True)