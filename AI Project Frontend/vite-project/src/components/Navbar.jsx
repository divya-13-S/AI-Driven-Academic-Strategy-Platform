import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h3>AI-Driven Academic Strategy Platform</h3>

      <div>
        <Link to="/student">Student</Link>
        <Link to="/faculty">Faculty</Link>
        <Link to="/admin">Admin</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
