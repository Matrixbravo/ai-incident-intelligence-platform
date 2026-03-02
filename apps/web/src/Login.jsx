import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Simple hardcoded demo credentials
    if (username === "uday.singh03" && password === "17Dec!997") {
      localStorage.setItem("ai_logged_in", "true");
      onLogin();
    } else {
      alert("Invalid credentials. Please ping me on Teams.");
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 350 }}>
        <h2>AI Incident Intelligence Platform</h2>
        <p style={{ fontSize: 14 }}>
          To enter the home page, please ping me over Teams to get credentials.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />
          <button style={{ width: "100%", padding: 10 }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}