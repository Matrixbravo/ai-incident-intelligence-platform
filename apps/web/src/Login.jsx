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
    <div className="login-wrapper">
      <div className="login-card">
        <h2>AI Incident Intelligence Platform</h2>
        <p>
          To enter the home page, please ping me over Teams to get credentials.
        </p>

        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />

        <button onClick={onLogin}>Login</button>
      </div>
    </div>
  );
}