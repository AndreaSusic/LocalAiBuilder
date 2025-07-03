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
  
  // Extract hero image URL properly from GBP photos or provided images
  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') {
      return img.url || img.src || null;
    }
    return null;
  };

  const heroImg = getImageUrl(images[0]) || 
                  getImageUrl(google_profile.photos?.[0]) || 
                  'https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  
  // Use AI-generated content or fallbacks
  const heroTitle = ai_customization.heroTitle || 
                   `Welcome to ${company_name || 'Your Business'}`;
  
  const heroSubtitle = ai_customization.heroSubtitle || 
                      `Professional ${services[0]?.toLowerCase() || 'services'} in ${google_profile.address ? google_profile.address.split(',')[1]?.trim() : 'your area'}`;
  
  const ctaText = ai_customization.ctaText || 'Contact Us';
  
  return (
    <section className="hero" style={{ backgroundImage: `url('${heroImg}')` }}>
      <h1 data-gas-edit="heroTitle">{heroTitle}</h1>
      <p data-gas-edit="heroSubtitle">{heroSubtitle}</p>
      <button className="btn-cta" data-gas-edit="ctaText">{ctaText}</button>
    </section>
  );
}