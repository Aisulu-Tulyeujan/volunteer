import React, { useState } from "react";

function Register() {
  const [email, setEmail] = useState(' ');
  const [password, setPassword] = useState(' ');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register email:", email, "password:" , password});
  };

  return {
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister)>
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
        <input 
          type="password"
          placeholder="Enter to confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
export default Register;
