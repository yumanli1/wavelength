import { useEffect, useRef, useState } from "react";
import Board from "./Board";
import Hint from "./Hint";
import Guess from "./Guess";
import GameOver from "./GameOver";
import {
  getRoom,
  submitHint,
  submitGuess,
  revealRound,
  nextRound,
  getChatMessages,
  sendChatMessage,
  getRoomProfiles,
  sendReaction,
  getReactions
} from "./services/api";

const DEFAULT_AVATAR = "🎮";
const REACTION_EMOJIS = ["👍", "😂", "😮", "😡", "🔥"];

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

function PhaseHelp({ room, isPsychic, isActiveTeam, isOpposingTeam }) {
  if (room.phase === "psychic_clue" && isPsychic) {
    return <p className="success-text">You are the psychic. Give a clue that points your team toward the hidden target.</p>;
  }

  if (room.phase === "psychic_clue") {
    return <p className="muted">Waiting for the active team psychic to submit a clue.</p>;
  }

  if (room.phase === "team_guess" && isOpposingTeam) {
    return <p className="success-text">The clue is in. Your team guesses — move the dial to a number from 0 to 180.</p>;
  }

  if (room.phase === "team_guess" && isPsychic) {
    return <p className="muted">You gave the clue — wait for the opposing team to guess.</p>;
  }

  if (room.phase === "team_guess") {
    return <p className="muted">Waiting for the opposing team to submit a guess.</p>;
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
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatError, setChatError] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [profilesById, setProfilesById] = useState({});
  const [profilesError, setProfilesError] = useState("");
  const [reactions, setReactions] = useState([]);
  const [reactionError, setReactionError] = useState("");
  const reactionTimeoutsRef = useRef([]);
  const lastReactionIdRef = useRef(0);
  const seenReactionIdsRef = useRef(new Set());

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
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [room?.room_code, setRoom]);

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
    timer = setInterval(refreshProfiles, 7000);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [room?.room_code]);

  useEffect(() => {
    return () => {
      (reactionTimeoutsRef.current || []).forEach((id) => clearTimeout(id));
      reactionTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!room?.room_code) return;

    let alive = true;
    let timer = null;

    async function pollReactions() {
      const data = await getReactions(room.room_code, lastReactionIdRef.current || 0);
      if (!alive) return;

      if (data.error) {
        setReactionError(data.error);
        return;
      }

      setReactionError("");
      const incoming = Array.isArray(data.reactions) ? data.reactions : [];
      if (incoming.length === 0) return;

      for (const reaction of incoming) {
        const id = reaction?.id;
        if (id === null || id === undefined) continue;
        if (seenReactionIdsRef.current.has(id)) continue;

        seenReactionIdsRef.current.add(id);
        if (typeof id === "number" && id > lastReactionIdRef.current) {
          lastReactionIdRef.current = id;
        }

        spawnReaction(reaction?.emoji);
      }
    }

    pollReactions();
    timer = setInterval(pollReactions, 1200);

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
          <h1>No active game</h1>
          <button className="primary-button" onClick={() => setView("dashboard")}>Back to dashboard</button>
        </section>
      </main>
    );
  }

  if (room.phase === "game_over") {
    return <GameOver room={room} user={user} onBack={() => setView("dashboard")} />;
  }

  const myPlayer = room.my_player || {};
  const isPsychic = Boolean(myPlayer.is_psychic);
  const isActiveTeam = Boolean(myPlayer.team) && myPlayer.team === room.active_team;
  const isOpposingTeam = Boolean(myPlayer.team) && myPlayer.team !== room.active_team;
  const psychicPlayer = (room.players || []).find((player) => player.is_psychic);
  const canHint = room.phase === "psychic_clue" && isPsychic;
  const canGuess = room.phase === "team_guess" && isOpposingTeam;
  const canReveal = room.phase === "reveal";
  const canNextRound = room.phase === "scored";
  const myProfile = profilesById?.[user?.id] || null;
  const myDisplayName = myProfile?.display_name || user?.username || "";
  const myAvatar = myProfile?.avatar || DEFAULT_AVATAR;
  const psychicProfile = psychicPlayer ? profilesById?.[psychicPlayer.id] : null;
  const psychicDisplayName = psychicProfile?.display_name || psychicPlayer?.username || "TBD";
  const psychicAvatar = psychicProfile?.avatar || DEFAULT_AVATAR;

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

  function spawnReaction(emoji) {
    const cleanEmoji = String(emoji || "").trim();
    if (!cleanEmoji) return;

    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const left = 18 + Math.random() * 64; // percent inside the card
    const top = 32 + Math.random() * 38; // keep near the board area

    setReactions((current) => [...current, { id, emoji: cleanEmoji, left, top }]);

    const timeoutId = setTimeout(() => {
      setReactions((current) => current.filter((item) => item.id !== id));
    }, 1700);

    reactionTimeoutsRef.current.push(timeoutId);
  }

  async function handleSendReaction(emoji) {
    if (!room?.room_code) return;
    setReactionError("");
    const data = await sendReaction(room.room_code, emoji);

    if (data.error) {
      setReactionError(data.error);
      return;
    }

    if (data.reaction?.id !== undefined && data.reaction?.id !== null) {
      const id = data.reaction.id;
      seenReactionIdsRef.current.add(id);
      if (typeof id === "number" && id > lastReactionIdRef.current) {
        lastReactionIdRef.current = id;
      }
    }

    spawnReaction(data.reaction?.emoji || emoji);
  }

  return (
    <main className="page game-page">
      <section className="card game-card">
        <div className="reaction-layer" aria-hidden="true">
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="reaction-float"
              style={{ left: `${reaction.left}%`, top: `${reaction.top}%` }}
            >
              {reaction.emoji}
            </div>
          ))}
        </div>

        <div className="top-row">
          <div>
            <p className="eyebrow">Room {room.room_code} · Round {room.round_number}</p>
            <h1>Wavelength</h1>
            <p className="muted">You are {myAvatar} {myDisplayName} on Team {myPlayer.team || "?"}.</p>
          </div>
          <button className="secondary-button" onClick={() => setView("dashboard")}>Leave view</button>
        </div>

        <Scoreboard room={room} />

        <div className="spectrum-card">
          <span>{room.spectrum_left}</span>
          <strong className="spectrum-connector" aria-label="Spectrum">
            ↔
          </strong>
          <span>{room.spectrum_right}</span>
        </div>

        <div className="reaction-bar" aria-label="Emoji reactions">
          <p className="muted reaction-label">Reactions</p>
          <div className="reaction-buttons">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="reaction-button"
                onClick={() => handleSendReaction(emoji)}
                aria-label={`Send reaction ${emoji}`}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Psychic POV: show zones + labels but NOT the gray outer bands (handled in Board).
            Guesser guessing phase: show blank interactive board.
            Otherwise (reveal/scored/game_over): show full board. */}
        {canGuess ? (
          /* Guessers see a blank interactive board — no zones, no labels, no target */
          null /* Board is rendered inside <Guess> below */
        ) : (
          <Board
            target={room.target}
            guess={room.guess}
            showLabels={isPsychic || room.phase === "reveal" || room.phase === "scored" || room.phase === "game_over"}
            showZones={isPsychic || room.phase === "reveal" || room.phase === "scored" || room.phase === "game_over"}
          />
        )}

        <div className="status-panel">
          <p><strong>Phase:</strong> {room.phase.replace("_", " ")}</p>
          <p><strong>Active team:</strong> Team {room.active_team}</p>
          <p><strong>Psychic:</strong> {psychicPlayer ? `${psychicAvatar} ${psychicDisplayName}` : "TBD"}</p>
          {room.target_hidden && <p className="muted">The target is hidden from you until reveal.</p>}
          {room.target !== null && room.target !== undefined && <p><strong>Target:</strong> {room.target}°</p>}
          {room.hint && <p><strong>Hint:</strong> {room.hint}</p>}
          {room.guess !== null && room.guess !== undefined && <p><strong>Guess:</strong> {room.guess}°</p>}
          <PhaseHelp room={room} isPsychic={isPsychic} isActiveTeam={isActiveTeam} isOpposingTeam={isOpposingTeam} />
        </div>

        <div className="controls-panel">
          {canHint && (
            <Hint disabled={busy} onSubmit={(hint) => runAction(() => submitHint(room.room_code, hint))} />
          )}

          {canGuess && (
            <Guess
              disabled={busy}
              hint={room.hint}
              onSubmit={(guess) => runAction(() => submitGuess(room.room_code, guess))}
            />
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

        {busy && <p className="muted">Updating game...</p>}
        {profilesError && <p className="error-text">{profilesError}</p>}
        {reactionError && <p className="error-text">{reactionError}</p>}
        {message && <p className={message.includes("error") ? "error-text" : "success-text"}>{message}</p>}
      </section>
    </main>
  );
}
