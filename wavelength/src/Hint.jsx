import React, { useState } from "react";

export default function Hint({ onSubmit }) {
  const [hint, setHint] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(hint);
      }}
    >
      <input
        value={hint}
        onChange={e => setHint(e.target.value)}
        placeholder="Enter your hint"
      />
      <button type="submit">Submit Hint</button>
    </form>
  );
}