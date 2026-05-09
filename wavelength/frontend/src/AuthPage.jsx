import { useState } from "react";
import { login, signup } from "./services/api";

export default function AuthPage({ setUser, setView }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const data =
      mode === "login"
        ? await login(username, password)
        : await signup(username, password);

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setUser(data.user);
    setView("dashboard");
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Wavelength Game</h1>

      <h2>{mode === "login" ? "Log In" : "Sign Up"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button style={{ marginTop: "10px" }} type="submit">
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      {message && <p style={{ color: "red" }}>{message}</p>}

      <button
        style={{ marginTop: "20px" }}
        onClick={() => {
          setMessage("");
          setMode(mode === "login" ? "signup" : "login");
        }}
      >
        {mode === "login"
          ? "Need an account? Sign up"
          : "Already have an account? Log in"}
      </button>
    </div>
  );
}