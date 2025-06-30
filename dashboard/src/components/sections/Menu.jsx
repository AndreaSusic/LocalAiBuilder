import React, { useState, useEffect } from "react";

export default function Menu({ tokens = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Reset menu state when component mounts
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "white",
      padding: "1rem",
      borderBottom: "1px solid #ddd",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "var(--primary)"
      }}>
        {tokens.companyName || "YourPractice"}
      </div>
      
      <button 
        style={{
          display: "none",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer"
        }}
        className="hamburger"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      
      <ul style={{
        listStyle: "none",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        margin: 0,
        padding: 0
      }} className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
        <li><a href="/" style={{ textDecoration: "none", color: "#000", padding: "0.5rem" }}>Home</a></li>
        <li style={{ position: "relative" }}>
          <a href="#" style={{ textDecoration: "none", color: "#000", padding: "0.5rem" }}>Services ▾</a>
          <ul style={{
            display: "none",
            position: "absolute",
            top: "2.5rem",
            left: 0,
            background: "white",
            border: "1px solid #ddd",
            padding: "0.5rem 0",
            minWidth: "10rem",
            listStyle: "none",
            margin: 0
          }} className="dropdown">
            <li style={{ padding: "0.5rem 1rem" }}>
              <a href="#" style={{ textDecoration: "none", color: "#000" }}>General Dentistry</a>
            </li>
            <li style={{ padding: "0.5rem 1rem" }}>
              <a href="#" style={{ textDecoration: "none", color: "#000" }}>Cosmetic Veneers</a>
            </li>
            <li style={{ padding: "0.5rem 1rem" }}>
              <a href="/templates/service/v1/index.jsx" style={{ textDecoration: "none", color: "#000" }}>Invisalign®</a>
            </li>
          </ul>
        </li>
        <li><a href="#" style={{ textDecoration: "none", color: "#000", padding: "0.5rem" }}>About</a></li>
        <li><a href="#" style={{ textDecoration: "none", color: "#000", padding: "0.5rem" }}>Contact</a></li>
        <li>
          <a href="tel:+123456789" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: "500",
            textDecoration: "none",
            color: "#000"
          }}>
            📞 +1 234 567 89
          </a>
        </li>
        <li>
          <a href="#" style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: "4px",
            fontWeight: "500",
            textDecoration: "none"
          }}>
            Schedule now
          </a>
        </li>
      </ul>

      <style>{`
        .nav-links li:hover > .dropdown {
          display: block;
        }
        
        @media (max-width: 800px) {
          .hamburger {
            display: block !important;
          }
          .nav-links {
            display: none !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #fff;
            border-bottom: 1px solid #ddd;
            padding: 1rem 0;
          }
          .nav-links.mobile-open {
            display: flex !important;
          }
          .nav-links li {
            padding: 0.75rem;
            text-align: center;
          }
          .nav-links .dropdown {
            position: static !important;
            display: none !important;
            border: none !important;
            background: white !important;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
}