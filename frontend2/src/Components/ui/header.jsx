import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./header.module.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">NAIJAMARKET</div>

      <div className="search-container">
        <input type="text" placeholder="Search products..." />
        <button>Search</button>
      </div>

      {/* Hamburger Button */}
      <button
        className="menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      <nav className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/shop" onClick={() => setMenuOpen(false)}>
          Shop
        </Link>
        <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
          Wishlist
        </Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>
          Cart
        </Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </Link>
      </nav>
    </header>
  );
};

export default Header;