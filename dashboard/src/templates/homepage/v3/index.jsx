import React, { useState } from "react";

export default function HomepageV3({ tokens = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", margin: 0, padding: 0, lineHeight: 1.6, color: "#2c3e50" }}>
      {/* Header */}
      <header style={{ 
        position: "fixed", 
        top: 0, 
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)", 
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e1e8ed", 
        zIndex: 1000,
        padding: "15px 0"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "0 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ 
            fontSize: "28px", 
            fontWeight: "800", 
            background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            {tokens.companyName || "Your Practice Name"}
          </div>
          
          {/* Desktop Navigation */}
          <nav style={{ display: "flex", gap: "40px", alignItems: "center" }} className="desktop-nav">
            <a href="#home" style={{ textDecoration: "none", color: "#2c3e50", fontWeight: "600", fontSize: "16px" }}>Home</a>
            <a href="#services" style={{ textDecoration: "none", color: "#2c3e50", fontWeight: "600", fontSize: "16px" }}>Services</a>
            <a href="#about" style={{ textDecoration: "none", color: "#2c3e50", fontWeight: "600", fontSize: "16px" }}>About</a>
            <a href="#contact" style={{ textDecoration: "none", color: "#2c3e50", fontWeight: "600", fontSize: "16px" }}>Contact</a>
            <a href="tel:+123456789" style={{ textDecoration: "none", color: "#2c3e50", fontWeight: "600", fontSize: "16px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📞 +1 234 567 89
            </a>
            <a href="#" style={{ 
              textDecoration: "none", 
              background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
              color: "white", 
              padding: "12px 24px", 
              borderRadius: "25px", 
              fontWeight: "600",
              fontSize: "16px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}>
              Contact Us
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            style={{ 
              display: "none", 
              background: "none", 
              border: "none", 
              fontSize: "28px", 
              cursor: "pointer",
              color: "#2c3e50"
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
            backgroundColor: "rgba(255, 255, 255, 0.98)", 
            padding: "20px",
            borderTop: "1px solid #e1e8ed",
            backdropFilter: "blur(10px)"
          }}
          className="mobile-nav"
        >
          <a href="#home" style={{ display: "block", padding: "15px 0", textDecoration: "none", color: "#2c3e50", fontWeight: "600" }}>Home</a>
          <a href="#services" style={{ display: "block", padding: "15px 0", textDecoration: "none", color: "#2c3e50", fontWeight: "600" }}>Services</a>
          <a href="#about" style={{ display: "block", padding: "15px 0", textDecoration: "none", color: "#2c3e50", fontWeight: "600" }}>About</a>
          <a href="#contact" style={{ display: "block", padding: "15px 0", textDecoration: "none", color: "#2c3e50", fontWeight: "600" }}>Contact</a>
          <a href="tel:+123456789" style={{ display: "block", padding: "15px 0", textDecoration: "none", color: "#2c3e50", fontWeight: "600" }}>📞 +1 234 567 89</a>
          <a href="#" style={{ 
            display: "block", 
            padding: "15px 0", 
            textDecoration: "none", 
            background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
            color: "white", 
            fontWeight: "600",
            textAlign: "center",
            borderRadius: "25px",
            margin: "10px 0"
          }}>
            Schedule now
          </a>
        </nav>
      </header>

      {/* Hero Section - Version 3 Style */}
      <section style={{ 
        background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
        padding: "120px 0 100px",
        textAlign: "center",
        color: "#fff",
        marginTop: "80px"
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ 
            fontSize: "4rem", 
            marginBottom: "25px", 
            fontWeight: "900",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Version 3 Template
          </h1>
          <p style={{ 
            fontSize: "1.5rem", 
            marginBottom: "50px", 
            opacity: 0.95,
            maxWidth: "700px",
            margin: "0 auto 50px",
            fontWeight: "300"
          }}>
            {tokens.tagline || "Next-generation design with cutting-edge features—innovation you can trust."}
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ 
              backgroundColor: "#fff", 
              color: tokens.primaryColor || "#667eea", 
              padding: "18px 45px", 
              border: "none", 
              borderRadius: "50px", 
              fontSize: "1.2rem", 
              cursor: "pointer",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease"
            }}>
              Get Started
            </button>
            <button style={{ 
              backgroundColor: "transparent", 
              color: "#fff", 
              padding: "18px 45px", 
              border: "2px solid #fff", 
              borderRadius: "50px", 
              fontSize: "1.2rem", 
              cursor: "pointer",
              fontWeight: "700",
              transition: "all 0.3s ease"
            }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "100px 0", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ 
            textAlign: "center", 
            fontSize: "3rem", 
            marginBottom: "20px",
            color: "#2c3e50",
            fontWeight: "800"
          }}>
            Premium Services
          </h2>
          <p style={{ 
            textAlign: "center", 
            fontSize: "1.3rem", 
            marginBottom: "80px",
            color: "#64748b",
            maxWidth: "600px",
            margin: "0 auto 80px"
          }}>
            Experience excellence with our comprehensive range of professional services
          </p>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
            gap: "50px" 
          }}>
            <div style={{ 
              textAlign: "center", 
              padding: "40px 30px", 
              borderRadius: "20px", 
              backgroundColor: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              transition: "transform 0.3s ease"
            }}>
              <div style={{ 
                fontSize: "4rem", 
                marginBottom: "25px",
                background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>🦷</div>
              <h3 style={{ fontSize: "1.6rem", marginBottom: "20px", color: "#2c3e50", fontWeight: "700" }}>General Dentistry</h3>
              <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "1.1rem" }}>
                Comprehensive dental care for the whole family with state-of-the-art techniques and equipment for optimal oral health.
              </p>
            </div>
            <div style={{ 
              textAlign: "center", 
              padding: "40px 30px", 
              borderRadius: "20px", 
              backgroundColor: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              transition: "transform 0.3s ease"
            }}>
              <div style={{ 
                fontSize: "4rem", 
                marginBottom: "25px",
                background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>✨</div>
              <h3 style={{ fontSize: "1.6rem", marginBottom: "20px", color: "#2c3e50", fontWeight: "700" }}>Cosmetic Dentistry</h3>
              <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "1.1rem" }}>
                Transform your smile with our advanced cosmetic dental procedures and cutting-edge treatments for stunning results.
              </p>
            </div>
            <div style={{ 
              textAlign: "center", 
              padding: "40px 30px", 
              borderRadius: "20px", 
              backgroundColor: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              transition: "transform 0.3s ease"
            }}>
              <div style={{ 
                fontSize: "4rem", 
                marginBottom: "25px",
                background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>🚑</div>
              <h3 style={{ fontSize: "1.6rem", marginBottom: "20px", color: "#2c3e50", fontWeight: "700" }}>Emergency Care</h3>
              <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "1.1rem" }}>
                24/7 emergency dental services for urgent dental care when you need it most with immediate professional attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ 
        padding: "100px 0", 
        background: `linear-gradient(135deg, ${tokens.primaryColor || "#667eea"}, ${tokens.secondaryColor || "#764ba2"})`,
        color: "#fff"
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "3rem", marginBottom: "25px", fontWeight: "800" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: "1.3rem", marginBottom: "60px", opacity: 0.95, fontWeight: "300" }}>
            Schedule your appointment today and experience the difference
          </p>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "40px",
            marginBottom: "60px",
            textAlign: "left"
          }}>
            <div style={{ 
              backgroundColor: "rgba(255,255,255,0.1)", 
              padding: "30px", 
              borderRadius: "15px",
              backdropFilter: "blur(10px)"
            }}>
              <h4 style={{ marginBottom: "15px", fontSize: "1.3rem", fontWeight: "700" }}>📞 Phone</h4>
              <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>{tokens.phone || "+1 234 567 89"}</p>
            </div>
            <div style={{ 
              backgroundColor: "rgba(255,255,255,0.1)", 
              padding: "30px", 
              borderRadius: "15px",
              backdropFilter: "blur(10px)"
            }}>
              <h4 style={{ marginBottom: "15px", fontSize: "1.3rem", fontWeight: "700" }}>📧 Email</h4>
              <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>{tokens.email || "info@yourpractice.com"}</p>
            </div>
            <div style={{ 
              backgroundColor: "rgba(255,255,255,0.1)", 
              padding: "30px", 
              borderRadius: "15px",
              backdropFilter: "blur(10px)"
            }}>
              <h4 style={{ marginBottom: "15px", fontSize: "1.3rem", fontWeight: "700" }}>📍 Address</h4>
              <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>{tokens.address || "123 Dental St., City, State ZIP"}</p>
            </div>
          </div>
          <button style={{ 
            backgroundColor: "#fff", 
            color: tokens.primaryColor || "#667eea", 
            padding: "18px 50px", 
            border: "none", 
            borderRadius: "50px", 
            fontSize: "1.2rem", 
            cursor: "pointer",
            fontWeight: "700",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease"
          }}>
            Book Your Appointment
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