import { useState } from "react";

function clampGuess(value) {
  return Math.max(0, Math.min(180, value));
}

export default function Guess({ onSubmit, hint, disabled = false }) {
  const [guess, setGuess] = useState(90);

  function updateGuess(nextValue) {
    const parsed = Number.parseInt(nextValue, 10);
    if (Number.isNaN(parsed)) return;
    setGuess(clampGuess(parsed));
  }

  return (
    <form
      className="form-stack compact-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        onSubmit(guess);
      }}
    >
      <p><strong>Hint:</strong> {hint}</p>
      <label>
        Team guess: {guess}°
        <input
          type="range"
          min="0"
          max="180"
          step="1"
          value={guess}
          disabled={disabled}
          onChange={(event) => updateGuess(event.target.value)}
        />
      </label>
      <input
        type="number"
        min="0"
        max="180"
        step="1"
        value={guess}
        disabled={disabled}
        onChange={(event) => updateGuess(event.target.value)}
      />
      <button className="primary-button" type="submit" disabled={disabled}>
        Submit guess
      </button>
    </form>
  );
}
