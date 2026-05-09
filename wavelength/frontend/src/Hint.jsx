import { useState } from "react";

export default function Hint({ onSubmit }) {
  const [hint, setHint] = useState("");

  return (
    <form
      className="form-stack compact-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(hint);
        setHint("");
      }}
    >
      <label>
        Psychic clue
        <input
          value={hint}
          maxLength="120"
          onChange={(event) => setHint(event.target.value)}
          placeholder="Example: final exam week"
        />
      </label>
      <button className="primary-button" type="submit">Submit clue</button>
    </form>
  );
}
