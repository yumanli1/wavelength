import { useEffect, useState } from "react";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import Lobby from "./Lobby";
import GameRoom from "./GameRoom";
import { getCurrentUser } from "./services/api";
import "./styles.css";
import "./App.css";

export default function App() {
  const THEME_KEY = "wavelength_theme";
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [view, setView] = useState("auth");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (_) {
      // ignore
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    async function checkUser() {
      const data = await getCurrentUser();

      if (data.logged_in) {
        setUser(data.user);
        setView("dashboard");
      } else {
        setUser(null);
        setRoom(null);
        setView("auth");
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user && view !== "auth") {
      setRoom(null);
      setView("auth");
    }
  }, [user, view, loading]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      // ignore
    }
  }, [theme]);

  if (loading) {
    return <main className="page"><section className="card"><h1>Loading Wavelength...</h1></section></main>;
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  let content = null;
  if (view === "auth") {
    content = <AuthPage setUser={setUser} setView={setView} />;
  }

  if (view === "dashboard") {
    if (!user) {
      content = <AuthPage setUser={setUser} setView={setView} />;
    } else {
      content = <Dashboard user={user} setUser={setUser} setRoom={setRoom} setView={setView} />;
    }
  }

  if (view === "lobby") {
    if (!user) {
      content = <AuthPage setUser={setUser} setView={setView} />;
    } else {
      content = <Lobby user={user} room={room} setRoom={setRoom} setView={setView} />;
    }
  }

  if (view === "game") {
    if (!user) {
      content = <AuthPage setUser={setUser} setView={setView} />;
    } else {
      content = <GameRoom user={user} room={room} setRoom={setRoom} setView={setView} />;
    }
  }

  if (!content) {
    content = <main className="page"><section className="card"><h1>Something went wrong.</h1></section></main>;
  }

  return (
    <div className="app-shell">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        aria-pressed={theme === "dark"}
      >
        <span className="theme-toggle__label">Theme</span>
        <span className="theme-toggle__value" aria-hidden="true">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      </button>
      {content}
    </div>
  );
}
