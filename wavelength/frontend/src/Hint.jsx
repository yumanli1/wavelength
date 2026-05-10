import { useState } from "react";

export default function Hint({ onSubmit, disabled = false }) {
  const [hint, setHint] = useState("");

  return (
    <form
      className="form-stack compact-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) return;
        const trimmed = hint.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setHint("");
      }}
    >
      <label>
        Psychic clue
        <input
          value={hint}
          maxLength={120}
          disabled={disabled}
          onChange={(event) => setHint(event.target.value)}
          placeholder="Example: final exam week"
        />
      </label>
      <button className="primary-button" type="submit" disabled={disabled || !hint.trim()}>
        Submit clue
      </button>
    </form>
  );
}
