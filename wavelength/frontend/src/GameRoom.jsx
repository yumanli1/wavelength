import { useEffect, useState } from "react";
import Board from "./Board";
import Hint from "./Hint";
import Guess from "./Guess";
import { getRoom, submitHint, submitGuess, revealRound, nextRound } from "./services/api";

function Scoreboard({ room }) {
  return (
    <div className="scoreboard">
      <div className={room.active_team === "A" ? "score active" : "score"}>
        <span>Team A</span>
        <strong>{room.team_a_score}</strong>
      </div>
      <div className={room.active_team === "B" ? "score active" : "score"}>
        <span>Team B</span>
        <strong>{room.team_b_score}</strong>
      </div>
    </div>
  );
}

function PhaseHelp({ room, isPsychic, isActiveTeam }) {
  if (room.phase === "psychic_clue" && isPsychic) {
    return <p className="success-text">You are the psychic. Give a clue that points your team toward the hidden target.</p>;
  }

  if (room.phase === "psychic_clue") {
    return <p className="muted">Waiting for the active team psychic to submit a clue.</p>;
  }

  if (room.phase === "team_guess" && !isPsychic) {
    return <p className="success-text">The clue is in. Move the dial by entering a number from 0 to 180.</p>;
  }

  if (room.phase === "team_guess") {
    return <p className="muted">Waiting for a non-psychic player to submit a guess.</p>;
  }

  if (room.phase === "reveal") {
    return <p className="muted">A guess has been submitted. Reveal the target and award points.</p>;
  }

  if (room.phase === "scored") {
    return <p className="success-text">Round scored. Start the next round when everyone is ready.</p>;
  }

  if (room.phase === "game_over") {
    return <p className="success-text">Game over. Team {room.winner} wins.</p>;
  }

  return <p className="muted">Game in progress.</p>;
}

export default function GameRoom({ user, room, setRoom, setView }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!room?.room_code) return;

    const timer = setInterval(async () => {
      const data = await getRoom(room.room_code);
      if (data.room) {
        setRoom(data.room);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [room?.room_code, setRoom]);

  if (!room) {
    return (
      <main className="page">
        <section className="card">
          <h1>No active game</h1>
          <button className="primary-button" onClick={() => setView("dashboard")}>Back to dashboard</button>
        </section>
      </main>
    );
  }

  const myPlayer = room.my_player || {};
  const isPsychic = Boolean(myPlayer.is_psychic);
  const isActiveTeam = myPlayer.team === room.active_team;
  const canHint = room.phase === "psychic_clue" && isPsychic;
  const canGuess = room.phase === "team_guess" && !isPsychic;
  const canReveal = room.phase === "reveal";
  const canNextRound = room.phase === "scored";

  async function runAction(action) {
    setMessage("");
    setBusy(true);
    const data = await action();
    setBusy(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    if (data.room) {
      setRoom(data.room);
    }

    if (data.points !== undefined) {
      setMessage(`Round scored: ${data.points} point${data.points === 1 ? "" : "s"}.`);
    } else if (data.message) {
      setMessage(data.message);
    }
  }

  return (
    <main className="page game-page">
      <section className="card game-card">
        <div className="top-row">
          <div>
            <p className="eyebrow">Room {room.room_code} · Round {room.round_number}</p>
            <h1>Wavelength</h1>
            <p className="muted">You are {user.username} on Team {myPlayer.team || "?"}.</p>
          </div>
          <button className="secondary-button" onClick={() => setView("dashboard")}>Leave view</button>
        </div>

        <Scoreboard room={room} />

        <div className="spectrum-card">
          <span>{room.spectrum_left}</span>
          <strong>Target spectrum</strong>
          <span>{room.spectrum_right}</span>
        </div>

        <Board target={room.target} guess={room.guess} />

        <div className="status-panel">
          <p><strong>Phase:</strong> {room.phase.replace("_", " ")}</p>
          <p><strong>Active team:</strong> Team {room.active_team}</p>
          {room.target_hidden && <p className="muted">The target is hidden from you until reveal.</p>}
          {room.target !== null && room.target !== undefined && <p><strong>Target:</strong> {room.target}°</p>}
          {room.hint && <p><strong>Hint:</strong> {room.hint}</p>}
          {room.guess !== null && room.guess !== undefined && <p><strong>Guess:</strong> {room.guess}°</p>}
          <PhaseHelp room={room} isPsychic={isPsychic} isActiveTeam={isActiveTeam} />
        </div>

        <div className="controls-panel">
          {canHint && (
            <Hint onSubmit={(hint) => runAction(() => submitHint(room.room_code, hint))} />
          )}

          {canGuess && (
            <Guess hint={room.hint} onSubmit={(guess) => runAction(() => submitGuess(room.room_code, guess))} />
          )}

          {canReveal && (
            <button className="primary-button" disabled={busy} onClick={() => runAction(() => revealRound(room.room_code))}>
              Reveal and score
            </button>
          )}

          {canNextRound && (
            <button className="primary-button" disabled={busy} onClick={() => runAction(() => nextRound(room.room_code))}>
              Start next round
            </button>
          )}

          {room.phase === "game_over" && (
            <button className="primary-button" onClick={() => setView("dashboard")}>Back to dashboard</button>
          )}
        </div>

        {busy && <p className="muted">Updating game...</p>}
        {message && <p className={message.includes("error") ? "error-text" : "success-text"}>{message}</p>}
      </section>
    </main>
  );
}
