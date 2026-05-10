def room_to_dict(room, current_user_id=None):
    players = []
    my_player = None

    for player in room.players:
        player_dict = {
            "id": player.user.id,
            "username": player.user.username,
            "team": player.team,
            "is_psychic": player.is_psychic,
        }
        players.append(player_dict)

        if current_user_id is not None and player.user_id == current_user_id:
            my_player = {
                "id": player.user.id,
                "username": player.user.username,
                "team": player.team,
                "is_psychic": player.is_psychic,
            }

    is_psychic = bool(my_player and my_player.get("is_psychic"))
    hide_target = room.phase in {"psychic_clue", "team_guess", "reveal"} and not is_psychic

    return {
        "id": room.id,
        "room_code": room.room_code,
        "phase": room.phase,
        "active_team": room.active_team,
        "team_a_score": room.team_a_score,
        "team_b_score": room.team_b_score,
        "round_number": room.round_number,
        "winner": room.winner,
        "spectrum_left": room.spectrum_left,
        "spectrum_right": room.spectrum_right,
        "hint": room.hint,
        "guess": room.guess,
        "target": None if hide_target else room.target,
        "target_hidden": bool(hide_target and room.target is not None),
        "players": players,
        "my_player": my_player,
    }
