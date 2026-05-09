import { useState } from "react";
import { createRoom, joinRoom, logout } from "./services/api";

export default function Dashboard({ user, setUser, setRoom, setView }) {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreateRoom() {
    setMessage("");
    setBusy(true);
    const data = await createRoom();
    setBusy(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setRoom(data.room);
    setView("lobby");
  }

  async function handleJoinRoom(event) {
    event.preventDefault();
    setMessage("");

    if (!roomCode.trim()) {
      setMessage("Enter a room code first.");
      return;
    }

    setBusy(true);
    const data = await joinRoom(roomCode.trim().toUpperCase());
    setBusy(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setRoom(data.room);
    setView(data.room.phase === "lobby" ? "lobby" : "game");
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setRoom(null);
    setView("auth");
  }

  return (
    <main className="page">
      <section className="card dashboard-card">
        <div className="top-row">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{user.username}</h1>
          </div>
          <button className="secondary-button" onClick={handleLogout}>Log out</button>
        </div>

        <div className="action-grid">
          <div className="panel">
            <h2>Create a room</h2>
            <p className="muted">Start a new Wavelength lobby and invite classmates with the generated room code.</p>
            <button className="primary-button" onClick={handleCreateRoom} disabled={busy}>
              {busy ? "Working..." : "Create room"}
            </button>
          </div>

          <form className="panel form-stack" onSubmit={handleJoinRoom}>
            <h2>Join a room</h2>
            <label>
              Room code
              <input
                type="text"
                placeholder="ABC123"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              />
            </label>
            <button className="primary-button" disabled={busy} type="submit">
              Join room
            </button>
          </form>
        </div>

        {message && <p className="error-text">{message}</p>}
      </section>
    </main>
  );
}
