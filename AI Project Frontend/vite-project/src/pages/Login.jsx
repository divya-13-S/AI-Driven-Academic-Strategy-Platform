import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import illustration from '../assets/workspace_illustration.png';

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.message === "Login Successful") {

        // STORE USER SESSION
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        localStorage.setItem("subject", data.subject);
        localStorage.setItem("name", data.name);

        // REDIRECT BASED ON ROLE
        if (data.role === "student") navigate("/student");
        if (data.role === "faculty") navigate("/faculty");
        if (data.role === "admin") navigate("/admin");

      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="login-page-container">
      <div className="login-left-pane">
        {/* Background Animated Blobs */}
        <div className="login-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <form className="login-card" onSubmit={handleLogin}>
          <h2 className="login-title">LOGIN</h2>
          <p className="login-subtitle">Welcome back to your academic journey</p>

          <div className="login-input-group">
            <FiUser className="input-icon" />
            <input
              className="login-input"
              type="text"
              placeholder="Username or Email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-input-group">
            <FiLock className="input-icon" />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <a href="#" className="forgot-password">Forgot Password?</a>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="signup-text">
            Don't have an account? <span className="signup-link" onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </form>
      </div>
      
      <div className="login-right-pane">
        <div className="login-right-content">
          <div className="login-illustration-container">
            <img 
              src={illustration} 
              alt="Academic Workspace" 
              className="login-illustration" 
            />
          </div>
          <h1 className="login-right-heading">AI-Driven Academic Strategy Platform</h1>
          <p className="login-right-subtitle">Smart insights to help students plan, track, and succeed academically.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
