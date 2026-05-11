import { useEffect, useState } from "react";
import { createRoom, joinRoom, logout, getMyProfile, updateMyProfile } from "./services/api";

const PRESET_AVATARS = ["🐱", "🐶", "🚀", "🌙", "🎮", "🧠", "🔥"];
const DEFAULT_AVATAR = "🎮";

export default function Dashboard({ user, setUser, setRoom, setView }) {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState(DEFAULT_AVATAR);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!user?.id) return;
      const data = await getMyProfile();

      if (!alive) return;

      if (data.error) {
        setProfileError(data.error);
        return;
      }

      const profile = data.profile || {};
      setProfileError("");
      setProfileMessage("");
      setProfileDisplayName(profile.display_name || "");
      setProfileAvatar(profile.avatar || DEFAULT_AVATAR);
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  async function handleCreateRoom() {
    setMessage("");
    setBusy(true);
    const data = await createRoom();
    setBusy(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    if (!data.room) {
      setMessage("Unexpected server response while creating a room. Please try again.");
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

    if (!data.room) {
      setMessage("Unexpected server response while joining the room. Please try again.");
      return;
    }

    setRoom(data.room);
    setView(data.room.phase === "lobby" ? "lobby" : "game");
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    const trimmedDisplayName = profileDisplayName.trim();
    if (trimmedDisplayName.length > 80) {
      setProfileError("Display name must be 80 characters or fewer.");
      return;
    }

    setProfileBusy(true);
    const data = await updateMyProfile(trimmedDisplayName, profileAvatar);
    setProfileBusy(false);

    if (data.error) {
      setProfileError(data.error);
      return;
    }

    const profile = data.profile || {};
    setProfileDisplayName(profile.display_name || "");
    setProfileAvatar(profile.avatar || DEFAULT_AVATAR);
    setProfileMessage("Profile updated.");
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setView("auth");
      setRoom(null);
      setUser(null);
    }
  }

  return (
    <main className="page">
      <section className="card dashboard-card">
        <div className="top-row">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{user?.username || ""}</h1>
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

        <section className="panel profile-panel" aria-label="Profile settings">
          <div className="profile-header">
            <h2>Profile</h2>
            <p className="muted">Optional. Set a display name and avatar for lobbies and games.</p>
          </div>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <label>
              Display name
              <input
                type="text"
                value={profileDisplayName}
                maxLength={80}
                placeholder="Leave blank to use your username"
                onChange={(event) => setProfileDisplayName(event.target.value)}
                disabled={profileBusy}
              />
            </label>

            <div className="avatar-picker" role="radiogroup" aria-label="Choose an avatar">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={emoji === profileAvatar ? "avatar-option selected" : "avatar-option"}
                  aria-pressed={emoji === profileAvatar}
                  onClick={() => setProfileAvatar(emoji)}
                  disabled={profileBusy}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>

            <button className="primary-button" type="submit" disabled={profileBusy}>
              {profileBusy ? "Saving..." : "Save profile"}
            </button>
          </form>

          {profileError && <p className="error-text">{profileError}</p>}
          {profileMessage && <p className="success-text">{profileMessage}</p>}
        </section>

        {message && <p className="error-text">{message}</p>}
      </section>
    </main>
  );
}
