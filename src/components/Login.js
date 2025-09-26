import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);

    const validEmail = 'volunteer@example.com';
    const validPassword = 'password123';

    if (email === validEmail && password === validPassword) {
      console.log("login successful! Redirecting to profile...");

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      // if admin navigate to event management
      // if volunteer navigate to volunteer dashboard
      navigate("/admin/match", { replace: true });
    } else {
      setError("Invalid email or password");
    }
    
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <p className="switch-text">
        Don't have an account?
        <Link to="/register" className="switch-link"> Register here</Link>
      </p>
    </div>
  );
}
