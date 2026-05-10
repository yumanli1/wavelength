function getDefaultApiBase() {
  const { protocol, hostname } = window.location;
  const baseProtocol = protocol === "https:" ? "https:" : "http:";
  return `${baseProtocol}//${hostname}:5000`;
}

// macOS can route `localhost:5000` to AirPlay/AirTunes instead of your dev server.
// To keep cookies working (same hostname) and avoid that conflict, prefer 127.0.0.1
// during local dev unless the user explicitly set `REACT_APP_API_BASE`.
if (!process.env.REACT_APP_API_BASE && window.location.hostname === "localhost") {
  const url = new URL(window.location.href);
  url.hostname = "127.0.0.1";
  window.location.replace(url.toString());
}

const API_BASE = process.env.REACT_APP_API_BASE || getDefaultApiBase();

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    return {
      error:
        `Network error: could not reach API at ${API_BASE}. ` +
        "Make sure the backend is running on port 5000 and that you use the same hostname for frontend and backend (both localhost or both 127.0.0.1)."
    };
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : { _raw: await response.text().catch(() => "") };

  if (response.status === 401) {
    return { error: "Not logged in. Please log in again." };
  }

  if (!response.ok && data.error === "Room not found") {
    return {
      error:
        `Room not found on this server (${API_BASE}). ` +
        "Make sure you and your teammate are using the same backend/database instance."
    };
  }

  if (!response.ok && !data.error) {
    const hint = data._raw && typeof data._raw === "string"
      ? ` (HTTP ${response.status})`
      : "";
    data.error =
      `Request failed${hint}. ` +
      "If this happened right after logging in, make sure you are not mixing localhost and 127.0.0.1.";
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
  const cleanRoomCode = String(roomCode || "").trim().toUpperCase();
  if (!cleanRoomCode) {
    return { error: "Enter a room code first." };
  }
  return request(`/api/rooms/${encodeURIComponent(cleanRoomCode)}/join`, { method: "POST" });
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
