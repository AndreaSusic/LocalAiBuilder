import React, { useState, useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function NavigationSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { company_name = "YourLogo", google = {} } = useContext(SiteDataContext) || {};
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Use Google phone if available
  const phone = google.phone || "+1 234 567 89";

  return (
    <nav className="nav">
      <div className="logo">{company_name}</div>
      <button
        className="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <ul className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
        <li>
          <a href="#">Home</a>
        </li>
        <li>
          <a href="#">Services ▾</a>
          <ul>
            <li>
              <a href="#">General Dentistry</a>
            </li>
            <li>
              <a href="#">Cosmetic Veneers</a>
            </li>
            <li>
              <a href="#">Invisalign®</a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#">About</a>
        </li>
        <li>
          <a href="#">Contact</a>
        </li>
        <li>
          <a href={`tel:${phone}`} className="contact-phone">
            📞 {phone}
          </a>
        </li>
        <li>
          <a href="#" className="cta">
            Schedule now
          </a>
        </li>
      </ul>
    </nav>
  );
}