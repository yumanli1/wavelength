const API_BASE = "http://127.0.0.1:5000";

export async function signup(username, password) {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  return response.json();
}

export async function login(username, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include"
  });

  return response.json();
}

export async function createRoom() {
  const response = await fetch(`${API_BASE}/api/rooms/create`, {
    method: "POST",
    credentials: "include"
  });

  return response.json();
}

export async function joinRoom(roomCode) {
  const response = await fetch(`${API_BASE}/api/rooms/${roomCode}/join`, {
    method: "POST",
    credentials: "include"
  });

  return response.json();
}

export async function getRoom(roomCode) {
  const response = await fetch(`${API_BASE}/api/rooms/${roomCode}`, {
    credentials: "include"
  });

  return response.json();
}

export async function startGame(roomCode) {
  const response = await fetch(`${API_BASE}/api/game/${roomCode}/start`, {
    method: "POST",
    credentials: "include"
  });

  return response.json();
}

export async function submitHint(roomCode, hint) {
  const response = await fetch(`${API_BASE}/api/game/${roomCode}/hint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ hint })
  });

  return response.json();
}

export async function submitGuess(roomCode, guess) {
  const response = await fetch(`${API_BASE}/api/game/${roomCode}/guess`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ guess })
  });

  return response.json();
}

export async function revealRound(roomCode) {
  const response = await fetch(`${API_BASE}/api/game/${roomCode}/reveal`, {
    method: "POST",
    credentials: "include"
  });

  return response.json();
}