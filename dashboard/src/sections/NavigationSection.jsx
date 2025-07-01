import React, { useState, useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function NavigationSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { company_name, services, industry, google = {} } = useContext(SiteDataContext) || {};
  
  const phone = google.phone || '+1 (555) 123-4567';
  
  // Convert services string to array and determine if it's products or services
  const servicesList = Array.isArray(services) ? services :
                      (typeof services === 'string' && services.length > 0) ? [services] : [];
  
  const isProduct = industry && (industry.toLowerCase().includes('landscap') || 
                                 industry.toLowerCase().includes('retail') ||
                                 industry.toLowerCase().includes('product'));
  
  const menuLabel = isProduct ? 'Products' : 'Services';

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
            <a href="#services">{menuLabel} ▼</a>
            <ul className="dropdown-menu">
              {servicesList.map((service, index) => (
                <li key={index}><a href={`#${service.toLowerCase().replace(/\s+/g, '-')}`}>{service}</a></li>
              ))}
            </ul>
          </li>
          <li><a href="#about">About</a></li>
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