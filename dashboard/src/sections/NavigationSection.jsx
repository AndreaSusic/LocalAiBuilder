import React, { useState, useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function NavigationSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { company_name, google = {} } = useContext(SiteDataContext) || {};
  
  const phone = google.phone || '+1 (555) 123-4567';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="logo">
          {company_name || 'YourLogo'}
        </div>
        
        <button 
          className="hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        
        <ul className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <li><a href="#home">Home</a></li>
          <li className="dropdown">
            <a href="#services">Services ▼</a>
            <ul className="dropdown-menu">
              <li><a href="#general">General Dentistry</a></li>
              <li><a href="#cosmetic">Cosmetic Dentistry</a></li>
              <li><a href="#invisalign">Invisalign®</a></li>
            </ul>
          </li>
          <li><a href="#about">About</a></li>
          <li><a href="#gallery">Gallery</a></li>
          <li><a href="#contact">Contact</a></li>
          <li className="contact-phone">
            <span>📞</span>
            <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
          </li>
          <li>
            <a href="#schedule" className="cta">Schedule Now</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}