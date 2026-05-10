export default function GameOver({ room, user, onBack }) {
  const players = room.players || [];
  const teamA = players.filter((p) => p.team === "A");
  const teamB = players.filter((p) => p.team === "B");
  const history = room.round_history || [];
  const winner = room.winner;
  const myTeam = room.my_player?.team;

  const didWin = myTeam === winner;

  const totalPointsA = history
    .filter((r) => r.active_team === "A")
    .reduce((s, r) => s + r.points, 0);
  const totalPointsB = history
    .filter((r) => r.active_team === "B")
    .reduce((s, r) => s + r.points, 0);

  const bestRound = history.length
    ? history.reduce((best, r) => (r.points > best.points ? r : best), history[0])
    : null;

  function ptsBadgeStyle(pts) {
    if (pts === 4) return { background: "#E6F1FB", color: "#0C447C" };
    if (pts === 3) return { background: "#FAEEDA", color: "#633806" };
    if (pts === 2) return { background: "#EAF3DE", color: "#27500A" };
    return { background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" };
  }

  function Avatar({ name, size = 32 }) {
    const initials = name ? name.slice(0, 2).toUpperCase() : "??";
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "var(--color-background-info)",
        color: "var(--color-text-info)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 500, flexShrink: 0,
      }}>
        {initials}
      </div>
    );
  }

  function TeamCard({ team, players, score, isWinner }) {
    return (
      <div style={{
        flex: 1,
        background: "var(--color-background-primary)",
        border: isWinner ? "2px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isWinner && (
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "2px 8px",
                borderRadius: "var(--border-radius-md)",
                background: "var(--color-background-info)", color: "var(--color-text-info)",
              }}>
                Winner
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
              Team {team}
            </span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)" }}>{score}</span>
        </div>
        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {players.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={p.username} size={28} />
              <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{p.username}</span>
              {p.id === user.id && (
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>(you)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="page">
      <section className="card game-card">

        <div style={{ marginBottom: "1.5rem" }}>
          <p className="eyebrow">Game over · Room {room.room_code}</p>
          <h1 style={{ margin: "4px 0 6px" }}>
            {didWin ? "Your team won!" : `Team ${winner} wins`}
          </h1>
          <p className="muted">{history.length} rounds played</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <TeamCard team="A" players={teamA} score={room.team_a_score} isWinner={winner === "A"} />
          <TeamCard team="B" players={teamB} score={room.team_b_score} isWinner={winner === "B"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
          {[
            { label: "Rounds played", value: history.length },
            { label: "Team A points", value: totalPointsA },
            { label: "Team B points", value: totalPointsB },
            { label: "Best round", value: bestRound ? `${bestRound.points} pts` : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "var(--color-background-secondary)",
              borderRadius: "var(--border-radius-md)",
              padding: "0.75rem 1rem",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
            marginBottom: "1.5rem",
          }}>
            <div style={{ padding: "0.75rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>Round history</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 13 }}>
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "13%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "var(--color-background-secondary)" }}>
                    {["#", "Team", "Spectrum", "Clue", "Psychic", "Guess / Target", "Pts"].map((h) => (
                      <th key={h} style={{
                        padding: "8px 12px", textAlign: "left",
                        fontWeight: 500, color: "var(--color-text-secondary)",
                        fontSize: 12, whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={r.round_number} style={{
                      borderTop: "0.5px solid var(--color-border-tertiary)",
                      background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)",
                    }}>
                      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)" }}>{r.round_number}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        Team {r.active_team}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.spectrum_left} ↔ {r.spectrum_right}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.hint || <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.psychic_username || "—"}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                        {r.guess ?? "—"}° / {r.target ?? "—"}°
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          display: "inline-block",
                          fontSize: 12, fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: "var(--border-radius-md)",
                          ...ptsBadgeStyle(r.points),
                        }}>
                          {r.points} pt{r.points !== 1 ? "s" : ""}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button className="primary-button" onClick={onBack}>Back to dashboard</button>
      </section>
    </main>
  );
}
