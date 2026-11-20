import { Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <FaRobot />
        </div>

        <div className="brand-text">
          <h2>TestGen AI</h2>
          <span>AI-Powered Software Testing</span>
        </div>
      </Link>

      <nav className="nav-links">
        <a href="/#home">Home</a>
        <a href="/#features">Features</a>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#about">About</a>
      </nav>

      <div className="nav-actions">
        <Link to="/login" className="nav-login">
          Login
        </Link>

        <Link to="/register" className="nav-register">
          Register
        </Link>
      </div>
    </header>
  );
}

export default Navbar;