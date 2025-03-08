import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ scrollPosition }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarClass, setNavbarClass] = useState('');

  useEffect(() => {
    // Change navbar style on scroll
    if (scrollPosition > 50) {
      setNavbarClass('navbar-scrolled');
    } else {
      setNavbarClass('');
    }
  }, [scrollPosition]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar ${navbarClass} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-container">
            <span className="logo-text">
              <span className="gradient-text">Pour</span>
              <span className="accent-text">Pal</span>
            </span>
          </div>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`hamburger ${menuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>
              Features
            </a>
          </li>
          <li className="nav-item">
            <a href="#testimonials" className="nav-link" onClick={() => setMenuOpen(false)}>
              Testimonials
            </a>
          </li>
          <li className="nav-item">
            <a href="#pricing" className="nav-link" onClick={() => setMenuOpen(false)}>
              Pricing
            </a>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </li>
          <li className="nav-item">
            <button className="nav-button primary-button">Serve Faster, Earn More</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;