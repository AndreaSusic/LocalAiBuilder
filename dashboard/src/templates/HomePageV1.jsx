// dashboard/src/templates/homepage/v1/HomePageV1.jsx
import React, { useState } from "react";
import { SiteDataContext } from "../context/SiteDataContext.js"; // <- adjust path if needed
import { SiteDataProvider } from "../../context/SiteDataProvider.jsx"; // <- new undo/redo provider

// Sections
import HeroSection from "../sections/HeroSection.jsx";
import ServicesSection from "../sections/ServicesSection.jsx";
import AboutSection from "../sections/AboutSection.jsx";
import GallerySection from "../sections/GallerySection.jsx";
import ReviewsSection from "../sections/ReviewsSection.jsx";
import ContactSection from "../sections/ContactSection.jsx";
import UndoRedoMessageHandler from "../../components/UndoRedoMessageHandler.jsx";

export default function HomePageV1({ bootstrap = {} }) {
  /* ------------------------------------------------------------------
     1️⃣  NORMALISE incoming data just once
  ------------------------------------------------------------------ */
  const processed = {
    ...bootstrap,
    services: Array.isArray(bootstrap.services)
      ? bootstrap.services
      : bootstrap.services
        ? [bootstrap.services]
        : [],
  };
  console.log("🏗️ HomePageV1 > processed data:", processed);

  /* ------------------------------------------------------------------
     2️⃣  Local UI state (hamburger)
  ------------------------------------------------------------------ */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  /* ------------------------------------------------------------------
     3️⃣  RENDER — wrap everything in the context provider
  ------------------------------------------------------------------ */
  return (
    <SiteDataProvider initialData={processed}>
      <div
        style={{
          fontFamily: "'Roboto', sans-serif",
          color: "#3f3f3f",
          lineHeight: "1.5",
          margin: 0,
          padding: 0,
        }}
      >
        {/* ------------ Global CSS (kept from your original) ------------ */}
        <style>{`
          :root {
            --primary: ${processed.colours?.[0] || "#5DD39E"};
            --secondary:${processed.colours?.[1] || "#EFD5BD"};
            --text:#3f3f3f;
            --bg-light:#f9f9f9;
            --bg-dark:#f5f5f5;
          }
          *{box-sizing:border-box;margin:0;padding:0;}
          h1,h2,h3,h4{font-family:'Work Sans',sans-serif;color:var(--text);}
          a{color:var(--primary);text-decoration:none;}
          img{max-width:100%;display:block;}
          /* …(keep or trim the rest of your CSS here)… */
        `}</style>

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700&family=Roboto:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* -------------------- Navigation -------------------- */}
        <nav className="nav">
          <div className="logo">{processed.company_name || "YourLogo"}</div>
          <button
            className="hamburger"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Example static links – you can keep or generate from data */}
          <ul className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Services ▾</a>
              {/* If you want dynamic dropdown, map processed.services here */}
              <ul>
                {processed.services.map((srv, i) => (
                  <li key={i}>
                    <a href="#services">{srv}</a>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            {processed.contact?.phone && (
              <li>
                <a
                  href={`tel:${processed.contact.phone}`}
                  className="contact-phone"
                >
                  📞 {processed.contact.phone}
                </a>
              </li>
            )}
            <li>
              <a href="#contact" className="cta">
                Contact Us
              </a>
            </li>
          </ul>
        </nav>

        {/* -------------------- Page Sections -------------------- */}
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ReviewsSection />
        <GallerySection />
        <ContactSection />
        
        {/* Message handler for undo/redo communication with dashboard */}
        <UndoRedoMessageHandler />
      </div>
    </SiteDataProvider>
  );
}
