import React, { useState } from "react";
import axios from "axios";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
        const response = await axios.post("http://localhost:8080/Login",{
            email,
            password,
        });

        alert(response.data.message);

        if (response.data.message === "Login Successful") {
        console.log("User ID:", response.data.userId);
        console.log("Role:", response.data.role);
        }
    }catch (error){
        console.log(error);
        alert("Server Error");
    }
  };

  return (
    <div className="container">
      <div className="logo">
        🎓
      </div>

      <h1 className="title">AI-Driven Academic Strategy Platform</h1>
      <p className="subtitle">AI-powered study planning and analysis</p>

      <div className="card">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <div className="inputBox">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="inputBox">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            Sign In →
          </button>
        </form>

        <p className="signup">
          Don’t have an account? <span>Sign up</span>
        </p>
      </div>
    </div>
  );
}
