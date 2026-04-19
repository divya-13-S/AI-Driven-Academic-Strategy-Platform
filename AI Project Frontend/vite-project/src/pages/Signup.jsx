import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiBriefcase, FiBook } from "react-icons/fi";
import illustration from '../assets/workspace_illustration.png';

function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    subject: ""
  });

  const subjectsList = ["Maths", "Physics", "Chemistry", "Biology"];

  const handleSignup = async () => {

    if (!form.name || !form.email || !form.password || !form.role) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/SignUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      alert(data.message);

      if (data.message === "Sign Up Successful") {
        navigate("/");
      }

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-left-pane">
        <div className="login-card">
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Join us and start your journey</p>

          <div className="login-input-group">
            <FiUser className="input-icon" />
            <input
              className="login-input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="login-input-group">
            <FiMail className="input-icon" />
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="login-input-group">
            <FiLock className="input-icon" />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="login-input-group">
            <FiBriefcase className="input-icon" />
            <select
              className="login-input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {form.role === "faculty" && (
            <div className="login-input-group">
              <FiBook className="input-icon" />
              <select
                className="login-input"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">Select Subject</option>
                {subjectsList.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <button className="login-btn" onClick={handleSignup}>Sign Up</button>

          <p className="signup-text">
            Already have an account? <span className="signup-link" onClick={() => navigate("/")}>Login</span>
          </p>
        </div>
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

export default Signup;
