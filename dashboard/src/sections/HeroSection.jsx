import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';
// import { getStockImages } from '../../../stock.js'; // Removed to fix import in browser

export default function HeroSection() {
  const { 
    company_name, 
    services = [], 
    images = [], 
    google_profile = {},
    ai_customization = {} 
  } = useContext(SiteDataContext) || {};
  
  // Use images in priority order: user uploaded, GBP photos, stock images
  const heroImg = images[0] || 
                  google_profile.photos?.[0] || 
                  'https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  
  // Use AI-generated content or fallbacks
  const heroTitle = ai_customization.heroTitle || 
                   `Welcome to ${company_name || 'Your Business'}`;
  
  const heroSubtitle = ai_customization.heroSubtitle || 
                      `Professional ${services[0]?.toLowerCase() || 'services'} in ${google_profile.address ? google_profile.address.split(',')[1]?.trim() : 'your area'}`;
  
  const ctaText = ai_customization.ctaText || 'Schedule Now';
  
  return (
    <section className="hero" style={{ backgroundImage: `url('${heroImg}')` }}>
      <h1>{heroTitle}</h1>
      <p>{heroSubtitle}</p>
      <button className="btn-primary">{ctaText}</button>
    </section>
  );
}