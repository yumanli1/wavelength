# Wavelength Game

Wavelength is a full-stack CSE 108 final project built with a Flask backend, SQLite database, React frontend, user authentication, game rooms, and a live multiplayer-style polling flow.

## Final project requirement checklist

- Database: SQLite through Flask-SQLAlchemy
- Server: Flask REST API
- Front end: React
- User sign up and login: Flask-Login sessions
- Hashed/salted passwords: Werkzeug password hashing
- Live room/session behavior: users create or join rooms and the frontend polls room state for updates
- Game logic: teams, psychic role, hidden target, hints, guesses, scoring, rounds, and winner

## Project structure

```text
wavelength/
  backend/
    app.py
    extensions.py
    models.py
    requirements.txt
    routes/
      auth_routes.py
      room_routes.py
      game_routes.py
  frontend/
    package.json
    src/
      App.jsx
      AuthPage.jsx
      Dashboard.jsx
      Lobby.jsx
      GameRoom.jsx
      Board.jsx
      Guess.jsx
      Hint.jsx
      services/api.js
```

## Run locally

Open two terminals.

### Terminal 1: backend

```bash
cd wavelength/backend
python -m venv venv
# Windows PowerShell:
venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The backend runs at `http://127.0.0.1:5000`.

### Terminal 2: frontend

```bash
cd wavelength/frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000`.

## Demo script

1. Sign up as Player 1.
2. Create a room and copy the room code.
3. Open a second browser/incognito window.
4. Sign up as Player 2.
5. Join the same room code.
6. Start the game.
7. The active team's psychic sees the target and submits a clue.
8. A non-psychic player submits a guess.
9. Reveal the round to score points.
10. Start the next round and show the active team switching.

## Deployment notes

For a live demo, the simplest split is:

- Host the Flask backend on Render, Railway, or another Python web host.
- Host the React frontend on Netlify, Vercel, or Render static hosting.
- Set `REACT_APP_API_BASE` on the frontend to the backend URL.
- Set `FRONTEND_ORIGIN` on the backend to the frontend URL.
- Set a real `SECRET_KEY` environment variable before deploying.

## Important API routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/rooms/create`
- `POST /api/rooms/<room_code>/join`
- `GET /api/rooms/<room_code>`
- `POST /api/game/<room_code>/start`
- `POST /api/game/<room_code>/hint`
- `POST /api/game/<room_code>/guess`
- `POST /api/game/<room_code>/reveal`
- `POST /api/game/<room_code>/next-round`
