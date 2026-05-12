import { useEffect, useRef, useState } from "react";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import Lobby from "./Lobby";
import GameRoom from "./GameRoom";
import { getCurrentUser, logout } from "./services/api";
import "./styles.css";
import "./App.css";

export default function App() {
  const THEME_KEY = "wavelength_theme";
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [view, setView] = useState("auth");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [menuCopyFeedback, setMenuCopyFeedback] = useState("");
  const [menuCopyFailed, setMenuCopyFailed] = useState(false);
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

  const menuCloseButtonRef = useRef(null);
  const menuCopyTimeoutRef = useRef(null);

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
    if (view === "auth") {
      setMenuOpen(false);
      setRulesOpen(false);
    }
  }, [view]);

  useEffect(() => {
    if (!menuOpen && !rulesOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setRulesOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, rulesOpen]);

  useEffect(() => {
    document.body.classList.toggle("overlay-open", menuOpen || rulesOpen);
    return () => document.body.classList.remove("overlay-open");
  }, [menuOpen, rulesOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    menuCloseButtonRef.current?.focus?.();
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (menuCopyTimeoutRef.current) clearTimeout(menuCopyTimeoutRef.current);
    };
  }, []);

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

  async function copyRoomCode(roomCode) {
    const code = String(roomCode || "").trim();
    if (!code) {
      return { ok: false, message: "No room code to copy yet." };
    }

    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(code);
      return { ok: true, message: "Copied!" };
    } catch (_) {
      return {
        ok: false,
        message: "Could not copy. Please select the code and copy manually."
      };
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setMenuOpen(false);
      setRulesOpen(false);
      setView("auth");
      setRoom(null);
      setUser(null);
    }
  }

  async function handleMenuCopy() {
    if (menuCopyTimeoutRef.current) clearTimeout(menuCopyTimeoutRef.current);
    const result = await copyRoomCode(room?.room_code);
    setMenuCopyFailed(!result.ok);
    setMenuCopyFeedback(result.message);
    menuCopyTimeoutRef.current = setTimeout(() => {
      setMenuCopyFeedback("");
      setMenuCopyFailed(false);
    }, 1600);
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
      content = <Lobby user={user} room={room} setRoom={setRoom} setView={setView} copyRoomCode={copyRoomCode} />;
    }
  }

  if (view === "game") {
    if (!user) {
      content = <AuthPage setUser={setUser} setView={setView} />;
    } else {
      content = <GameRoom user={user} room={room} setRoom={setRoom} setView={setView} copyRoomCode={copyRoomCode} />;
    }
  }

  if (!content) {
    content = <main className="page"><section className="card"><h1>Something went wrong.</h1></section></main>;
  }

  const showAppChrome = Boolean(user) && view !== "auth";

  return (
    <div className="app-shell">
      {showAppChrome ? (
        <button
          type="button"
          className="hamburger-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="app-menu"
        >
          ☰
        </button>
      ) : null}

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

      {menuOpen ? (
        <div className="overlay-backdrop" role="presentation" onClick={() => setMenuOpen(false)}>
          <aside
            id="app-menu"
            className="menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="menu-header">
              <div>
                <p className="eyebrow">Menu</p>
                <p className="muted menu-subtitle">
                  Signed in as {user?.username || "?"}
                  {room?.room_code ? ` · Room ${room.room_code}` : ""}
                </p>
              </div>
              <button
                ref={menuCloseButtonRef}
                type="button"
                className="icon-button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="menu-actions" aria-label="App navigation">
              <button type="button" className="menu-item" onClick={() => { setMenuOpen(false); setView("dashboard"); }}>
                Dashboard
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={handleMenuCopy}
                disabled={!room?.room_code}
                aria-disabled={!room?.room_code}
                title={room?.room_code ? "Copy the current room code" : "No room to copy yet"}
              >
                Copy room code
              </button>
              {menuCopyFeedback ? (
                <p className={menuCopyFailed ? "error-text menu-feedback" : "success-text menu-feedback"}>
                  {menuCopyFeedback}
                </p>
              ) : null}

              <button type="button" className="menu-item" onClick={() => { setMenuOpen(false); setRulesOpen(true); }}>
                Rules / How to play
              </button>

              <button type="button" className="menu-item" onClick={toggleTheme}>
                Theme: {theme === "dark" ? "Dark" : "Light"}
              </button>

              <button type="button" className="menu-item menu-item--danger" onClick={handleLogout}>
                Logout
              </button>
            </nav>
          </aside>
        </div>
      ) : null}

      {rulesOpen ? (
        <div className="overlay-backdrop" role="presentation" onClick={() => setRulesOpen(false)}>
          <section
            className="rules-modal card"
            role="dialog"
            aria-modal="true"
            aria-label="How to play Wavelength"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rules-header">
              <div>
                <p className="eyebrow">How to play</p>
                <h2>Wavelength (quick rules)</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setRulesOpen(false)} aria-label="Close rules">
                ✕
              </button>
            </div>

            <div className="rules-body">
              <p className="muted">
                Each round has a spectrum (Left ↔ Right). The server secretly picks a target number on the dial.
              </p>
              <ol className="rules-list">
                <li><strong>Psychic</strong> sees the target and gives a short hint.</li>
                <li><strong>Other team</strong> moves the dial (0–180) to guess where the target is.</li>
                <li><strong>Reveal</strong> shows target vs guess and awards points.</li>
                <li>First team to <strong>10 points</strong> wins.</li>
              </ol>
              <p className="muted">
                Tip: hints should point to a <em>place on the spectrum</em>, not a specific number.
              </p>
            </div>

            <div className="rules-actions">
              <button type="button" className="primary-button" onClick={() => setRulesOpen(false)}>
                Got it
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {content}
    </div>
  );
}
