import React, { useState } from "react";
import axios from "axios";


export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/signup`, {
        fullName,
        email,
        password,
        role,
      });

      alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert("Server Error");
    }
  };

  return (
    <div className="container">
      <div className="logo">🎓</div>

      <h1 className="title">AI-Driven Academic Strategy Platform</h1>
      <p className="subtitle">Start your journey to academic excellence</p>

      <div className="card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <div className="inputBox">
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label>Role</label>
          <div className="inputBox">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <button type="submit" className="btn">
            Create Account
          </button>
        </form>

        <p className="signin">
          Already have an account? <span>Sign in</span>
        </p>
      </div>
    </div>
  );
}
