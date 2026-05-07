import React, { useState } from "react";
import Board from "./Board";
import Hint from "./Hint";
import Guess from "./Guess";

function getRandomTarget() {
  return Math.floor(Math.random() * 181); // 0-180 degrees
}

export default function App() {
  const [player, setPlayer] = useState(1);
  const [hint, setHint] = useState("");
  const [target, setTarget] = useState(getRandomTarget());
  const [guess, setGuess] = useState(null);
  const [result, setResult] = useState(null);

  function handleHintSubmit(hintValue) {
    setHint(hintValue);
  }

  function handleGuessSubmit(guessValue) {
    setGuess(guessValue);
    setResult(Math.abs(guessValue - target));
  }

  function nextTurn() {
    setPlayer(player === 1 ? 2 : 1);
    setHint("");
    setGuess(null);
    setResult(null);
    setTarget(getRandomTarget());
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Wavelength Game</h1>
      <h2>Player {player}'s Turn</h2>
      <Board target={hint ? target : null} guess={guess} />
      {!hint && <Hint onSubmit={handleHintSubmit} />}
      {hint && guess === null && <Guess onSubmit={handleGuessSubmit} hint={hint} />}
      {result !== null && (
        <div>
          <p>Target: {target}°</p>
          <p>Your guess: {guess}°</p>
          <p>Difference: {result}°</p>
          <button onClick={nextTurn}>Next Turn</button>
        </div>
      )}
    </div>
  );
}