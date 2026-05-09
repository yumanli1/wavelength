const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok && !data.error) {
    data.error = "Something went wrong. Please try again.";
  }

  return data;
}

export async function signup(username, password) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export async function login(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export async function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser() {
  return request("/api/auth/me");
}

export async function createRoom() {
  return request("/api/rooms/create", { method: "POST" });
}

export async function joinRoom(roomCode) {
  return request(`/api/rooms/${roomCode}/join`, { method: "POST" });
}

export async function getRoom(roomCode) {
  return request(`/api/rooms/${roomCode}`);
}

export async function startGame(roomCode) {
  return request(`/api/game/${roomCode}/start`, { method: "POST" });
}

export async function submitHint(roomCode, hint) {
  return request(`/api/game/${roomCode}/hint`, {
    method: "POST",
    body: JSON.stringify({ hint })
  });
}

export async function submitGuess(roomCode, guess) {
  return request(`/api/game/${roomCode}/guess`, {
    method: "POST",
    body: JSON.stringify({ guess })
  });
}

export async function revealRound(roomCode) {
  return request(`/api/game/${roomCode}/reveal`, { method: "POST" });
}

export async function nextRound(roomCode) {
  return request(`/api/game/${roomCode}/next-round`, { method: "POST" });
}
