import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';
import { getStockImages } from '../../../stock.js';

export default function HeroSection() {
  const { company_name, services = [], images = [], google = {} } = useContext(SiteDataContext) || {};
  
  const heroImg = images[0] || 
                  google.photos?.[0] || 
                  'https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  
  const heroTagline = services[0] || 'High-quality care in a welcoming environment—expertise you can trust.';
  
  return (
    <section className="hero" style={{ backgroundImage: `url('${heroImg}')` }}>
      <h1>{company_name || 'Your Practice Name'}</h1>
      <p>{heroTagline}</p>
      <button className="btn-primary">Schedule Now</button>
    </section>
  );
}