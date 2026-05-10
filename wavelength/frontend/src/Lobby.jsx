import { useEffect, useState } from "react";
import { getRoom, startGame } from "./services/api";

function TeamList({ title, players }) {
  return (
    <div className="team-card">
      <h3>{title}</h3>
      {players.length === 0 ? (
        <p className="muted">Waiting for players...</p>
      ) : (
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.username}</span>
              <span className="muted"> · Team {player.team}</span>
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

  return (
    <main className="page">
      <section className="card lobby-card">
        <div className="top-row">
          <div>
            <p className="eyebrow">Lobby</p>
            <h1>Room {room.room_code}</h1>
            <p className="muted">Signed in as {user.username}. Share this room code with another player.</p>
          </div>
          <button className="secondary-button" onClick={() => setView("dashboard")}>Dashboard</button>
        </div>

        <div className="room-code-box">{room.room_code}</div>

        <div className="team-grid">
          <TeamList title="Team A" players={teamA} />
          <TeamList title="Team B" players={teamB} />
        </div>

        <button className="primary-button" onClick={handleStartGame} disabled={!canStart || busy}>
          {busy ? "Starting..." : "Start game"}
        </button>

        {!canStart && <p className="muted">You need at least one player on each team before starting.</p>}
        {message && <p className="error-text">{message}</p>}
      </section>
    </main>
  );
}
