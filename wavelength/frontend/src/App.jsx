import { useEffect, useState } from "react";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import Lobby from "./Lobby";
import GameRoom from "./GameRoom";
import { getCurrentUser } from "./services/api";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [view, setView] = useState("auth");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const data = await getCurrentUser();

      if (data.logged_in) {
        setUser(data.user);
        setView("dashboard");
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return <main className="page"><section className="card"><h1>Loading Wavelength...</h1></section></main>;
  }

  if (view === "auth") {
    return <AuthPage setUser={setUser} setView={setView} />;
  }

  if (view === "dashboard") {
    return <Dashboard user={user} setUser={setUser} setRoom={setRoom} setView={setView} />;
  }

  if (view === "lobby") {
    return <Lobby user={user} room={room} setRoom={setRoom} setView={setView} />;
  }

  if (view === "game") {
    return <GameRoom user={user} room={room} setRoom={setRoom} setView={setView} />;
  }

  return <main className="page"><section className="card"><h1>Something went wrong.</h1></section></main>;
}
