import { useRef, useCallback } from "react";

const CX = 200;
const CY = 195;
const INNER_R = 62;
const OUTER_R = 175;

// game 0 = left end, game 180 = right end, arc opens UPWARD
// angle = pi*(1 - deg/180): 0->pi(left), 90->pi/2(top), 180->0(right)
// x = CX + r*cos(angle), y = CY - r*sin(angle)  ← minus keeps arc above baseline
function gameToAngle(deg) {
  return Math.PI * (1 - deg / 180);
}

function polarToXY(deg, r) {
  const a = gameToAngle(deg);
  return {
    x: CX + r * Math.cos(a),
    y: CY - r * Math.sin(a),
  };
}

// SVG arc band between two game-degree values
function arcBand(startDeg, endDeg, innerR, outerR) {
  const o1 = polarToXY(startDeg, outerR);
  const o2 = polarToXY(endDeg, outerR);
  const i1 = polarToXY(startDeg, innerR);
  const i2 = polarToXY(endDeg, innerR);
  // outer arc: sweep-flag=1 (clockwise in SVG = left-to-right across top)
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 0 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 0 0 ${i1.x} ${i1.y}`,
    "Z",
  ].join(" ");
}

// Scoring zones centered on game-deg 90
// Backend: 4pts <=5°, 3pts <=12°, 2pts <=22°
const BASE_ZONES = [
  { startDeg: 0,    endDeg: 68,   color: "#cbd5e1" }, // 0 pts grey
  { startDeg: 112,  endDeg: 180,  color: "#cbd5e1" }, // 0 pts grey
  { startDeg: 68,   endDeg: 78,   color: "#fbbf24" }, // 2 pts yellow
  { startDeg: 102,  endDeg: 112,  color: "#fbbf24" }, // 2 pts yellow
  { startDeg: 78,   endDeg: 85,   color: "#f97316" }, // 3 pts orange
  { startDeg: 95,   endDeg: 102,  color: "#f97316" }, // 3 pts orange
  { startDeg: 85,   endDeg: 95,   color: "#3b82f6" }, // 4 pts blue
];

const BASE_LABELS = [
  { midDeg: 34,    pts: 2, small: true  },
  { midDeg: 146,   pts: 2, small: true  },
  { midDeg: 73,    pts: 2              },
  { midDeg: 107,   pts: 2              },
  { midDeg: 81.5,  pts: 3              },
  { midDeg: 98.5,  pts: 3              },
  { midDeg: 90,    pts: 4              },
];

function shiftZones(zones, target) {
  const offset = target - 90;
  return zones.map((z) => ({
    ...z,
    startDeg: Math.max(0, Math.min(180, z.startDeg + offset)),
    endDeg:   Math.max(0, Math.min(180, z.endDeg   + offset)),
  }));
}

function shiftLabels(labels, target) {
  const offset = target - 90;
  return labels.map((l) => ({ ...l, midDeg: l.midDeg + offset }));
}

export default function Board({ target, guess, interactive = false, onGuessChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const hasTarget = target !== null && target !== undefined;
  const hasGuess  = guess  !== null && guess  !== undefined;

  const zoneDeg = hasTarget ? target : 90;
  const zones   = shiftZones(BASE_ZONES,   zoneDeg);
  const labels  = shiftLabels(BASE_LABELS, zoneDeg);

  // Convert pointer position to game degree
  const posToGameDeg = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 210 / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top)  * scaleY;
    const dx = svgX - CX;
    const dy = CY - svgY;  // flip Y so up is positive
    // atan2(dy, dx): 0=right, pi/2=up, pi=left
    let angle = Math.atan2(dy, dx);
    // clamp to top half
    if (angle < 0) angle = 0;
    if (angle > Math.PI) angle = Math.PI;
    // game deg = (1 - angle/pi) * 180
    const gameDeg = Math.round((1 - angle / Math.PI) * 180);
    return Math.max(0, Math.min(180, gameDeg));
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (!interactive) return;
    dragging.current = true;
    svgRef.current.setPointerCapture(e.pointerId);
    const deg = posToGameDeg(e.clientX, e.clientY);
    if (deg !== null) onGuessChange(deg);
  }, [interactive, onGuessChange, posToGameDeg]);

  const handlePointerMove = useCallback((e) => {
    if (!interactive || !dragging.current) return;
    const deg = posToGameDeg(e.clientX, e.clientY);
    if (deg !== null) onGuessChange(deg);
  }, [interactive, onGuessChange, posToGameDeg]);

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  const guessPos  = hasGuess  ? polarToXY(guess,  OUTER_R - 8) : null;
  const targetPos = hasTarget ? polarToXY(target, OUTER_R - 8) : null;

  const leftEnd  = polarToXY(0,   OUTER_R + 2);
  const rightEnd = polarToXY(180, OUTER_R + 2);

  return (
    <div className="board-wrap">
      <svg
        ref={svgRef}
        className={`board${interactive ? " board-interactive" : ""}`}
        viewBox="0 0 400 210"
        role="img"
        aria-label="Wavelength wheel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        {/* Colored scoring bands */}
        {zones.map((zone, i) => (
          <path key={i} d={arcBand(zone.startDeg, zone.endDeg, INNER_R, OUTER_R)} fill={zone.color} />
        ))}

        {/* Outer arc border */}
        <path
          d={`M ${polarToXY(0, OUTER_R).x} ${polarToXY(0, OUTER_R).y} A ${OUTER_R} ${OUTER_R} 0 0 1 ${polarToXY(180, OUTER_R).x} ${polarToXY(180, OUTER_R).y}`}
          fill="none" stroke="#475569" strokeWidth="2"
        />
        {/* Inner arc border */}
        <path
          d={`M ${polarToXY(0, INNER_R).x} ${polarToXY(0, INNER_R).y} A ${INNER_R} ${INNER_R} 0 0 1 ${polarToXY(180, INNER_R).x} ${polarToXY(180, INNER_R).y}`}
          fill="none" stroke="#475569" strokeWidth="2"
        />
        {/* Side edges */}
        <line x1={polarToXY(0,   INNER_R).x} y1={polarToXY(0,   INNER_R).y} x2={polarToXY(0,   OUTER_R).x} y2={polarToXY(0,   OUTER_R).y} stroke="#475569" strokeWidth="2" />
        <line x1={polarToXY(180, INNER_R).x} y1={polarToXY(180, INNER_R).y} x2={polarToXY(180, OUTER_R).x} y2={polarToXY(180, OUTER_R).y} stroke="#475569" strokeWidth="2" />

        {/* Point labels */}
        {labels.map((l, i) => {
          if (l.midDeg < 3 || l.midDeg > 177) return null;
          const pos = polarToXY(l.midDeg, (INNER_R + OUTER_R) / 2);
          return (
            <text key={i} x={pos.x} y={pos.y + 5} textAnchor="middle"
              fontSize={l.small ? "10" : "14"} fontWeight="800" fill="#1e293b">
              {l.pts}
            </text>
          );
        })}

        {/* Target needle */}
        {targetPos && (
          <>
            <line x1={CX} y1={CY} x2={targetPos.x} y2={targetPos.y} stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
            <circle cx={targetPos.x} cy={targetPos.y} r="7" fill="#dc2626" />
          </>
        )}

        {/* Guess needle */}
        {guessPos && (
          <>
            <line x1={CX} y1={CY} x2={guessPos.x} y2={guessPos.y} stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            <circle cx={guessPos.x} cy={guessPos.y} r="9" fill="#1d4ed8" stroke="white" strokeWidth="2" />
          </>
        )}

        {/* Center hub */}
        <circle cx={CX} cy={CY} r="16" fill="#1e293b" />
        <circle cx={CX} cy={CY} r="9"  fill="#f1f5f9" />

        {interactive && (
          <text x={CX} y={208} textAnchor="middle" fontSize="11" fill="#64748b" fontStyle="italic">
            Click or drag to aim
          </text>
        )}
      </svg>

      <div className="legend-row">
        {hasGuess  && <span><i className="legend-dot guess-dot"  /> Guess</span>}
        {hasTarget && <span><i className="legend-dot target-dot" /> Target</span>}
      </div>
    </div>
  );
}
