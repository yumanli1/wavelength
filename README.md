# deploy

# Wavelength

A multiplayer web-based version of the party game **Wavelength**, built using **React**, **Flask**, and **SQLite**.

The project includes:
- User authentication system
- Multiplayer rooms with room codes
- Team-based gameplay
- Persistent scoring and round history
- AI/database-generated spectrum topics
- Live room chat in both the lobby and during gameplay
- Profile avatars and display names
- Floating emoji reactions
- Light/Dark themes
- Responsive UI design

---

# How the Game Works

Wavelength is a social guessing game played between two teams.

## Each Round

1. A hidden target is generated somewhere on a spectrum.
2. One player becomes the **Psychic**.
3. The Psychic sees the hidden target and gives a **single clue**.
4. Their teammates discuss and place a guess on the spectrum.
5. The closer the guess is to the hidden target, the more points the team earns.
6. Teams alternate turns until a winner is reached.

---

## Example Spectrum

```text
Traditional  ↔  Experimental
```

### Possible Clue

```text
Grandma's recipe
```

---

# Tech Stack

## Frontend
- React
- CSS
- LocalStorage
- Responsive UI

## Backend
- Flask
- Flask-Login
- Flask-SQLAlchemy
- SQLite

---

# Features

## Accounts
- Signup/Login/Logout
- Password hashing
- Persistent sessions

## Multiplayer
- Room codes
- Team balancing
- Multiple players per room

## Gameplay
- Dynamic spectrum topics
- Round tracking
- Persistent scoring
- Reveal + scoring system

## Social Features
- Room chat in the lobby and during gameplay
- Emoji reactions visible to all players
- Profile avatars and display names

## UI/UX
- Light/Dark themes
- Hamburger navigation menu
- Winner confetti animation
- Copy room code button
- Responsive interface

---

# Running the Project Locally

## 1. Clone the Repository

```bash
git clone <repo-url>
cd wavelength
```

---

# Backend Setup

Open a terminal:

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python app.py
```

Backend runs on:

```text
http://127.0.0.1:5000
```

---

# Frontend Setup

Open a second terminal:

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```text
http://127.0.0.1:3000
```

---

# Important Local Development Note (Mac)

For local testing, use:

```text
http://127.0.0.1:3000
```

instead of:

```text
http://localhost:3000
```

This avoids local Flask/CORS/cookie/session issues on macOS.

---

# Main Gameplay Flow

```text
Create account or log in
        ↓
Create room
        ↓
Share room code
        ↓
Players join lobby
        ↓
Lobby chat + team setup
        ↓
Start game
        ↓
Teams play rounds
        ↓
Players chat and react during gameplay
        ↓
Reveal + scoring
        ↓
Winner screen + confetti
```

---

# Build Frontend

```bash
cd frontend

npm run build
```

---

# Contributors

Developed as a UC Merced CSE 108 Full-Stack Web Development project.

# Freysell Perez Rugama — Main Contributions

- Designed and setup the full Flask backend architecture and database models
- Restructured the project into separate frontend/backend architecture
- Implemented user authentication, protected routes, and multiplayer room logic
- Built the core gameplay flow including rounds, scoring, reveals, and team synchronization
- Added spectrum topic generation for game rounds
- Developed the frontend authentication flow and API integration
- Created multiplayer room chat functionality for both lobby and gameplay
- Added profile customization with avatars and display names
- Implemented floating emoji reactions during gameplay
- Added light/dark theme support with persistent user preferences
- Added gameplay/UI improvements including hamburger menu, rules modal, room code copy button, password visibility toggle, and winner confetti animation
- Fixed logout/session handling and improved frontend/backend synchronization and deployment behavior

# Kris Pichon — Main Contributions

- Completed major final integration work for the playable Wavelength app
- Built out the Dashboard, Lobby, and GameRoom frontend pages for the main user flow
- Connected the React frontend to the Flask backend using API request handling
- Improved room creation, room joining, lobby state, and game state display behavior
- Implemented the core playable Wavelength flow including clue submission, guessing, reveal, scoring, and next-round functionality
- Improved backend room/game route logic for phase handling, player roles, round progression, and score updates
- Added frontend styling for the dashboard, lobby, game board, forms, buttons, and gameplay screens
- Updated API/session handling for local development so login and room actions work correctly across the frontend and backend
- Added backend requirements and setup documentation for running the Flask server
- Updated the README with local setup, demo flow, troubleshooting notes, and contributor information
- Debugged local run issues including npm install problems, React start errors, localhost API behavior, and room/session testing
- Helped prepare the project for final demo readiness by testing the signup, login, create room, join room, start game, clue, guess, reveal, and next-round flow
