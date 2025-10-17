import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);

    // Dummy credentials
    const volunteerEmail = "volunteer@example.com";
    const adminEmail = "admin@example.com";
    const validPassword = "password123";

    if (password === validPassword && (email === volunteerEmail || email === adminEmail)) {
      console.log("Login successful!");

      // Save to localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);

      // Save user role (important!)
      const role = email === adminEmail ? "admin" : "volunteer";
      localStorage.setItem("userRole", role);

      // Navigate based on role
      if (role === "admin") {
        navigate("/admin/events", { replace: true });
      } else {
        navigate("/volunteer/profile", { replace: true });
      }
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
