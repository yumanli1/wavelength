import { useEffect, useState } from "react";
import { getRoom, startGame, getChatMessages, sendChatMessage, getRoomProfiles } from "./services/api";

const DEFAULT_AVATAR = "🎮";

function TeamList({ title, players, profilesById }) {
  return (
    <div className="team-card">
      <h3>{title}</h3>
      {players.length === 0 ? (
        <p className="muted">Waiting for players...</p>
      ) : (
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id} className="player-row">
              <div className="player-identity">
                <span className="avatar-badge" aria-hidden="true">
                  {profilesById?.[player.id]?.avatar || DEFAULT_AVATAR}
                </span>
                <span className="player-name">
                  {profilesById?.[player.id]?.display_name || player.username}
                </span>
                {profilesById?.[player.id]?.display_name &&
                profilesById?.[player.id]?.display_name !== player.username ? (
                  <span className="muted player-handle">@{player.username}</span>
                ) : null}
              </div>
              <span className="muted">Team {player.team}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Lobby({ user, room, setRoom, setView }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatError, setChatError] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [profilesById, setProfilesById] = useState({});
  const [profilesError, setProfilesError] = useState("");

  useEffect(() => {
    if (!room?.room_code) return;

    const timer = setInterval(async () => {
      const data = await getRoom(room.room_code);

      if (data.error) {
        setMessage(data.error);
        return;
      }

      if (data.room) {
        setRoom(data.room);
        if (data.room.phase !== "lobby") {
          setView("game");
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [room?.room_code, setRoom, setView]);

  useEffect(() => {
    if (!room?.room_code) return;

    let timer = null;
    let alive = true;

    async function refreshProfiles() {
      const data = await getRoomProfiles(room.room_code);
      if (!alive) return;

      if (data.error) {
        setProfilesError(data.error);
        return;
      }

      setProfilesError("");
      setProfilesById(data.profiles && typeof data.profiles === "object" ? data.profiles : {});
    }

    refreshProfiles();
    timer = setInterval(refreshProfiles, 6000);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [room?.room_code]);

  useEffect(() => {
    if (!room?.room_code) return;

    let timer = null;

    async function refreshChat() {
      const data = await getChatMessages(room.room_code);
      if (data.error) {
        setChatError(data.error);
        return;
      }
      setChatError("");
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
    }

    refreshChat();
    timer = setInterval(refreshChat, 3500);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [room?.room_code]);

  if (!room) {
    return (
      <main className="page">
        <section className="card">
          <h1>No room selected</h1>
          <button className="primary-button" onClick={() => setView("dashboard")}>Back to dashboard</button>
        </section>
      </main>
    );
  }

  const teamA = room.players.filter((player) => player.team === "A");
  const teamB = room.players.filter((player) => player.team === "B");
  const canStart = teamA.length > 0 && teamB.length > 0;
  const myProfile = profilesById?.[user?.id] || null;
  const myDisplayName = myProfile?.display_name || user?.username || "";
  const myAvatar = myProfile?.avatar || DEFAULT_AVATAR;

  async function handleStartGame() {
    setMessage("");
    setBusy(true);
    const data = await startGame(room.room_code);
    setBusy(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    if (!data.room) {
      setMessage("Unexpected server response while starting the game. Please try again.");
      return;
    }

    setRoom(data.room);
    setView("game");
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function handleSendChat(event) {
    event.preventDefault();
    setChatError("");

    const trimmed = chatText.trim();
    if (!trimmed) {
      setChatError("Message cannot be blank.");
      return;
    }

    if (trimmed.length > 250) {
      setChatError("Message must be 250 characters or fewer.");
      return;
    }

    setChatBusy(true);
    const data = await sendChatMessage(room.room_code, trimmed);
    setChatBusy(false);

    if (data.error) {
      setChatError(data.error);
      return;
    }

    setChatText("");
    const refreshed = await getChatMessages(room.room_code);
    if (!refreshed.error) {
      setChatMessages(Array.isArray(refreshed.messages) ? refreshed.messages : []);
    }
  }

  return (
    <main className="page">
      <section className="card lobby-card">
        <div className="top-row">
          <div>
            <p className="eyebrow">Lobby</p>
            <h1>Room {room.room_code}</h1>
            <p className="muted">Signed in as {myAvatar} {myDisplayName}. Share this room code with another player.</p>
          </div>
          <button className="secondary-button" onClick={() => setView("dashboard")}>Dashboard</button>
        </div>

        <div className="room-code-box">{room.room_code}</div>

        <div className="team-grid">
          <TeamList title="Team A" players={teamA} profilesById={profilesById} />
          <TeamList title="Team B" players={teamB} profilesById={profilesById} />
        </div>

        <section className="panel chat-panel" aria-label="Room chat">
          <div className="chat-header">
            <h2>Room chat</h2>
            <p className="muted">Messages are shared with everyone in this room.</p>
          </div>

          <div className="chat-messages" role="log" aria-live="polite">
            {chatMessages.length === 0 ? (
              <p className="muted">No messages yet. Say hi!</p>
            ) : (
              chatMessages.map((msg) => (
                <div className="chat-message" key={msg.id}>
                  <div className="chat-meta">
                    <strong>{msg.username}</strong>
                    <span className="muted">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="chat-text">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          <form className="chat-input-row" onSubmit={handleSendChat}>
            <input
              type="text"
              value={chatText}
              maxLength={250}
              placeholder={`Message as ${myDisplayName || user?.username || ""}`}
              onChange={(event) => setChatText(event.target.value)}
              disabled={chatBusy}
            />
            <button className="primary-button" type="submit" disabled={chatBusy}>
              Send
            </button>
          </form>

          {chatError && <p className="error-text">{chatError}</p>}
        </section>

        <button className="primary-button" onClick={handleStartGame} disabled={!canStart || busy}>
          {busy ? "Starting..." : "Start game"}
        </button>

        {!canStart && <p className="muted">You need at least one player on each team before starting.</p>}
        {profilesError && <p className="error-text">{profilesError}</p>}
        {message && <p className="error-text">{message}</p>}
      </section>
    </main>
  );
}
