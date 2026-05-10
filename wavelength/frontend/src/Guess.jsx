import { useState } from "react";
import Board from "./Board";

export default function Guess({ onSubmit, hint, disabled = false, revealedGuess }) {
  const [guess, setGuess] = useState(90);

  return (
    <div className="guess-wrapper">
      <p className="guess-hint"><strong>Hint:</strong> {hint}</p>

      {/* Guessers see a blank arc — no scoring zones, no labels, no target needle */}
      <Board
        target={null}
        guess={revealedGuess !== undefined ? revealedGuess : guess}
        interactive={!disabled}
        onGuessChange={setGuess}
        showLabels={false}
        showZones={false}
      />

      <div className="guess-controls">
        <span className="guess-value">Your guess: <strong>{guess}°</strong></span>
        <button
          className="primary-button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) onSubmit(guess);
          }}
        >
          Submit guess
        </button>
      </div>
    </div>
  );
}
