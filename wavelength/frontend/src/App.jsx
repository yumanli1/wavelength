import { useEffect, useState } from "react";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import Lobby from "./Lobby";
import GameRoom from "./GameRoom";
import { getCurrentUser } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [view, setView] = useState("auth");

  useEffect(() => {
    async function checkUser() {
      const data = await getCurrentUser();

      if (data.logged_in) {
        setUser(data.user);
        setView("dashboard");
      }
    }

    checkUser();
  }, []);

  if (view === "auth") {
    return <AuthPage setUser={setUser} setView={setView} />;
  }

  if (view === "dashboard") {
    return <Dashboard user={user} setRoom={setRoom} setView={setView} />;
  }

  if (view === "lobby") {
    return <Lobby user={user} room={room} setRoom={setRoom} setView={setView} />;
  }

  if (view === "game") {
    return <GameRoom user={user} room={room} setRoom={setRoom} />;
  }

  return <h1>Loading...</h1>;
}