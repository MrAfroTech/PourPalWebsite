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

  // Function to open Calendly popup
  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/YOUR_USERNAME/YOUR_EVENT_TYPE'
      });
      return false;
    }
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
            <Link to="/increase-revenue" className="nav-link" onClick={() => setMenuOpen(false)}>
              Increase Revenue
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/reduce-expenses" className="nav-link" onClick={() => setMenuOpen(false)}>
              Reduce Expenses
            </Link>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </li>
          <li className="nav-item">
            <button className="nav-button primary-button" onClick={openCalendly}>
              See How Much You'll Earn → Book Now
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;