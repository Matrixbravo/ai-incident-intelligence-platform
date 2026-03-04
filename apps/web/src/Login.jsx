import { useState } from "react";
import "./styles.css";

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  // Demo creds (build-time env in Vite)
  const VALID_USER = import.meta.env.VITE_LOGIN_USER || "uday.singh";
  const VALID_PASS = import.meta.env.VITE_LOGIN_PASS || "17Dec!997";

  function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    if (username.trim() === VALID_USER && password === VALID_PASS) {
      onSuccess();
      return;
    }
    setErr("Invalid username or password.");
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>AI Incident Intelligence Platform</h2>
        <p>To enter the home page, please ping me over Teams to get credentials.</p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <div className="login-error">{err}</div>}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

