import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">eBanking</div>

        {/* Hamburger */}
        <div className="nav-toggle" onClick={() => setOpen(!open)}>
          ☰
        </div>

        {/* Links */}
        <ul className={`nav-links ${open ? "open" : ""}`}>
          <li><a href="#">Home</a></li>
          <li><a href="#">Accounts</a></li>
          <li><a href="#">Transactions</a></li>
          <li><a href="#">Profile</a></li>
        </ul>

        {/* Logout button */}
        <button className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;