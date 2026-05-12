# deploy

# Wavelength

A multiplayer web-based version of the party game **Wavelength**, built as a full-stack project using **React**, **Flask**, and **SQLite**.

The game supports:
- User accounts and login system
- Room creation and joining with room codes
- Team-based multiplayer gameplay
- Persistent scoring and round history
- AI/database-generated spectrum topics
- Live room chat in both the lobby and during gameplay
- Profile customization with display names and avatars
- Floating emoji reactions during gameplay
- Light/Dark theme support
- Responsive modern UI

---

# How the Game Works

Wavelength is a social guessing game played between two teams.

Each round:
1. A hidden target is generated somewhere on a spectrum.
2. One player becomes the **Psychic**.
3. The Psychic sees the hidden target and gives a **single clue**.
4. Their teammates discuss and place a guess on the spectrum.
5. The closer the guess is to the hidden target, the more points the team earns.
6. Teams alternate turns until a winner is reached.

Example spectrum:

```text
Traditional  ↔  Experimental

Possible clue:

Grandma’s recipe
Tech Stack
Frontend
React
CSS
LocalStorage for preferences
Responsive UI
Backend
Flask
Flask-Login
Flask-SQLAlchemy
SQLite
Features
Accounts
Signup/login/logout
Password hashing
Persistent sessions
Multiplayer
Room codes
Team balancing
Multiple players per room
Gameplay
Dynamic spectrum topics
Round tracking
Persistent scoring
Reveal + scoring system
Social Features
Room chat available in the lobby and during gameplay
Emoji reactions visible to all players in the room
Profile avatars and display names
UI/UX
Light/Dark themes
Hamburger navigation menu
Winner confetti animation
Copy room code button
Responsive game interface
Running the Project Locally
Clone the repository
git clone <repo-url>
cd wavelength
Backend Setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

Backend runs on:

http://127.0.0.1:5000
Frontend Setup

Open a second terminal:

cd frontend
npm install
npm start

Frontend runs on:

http://127.0.0.1:3000
Important Local Development Note (Mac)

For local testing, use:

http://127.0.0.1:3000

instead of:

http://localhost:3000

This avoids local Flask/CORS/cookie/session issues on macOS.

Main Gameplay Flow
Create account or log in
Create a room
Share the room code with friends/classmates
Players join the lobby
Players can chat in the lobby before the game starts
Start the game
Teams play rounds and discuss guesses
Players can continue chatting and sending reactions during gameplay
Teams score points based on guess accuracy
Winner screen appears with confetti animation
Build Frontend
npm run build
Contributors

Developed as a UC Merced CSE 108 Full-Stack Web Development project.
