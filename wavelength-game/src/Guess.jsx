import React, { useState } from "react";

export default function Guess({ onSubmit, hint }) {
  const [guess, setGuess] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(Number(guess));
      }}
    >
      <p>Hint: {hint}</p>
      <input
        type="number"
        min="0"
        max="180"
        value={guess}
        onChange={e => setGuess(e.target.value)}
        placeholder="Your guess (0-180)"
      />
      <button type="submit">Submit Guess</button>
    </form>
  );
}