import React, { useState } from 'react';
import HeroSection from '../sections/HeroSection.jsx';
import ServicesSection from '../sections/ServicesSection.jsx';
import AboutSection from '../sections/AboutSection.jsx';
import GallerySection from '../sections/GallerySection.jsx';
import ReviewsSection from '../sections/ReviewsSection.jsx';
import ContactSection from '../sections/ContactSection.jsx';

export default function HomePageV1() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div style={{
      fontFamily: "'Roboto', sans-serif",
      color: '#3f3f3f',
      lineHeight: '1.5',
      margin: 0,
      padding: 0
    }}>
      <style jsx>{`
        :root {
          --primary: #5DD39E;
          --secondary: #EFD5BD;
          --text: #3f3f3f;
          --bg-light: #f9f9f9;
          --bg-dark: #f5f5f5;
          --font-sans: 'Roboto', sans-serif;
          --font-heading: 'Work Sans', sans-serif;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        h1, h2, h3, h4 {
          font-family: 'Work Sans', sans-serif;
          color: var(--text);
        }
        a {
          color: var(--primary);
          text-decoration: none;
        }
        img {
          max-width: 100%;
          display: block;
        }
        
        /* Navigation */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 1rem;
          border-bottom: 1px solid #ddd;
          position: relative;
        }
        .nav a {
          color: #000;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: 'Work Sans', sans-serif;
        }
        .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .nav-links {
          list-style: none;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .nav-links li {
          position: relative;
        }
        .nav-links li:hover > ul {
          display: block;
        }
        .nav-links li > ul {
          display: none;
          position: absolute;
          top: 2.5rem;
          left: 0;
          background: white;
          border: 1px solid #ddd;
          padding: 0.5rem 0;
          min-width: 10rem;
          z-index: 1000;
        }
        .nav-links li > ul li {
          padding: 0.5rem 1rem;
        }
        .nav-links > li > a {
          padding: 0.5rem;
        }
        .contact-phone {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        .cta {
          background: var(--primary);
          color: white !important;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }
        
        /* Hero */
        .hero {
          position: relative;
          background-size: cover;
          background-position: center;
          text-align: center;
          padding: 6rem 1rem;
          color: white;
        }
        .hero::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
        }
        .hero * {
          position: relative;
        }
        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 3.5rem;
          color: white;
        }
        .hero p {
          font-size: 1.1rem;
          margin-bottom: 4.5rem;
        }
        .btn-primary {
          background: var(--secondary);
          color: var(--text);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        /* Location Section */
        .location-section {
          background: #fff;
          padding: 40px 20px;
        }
        .location-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          max-width: 900px;
          gap: 50px;
          margin: 0 auto;
        }
        .location-image {
          flex: 1 1 300px;
        }
        .location-image img {
          width: 100%;
          height: auto;
          border-radius: 10px;
        }
        .location-text {
          flex: 2 1 400px;
        }
        .location-text h2 {
          font-size: 2rem;
          margin-bottom: 16px;
        }
        .location-text p {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 16px;
          color: #444;
        }
        
        /* Features */
        .features {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          background: white;
          padding: 3rem 1rem;
          text-align: center;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .feature {
          flex: 1;
          padding: 1rem;
        }
        .feature .icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          color: var(--primary);
        }
        .feature h3 {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .feature p {
          font-size: 0.95rem;
          color: #555;
        }
        
        /* Services */
        .services {
          background: white;
          padding: 3rem 1rem;
        }
        .services h2 {
          text-align: center;
          font-size: 2.75rem;
          margin-bottom: 3rem;
        }
        .services-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .service-card {
          background: white;
          border-radius: 6px;
          overflow: hidden;
          text-align: center;
        }
        .service-card img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
        }
        .service-card h4 {
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
        }
        .service-card p {
          padding: 0 0.75rem 1rem;
          font-size: 0.9rem;
          color: #555;
        }
        
        /* Testimonials */
        .testimonials {
          background: white;
          padding: 3rem 1rem;
          text-align: center;
        }
        .testimonials h2 {
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .testimonials-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .testimonial {
          background: var(--bg-light);
          border-left: 4px solid var(--primary);
          padding: 1rem;
          border-radius: 4px;
          font-style: italic;
          position: relative;
        }
        .testimonial p {
          margin-bottom: 0.75rem;
        }
        .stars {
          color: gold;
          font-size: 1.1rem;
        }
        
        /* Team */
        .team {
          background: var(--bg-dark);
          padding: 3rem 1rem;
          text-align: center;
        }
        .team h2 {
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .team-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }
        .team-member img {
          border-radius: 50%;
          width: 200px;
          height: 200px;
          object-fit: cover;
          margin: 0 auto 0.5rem;
        }
        .team-member h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .team-member p {
          font-size: 0.9rem;
          color: #555;
        }
        
        /* Gallery */
        .gallery {
          background: white;
          padding: 3rem 1rem;
        }
        .gallery h2 {
          text-align: center;
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .gallery-grid {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }
        .gallery-grid img {
          flex: 0 0 auto;
          width: 200px;
          height: 150px;
          object-fit: cover;
          border-radius: 6px;
        }
        
        /* Contact + Map */
        .contact-form {
          background: var(--bg-light);
          padding: 3rem 1rem;
        }
        .contact-form h2 {
          text-align: center;
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .contact-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr 1fr;
        }
        .contact-grid form {
          display: grid;
          gap: 1rem;
        }
        .contact-grid input,
        .contact-grid textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
        }
        .contact-grid button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        .contact-grid .map-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 4px;
        }
        
        /* Secondary CTA */
        .secondary-cta {
          background: var(--secondary);
          padding: 4rem 1rem;
          text-align: center;
        }
        .secondary-cta h2 {
          font-size: 2.75rem;
          margin-bottom: 2.5rem;
        }
        .secondary-cta p {
          font-size: 1rem;
          margin-bottom: 3rem;
          color: var(--text);
        }
        .btn-accent {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        
        /* Footer */
        footer {
          background: #3f3f3f;
          color: #eee;
          padding: 2rem 1rem;
        }
        .footer-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        footer h4 {
          margin-bottom: 0.75rem;
          font-size: 1rem;
          color: white;
        }
        footer a {
          color: #ccc;
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .footer-social {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-top: 8px;
        }
        .footer-social .icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          border: 1px solid #fff;
          border-radius: 50%;
          justify-content: center;
          align-items: center;
          transition: background .25s, border-color .25s;
        }
        .footer-social .icon svg {
          width: 20px;
          height: 20px;
          fill: #fff;
        }
        .footer-social .icon:hover {
          background: #5DD39E;
          border-color: #5DD39E;
        }
        
        /* Mobile Responsive */
        @media (max-width: 800px) {
          .hamburger {
            display: block;
          }
          .nav-links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #fff;
            border-bottom: 1px solid #ddd;
            z-index: 1000;
          }
          .nav-links.mobile-open {
            display: flex;
          }
          .nav-links li {
            padding: 0.75rem;
            text-align: center;
          }
          .location-content {
            flex-direction: column;
          }
          .features {
            flex-direction: column;
            align-items: stretch;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
          .team-grid {
            display: flex;
            overflow-x: auto;
            gap: 1rem;
            padding-bottom: 0.5rem;
          }
          .team-member {
            flex: 0 0 auto;
            margin-bottom: 0;
          }
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .gallery-grid img {
            width: 150px;
            height: 100px;
          }
        }
        
        /* Inline Editor Styles */
        .editable { 
          cursor: text; 
          position: relative; 
          transition: all 0.2s ease;
        }
        .editable:hover { 
          outline: 2px dotted #ffc000; 
          outline-offset: 2px; 
        }
        .editable:focus { 
          outline: 2px solid #ffc000; 
          outline-offset: 4px; 
        }
        .editable::after {
          content: '';
          position: absolute;
          left: 0; 
          bottom: -4px;
          width: 10px; 
          height: 3px;
          background: #ffc000;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .editable:hover::after {
          opacity: 1;
        }
      `}</style>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      
      {/* Navigation */}
      <nav className="nav">
        <div className="logo">YourLogo</div>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">☰</button>
        <ul className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <li><a href="#">Home</a></li>
          <li>
            <a href="#">Services ▾</a>
            <ul>
              <li><a href="#">General Dentistry</a></li>
              <li><a href="#">Cosmetic Veneers</a></li>
              <li><a href="#">Invisalign®</a></li>
            </ul>
          </li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="tel:+123456789" className="contact-phone">📞 +1 234 567 89</a></li>
          <li><a href="#" className="cta">Contact Us</a></li>
        </ul>
      </nav>

      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ReviewsSection />
      <GallerySection />
      <ContactSection />
    </div>
  );
}