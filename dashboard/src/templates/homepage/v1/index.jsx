import React, { useState } from "react";

export default function HomepageV1({ tokens = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const styles = {
    container: {
      fontFamily: "'Roboto', sans-serif",
      margin: 0,
      padding: 0,
      lineHeight: 1.6,
      color: "#3f3f3f",
      overflowX: "hidden"
    },
    nav: {
      background: "white",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      padding: "0.8rem 0",
      position: "fixed",
      width: "100%",
      top: 0,
      zIndex: 1000
    },
    navContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    logo: {
      fontSize: "1.8rem",
      fontWeight: "700",
      color: tokens.primaryColor || "#5DD39E",
      fontFamily: "'Work Sans', sans-serif"
    },
    navLinks: {
      display: isMenuOpen ? "flex" : "flex",
      listStyle: "none",
      gap: "2rem",
      margin: 0,
      padding: 0,
      flexDirection: window.innerWidth <= 768 && isMenuOpen ? "column" : "row",
      position: window.innerWidth <= 768 ? "fixed" : "static",
      top: window.innerWidth <= 768 ? "70px" : "auto",
      left: window.innerWidth <= 768 ? (isMenuOpen ? "0" : "-100%") : "auto",
      width: window.innerWidth <= 768 ? "100%" : "auto",
      height: window.innerWidth <= 768 ? "calc(100vh - 70px)" : "auto",
      background: window.innerWidth <= 768 ? "white" : "transparent",
      alignItems: window.innerWidth <= 768 ? "center" : "center",
      justifyContent: window.innerWidth <= 768 ? "start" : "center",
      paddingTop: window.innerWidth <= 768 ? "2rem" : "0",
      transition: "left 0.3s ease",
      boxShadow: window.innerWidth <= 768 ? "2px 0 5px rgba(0,0,0,0.1)" : "none"
    },
    hamburger: {
      display: window.innerWidth <= 768 ? "block" : "none",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: tokens.primaryColor || "#5DD39E"
    },
    hero: {
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "8rem 2rem 4rem",
      textAlign: "center",
      marginTop: "70px"
    },
    heroH1: {
      fontSize: "3.5rem",
      marginBottom: "1rem",
      color: "#3f3f3f",
      fontFamily: "'Work Sans', sans-serif",
      fontWeight: "700"
    },
    heroP: {
      fontSize: "1.3rem",
      marginBottom: "2rem",
      color: "#666",
      maxWidth: "600px",
      marginLeft: "auto",
      marginRight: "auto"
    },
    ctaButton: {
      background: tokens.primaryColor || "#5DD39E",
      color: "white",
      padding: "1rem 2rem",
      border: "none",
      borderRadius: "5px",
      fontSize: "1.2rem",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
      fontWeight: "600"
    },
    section: {
      padding: "4rem 2rem"
    },
    sectionH2: {
      textAlign: "center",
      fontSize: "2.5rem",
      marginBottom: "3rem",
      color: "#3f3f3f",
      fontFamily: "'Work Sans', sans-serif",
      fontWeight: "600"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "2rem",
      maxWidth: "1200px",
      margin: "0 auto"
    },
    card: {
      textAlign: "center",
      padding: "2rem",
      borderRadius: "8px",
      background: "#f9f9f9",
      transition: "transform 0.3s ease"
    },
    serviceCard: {
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      transition: "transform 0.3s ease"
    },
    serviceImg: {
      width: "100%",
      height: "200px",
      objectFit: "cover"
    },
    footer: {
      background: "#333",
      color: "white",
      textAlign: "center",
      padding: "2rem"
    }
  };

  return (
    <div style={styles.container}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>{tokens.companyName || "Your Practice Name"}</div>
          <button style={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">☰</button>
          <ul style={styles.navLinks}>
            <li><a href="#" style={{ textDecoration: "none", color: "#3f3f3f", fontWeight: "500" }}>Home</a></li>
            <li><a href="#" style={{ textDecoration: "none", color: "#3f3f3f", fontWeight: "500" }}>Services</a></li>
            <li><a href="#" style={{ textDecoration: "none", color: "#3f3f3f", fontWeight: "500" }}>About</a></li>
            <li><a href="#" style={{ textDecoration: "none", color: "#3f3f3f", fontWeight: "500" }}>Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroH1}>{tokens.companyName || "Your Practice Name"}</h1>
        <p style={styles.heroP}>{tokens.tagline || "High-quality care in a welcoming environment—expertise you can trust."}</p>
        <a href="#" style={styles.ctaButton}>Schedule Appointment</a>
      </section>

      {/* Features */}
      <section style={{ ...styles.section, background: "white" }}>
        <h2 style={styles.sectionH2}>Why Choose Us</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🦷</div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem", fontWeight: "600" }}>Expert Care</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>Professional dental care with years of experience and modern techniques.</p>
          </div>
          <div style={styles.card}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏰</div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem", fontWeight: "600" }}>Flexible Hours</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>Convenient scheduling to fit your busy lifestyle and family needs.</p>
          </div>
          <div style={styles.card}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💰</div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem", fontWeight: "600" }}>Affordable Rates</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>Quality dental care at competitive prices with flexible payment options.</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ ...styles.section, background: "#f5f5f5" }}>
        <h2 style={styles.sectionH2}>Our Services</h2>
        <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <div style={styles.serviceCard}>
            <img style={styles.serviceImg} src="https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60" alt="General Dentistry" />
            <div style={{ padding: "1.5rem" }}>
              <h4 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "0.5rem" }}>General Dentistry</h4>
              <p style={{ color: "#666", lineHeight: "1.6" }}>Complete check-ups, cleanings, and preventive treatments for all ages.</p>
            </div>
          </div>
          <div style={styles.serviceCard}>
            <img style={styles.serviceImg} src="https://images.unsplash.com/photo-1600170311833-c2cf5280ce49?w=900&auto=format&fit=crop&q=60" alt="Cosmetic Veneers" />
            <div style={{ padding: "1.5rem" }}>
              <h4 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "0.5rem" }}>Cosmetic Veneers</h4>
              <p style={{ color: "#666", lineHeight: "1.6" }}>Thin, custom-made shells to improve the color, shape, and size of your teeth.</p>
            </div>
          </div>
          <div style={styles.serviceCard}>
            <img style={styles.serviceImg} src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=900&auto=format&fit=crop&q=60" alt="Invisalign" />
            <div style={{ padding: "1.5rem" }}>
              <h4 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "0.5rem" }}>Invisalign®</h4>
              <p style={{ color: "#666", lineHeight: "1.6" }}>Clear aligners to straighten teeth discreetly without traditional braces.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ ...styles.section, background: tokens.secondaryColor || "#EFD5BD" }}>
        <h2 style={styles.sectionH2}>Contact Us</h2>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <h4 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Phone</h4>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>{tokens.phone || "+1 234 567 89"}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Email</h4>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>{tokens.email || "info@yourpractice.com"}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Address</h4>
              <p style={{ fontSize: "1.2rem", color: "#666" }}>{tokens.address || "123 Dental St., City, State ZIP"}</p>
            </div>
          </div>
          <a href="#" style={styles.ctaButton}>Book Appointment</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; 2025 {tokens.companyName || "Your Practice Name"}. All rights reserved.</p>
      </footer>
    </div>
  );
}