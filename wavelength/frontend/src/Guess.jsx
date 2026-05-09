import { useState } from "react";

export default function Guess({ onSubmit, hint }) {
  const [guess, setGuess] = useState(90);

  return (
    <form
      className="form-stack compact-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(Number(guess));
      }}
    >
      <p><strong>Hint:</strong> {hint}</p>
      <label>
        Team guess: {guess}°
        <input
          type="range"
          min="0"
          max="180"
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
        />
      </label>
      <input
        type="number"
        min="0"
        max="180"
        value={guess}
        onChange={(event) => setGuess(event.target.value)}
      />
      <button className="primary-button" type="submit">Submit guess</button>
    </form>
  );
}
