import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function HeroSection() {
  const { company_name = "Your Business", services = [], images = [], google = {} } = useContext(SiteDataContext) || {};
  
  // Image fallback logic
  const heroImg = 
    images[0] ||
    google.photos?.[0] ||
    "https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Hero tagline from first service or fallback
  const heroTagline = services[0] || "High-quality care in a welcoming environment—expertise you can trust.";

  return (
    <section 
      className="hero" 
      style={{
        backgroundImage: `url("${heroImg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <h1>
        {company_name === "Your Business" ? "Title that describes business" : company_name}
      </h1>
      <p>{heroTagline}</p>
      <button className="btn-primary">Schedule Now</button>
    </section>
  );
}