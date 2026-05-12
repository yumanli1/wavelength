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
