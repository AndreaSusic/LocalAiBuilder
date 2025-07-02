import React, { useState, useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext.js';

export default function NavigationSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { company_name, services, industry, google = {} } = useContext(SiteDataContext) || {};
  
  const phone = google.phone || '+1 (555) 123-4567';
  
  // Parse services to extract individual products/services
  let servicesList = [];
  if (Array.isArray(services)) {
    servicesList = services;
  } else if (typeof services === 'string' && services.length > 0) {
    // For grass/sod landscaping, look for specific grass types mentioned or extract from context
    if (industry && industry.toLowerCase().includes('landscap') && 
        (services.toLowerCase().includes('grass') || services.toLowerCase().includes('sod'))) {
      const grassTypes = [];
      const lowerServices = services.toLowerCase();
      
      // Check for explicit mentions
      if (lowerServices.includes('bermuda')) grassTypes.push('Bermuda Grass');
      if (lowerServices.includes('zoysia')) grassTypes.push('Zoysia Grass');
      if (lowerServices.includes('st. august') || lowerServices.includes('st august')) grassTypes.push('St. Augustine Grass');
      if (lowerServices.includes('buffalo')) grassTypes.push('Buffalo Grass');
      
      // If no specific types found but it's a general sod producer, add common Texas grasses
      if (grassTypes.length === 0 && (lowerServices.includes('sod') || lowerServices.includes('grass'))) {
        grassTypes.push('Bermuda Grass', 'Zoysia Grass');
      }
      
      servicesList = grassTypes.length > 0 ? grassTypes : [services];
    } else {
      // For other industries, split by common delimiters
      servicesList = services.split(/[,&+]/).map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  
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