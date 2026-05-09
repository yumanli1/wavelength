import { useState } from "react";
import { login, signup } from "./services/api";

export default function AuthPage({ setUser, setView }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    const cleanUsername = username.trim();
    const data = mode === "login"
      ? await login(cleanUsername, password)
      : await signup(cleanUsername, password);

    setBusy(false);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setUser(data.user);
    setView("dashboard");
  }

  return (
    <main className="page auth-page">
      <section className="hero card">
        <p className="eyebrow">CSE 108 Final Project</p>
        <h1>Wavelength</h1>
        <p className="muted">
          A live team guessing game with accounts, rooms, scoring, database persistence, and a React/Flask full-stack flow.
        </p>
      </section>

      <section className="card auth-card">
        <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Username
            <input
              type="text"
              placeholder="ex: kris"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {message && <p className="error-text">{message}</p>}

        <button
          className="link-button"
          onClick={() => {
            setMessage("");
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}
