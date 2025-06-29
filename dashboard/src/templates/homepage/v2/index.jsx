import React, { useState } from "react";

export default function HomepageV2({ tokens = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", margin: 0, padding: 0, lineHeight: 1.6, color: "#333" }}>
      {/* Header */}
      <header style={{ 
        position: "sticky", 
        top: 0, 
        backgroundColor: "#fff", 
        borderBottom: "1px solid #e0e0e0", 
        zIndex: 1000,
        padding: "10px 0"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "0 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: tokens.primaryColor || "#5DD39E" }}>
            {tokens.companyName || "Your Practice Name"}
          </div>
          
          {/* Desktop Navigation */}
          <nav style={{ display: "flex", gap: "30px", alignItems: "center" }} className="desktop-nav">
            <a href="#home" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Home</a>
            <a href="#services" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Services</a>
            <a href="#about" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>About</a>
            <a href="#contact" style={{ textDecoration: "none", color: "#333", fontWeight: "500" }}>Contact</a>
            <a href="tel:+123456789" style={{ textDecoration: "none", color: "#333", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📞 +1 234 567 89
            </a>
            <a href="#" style={{ 
              textDecoration: "none", 
              backgroundColor: tokens.primaryColor || "#5DD39E", 
              color: "white", 
              padding: "0.5rem 1.25rem", 
              borderRadius: "4px", 
              fontWeight: "500" 
            }}>
              Schedule now
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            style={{ 
              display: "none", 
              background: "none", 
              border: "none", 
              fontSize: "24px", 
              cursor: "pointer" 
            }}
            className="mobile-menu-btn"
            onClick={toggleMenu}
          >
            ☰
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav 
          style={{ 
            display: isMenuOpen ? "block" : "none", 
            backgroundColor: "#f8f9fa", 
            padding: "20px",
            borderTop: "1px solid #e0e0e0"
          }}
          className="mobile-nav"
        >
          <a href="#home" style={{ display: "block", padding: "10px 0", textDecoration: "none", color: "#333" }}>Home</a>
          <a href="#services" style={{ display: "block", padding: "10px 0", textDecoration: "none", color: "#333" }}>Services</a>
          <a href="#about" style={{ display: "block", padding: "10px 0", textDecoration: "none", color: "#333" }}>About</a>
          <a href="#contact" style={{ display: "block", padding: "10px 0", textDecoration: "none", color: "#333" }}>Contact</a>
          <a href="tel:+123456789" style={{ display: "block", padding: "10px 0", textDecoration: "none", color: "#333" }}>📞 +1 234 567 89</a>
          <a href="#" style={{ 
            display: "block", 
            padding: "12px 0", 
            textDecoration: "none", 
            backgroundColor: tokens.primaryColor || "#5DD39E", 
            color: "white", 
            textAlign: "center", 
            borderRadius: "4px", 
            fontWeight: "500",
            margin: "10px 0"
          }}>
            Schedule now
          </a>
        </nav>
      </header>

      {/* Hero Section - Version 2 Style */}
      <section style={{ 
        backgroundColor: "#f8f9fa",
        padding: "80px 0",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            marginBottom: "20px", 
            color: tokens.primaryColor || "#5DD39E",
            fontWeight: "700"
          }}>
            Version 2 Template
          </h1>
          <p style={{ 
            fontSize: "1.4rem", 
            marginBottom: "40px", 
            color: "#666",
            maxWidth: "600px",
            margin: "0 auto 40px"
          }}>
            {tokens.tagline || "Modern design with enhanced functionality—expertise you can trust."}
          </p>
          <button style={{ 
            backgroundColor: tokens.primaryColor || "#5DD39E", 
            color: "#fff", 
            padding: "15px 40px", 
            border: "none", 
            borderRadius: "8px", 
            fontSize: "1.1rem", 
            cursor: "pointer",
            fontWeight: "600",
            transition: "background-color 0.3s"
          }}>
            Get Started Today
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 0", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ 
            textAlign: "center", 
            fontSize: "2.5rem", 
            marginBottom: "60px",
            color: "#333"
          }}>
            Our Services
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "40px" 
          }}>
            <div style={{ textAlign: "center", padding: "30px", borderRadius: "12px", backgroundColor: "#f8f9fa" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🦷</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#333" }}>General Dentistry</h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Comprehensive dental care for the whole family with modern techniques and equipment.
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "30px", borderRadius: "12px", backgroundColor: "#f8f9fa" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✨</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#333" }}>Cosmetic Dentistry</h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Transform your smile with our advanced cosmetic dental procedures and treatments.
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "30px", borderRadius: "12px", backgroundColor: "#f8f9fa" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🚑</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#333" }}>Emergency Care</h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                24/7 emergency dental services for urgent dental care when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ 
        padding: "80px 0", 
        backgroundColor: tokens.secondaryColor || "#EFD5BD" 
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "40px", color: "#333" }}>
            Schedule Your Appointment
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "30px",
            marginBottom: "40px"
          }}>
            <div>
              <h4 style={{ marginBottom: "10px", color: "#333" }}>Phone</h4>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>{tokens.phone || "+1 234 567 89"}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: "10px", color: "#333" }}>Email</h4>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>{tokens.email || "info@yourpractice.com"}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: "10px", color: "#333" }}>Address</h4>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>{tokens.address || "123 Dental St., City, State ZIP"}</p>
            </div>
          </div>
          <button style={{ 
            backgroundColor: tokens.primaryColor || "#5DD39E", 
            color: "#fff", 
            padding: "15px 40px", 
            border: "none", 
            borderRadius: "8px", 
            fontSize: "1.1rem", 
            cursor: "pointer",
            fontWeight: "600"
          }}>
            Book Appointment
          </button>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}