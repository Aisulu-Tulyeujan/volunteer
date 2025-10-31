import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email,password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const authPayload = {
        token: data.token,
        user: {
          id: data.user.id || data.user._id,
          _id: data.user._id || data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        },
      };

      localStorage.setItem("auth", JSON.stringify(authPayload));
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);
    
      if (data.user.role === "admin") {
        navigate("/admin/events",{replace: true });   
      } else {
        navigate("/volunteer/profile", {replace: true });
      }
    } catch (err) {
        console.error("Login error:", err);
        setError(err.message);
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

      {error && <p className="error">{error}</p>}


      <p className="switch-text">
        Don't have an account?
        <Link to="/register" className="switch-link"> Register here</Link>
      </p>
    </div>
  );
}
