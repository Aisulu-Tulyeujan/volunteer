import React, { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState(' ');
  const [password, setPassword] = useState(' ');

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Logging in with:", { email, password });
  };

  return {
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit)>
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
    </div>
  );
};
export default Login;
          
                                  
