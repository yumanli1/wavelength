export default function Board({ target, guess }) {
  function pointForDegree(degree, radius = 170) {
    const angle = (Math.PI * (degree - 180)) / 180;
    return {
      x: 200 + radius * Math.cos(angle),
      y: 190 + radius * Math.sin(angle)
    };
  }

  const targetPoint = target !== null && target !== undefined ? pointForDegree(target) : null;
  const guessPoint = guess !== null && guess !== undefined ? pointForDegree(guess) : null;
  const ticks = [0, 30, 60, 90, 120, 150, 180];

  return (
    <div className="board-wrap">
      <svg className="board" viewBox="0 0 400 225" role="img" aria-label="Wavelength half circle board">
        <path
          d="M 30 190 A 170 170 0 0 1 370 190"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          opacity="0.18"
          strokeLinecap="round"
        />

        {ticks.map((tick) => {
          const outer = pointForDegree(tick, 174);
          const inner = pointForDegree(tick, 150);
          return (
            <g key={tick}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="currentColor" strokeWidth="2" opacity="0.35" />
              <text x={pointForDegree(tick, 130).x} y={pointForDegree(tick, 130).y + 5} textAnchor="middle" fontSize="12" opacity="0.6">{tick}</text>
            </g>
          );
        })}

        {targetPoint && (
          <line x1="200" y1="190" x2={targetPoint.x} y2={targetPoint.y} className="target-line" />
        )}

        {guessPoint && (
          <line x1="200" y1="190" x2={guessPoint.x} y2={guessPoint.y} className="guess-line" />
        )}

        <circle cx="200" cy="190" r="8" fill="currentColor" opacity="0.35" />
      </svg>
      <div className="legend-row">
        <span><i className="legend-dot target-dot" /> Target</span>
        <span><i className="legend-dot guess-dot" /> Guess</span>
      </div>
    </div>
  );
}
