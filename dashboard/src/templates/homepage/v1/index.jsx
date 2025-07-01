import React, { useState, useEffect } from 'react';
import { SiteDataContext } from '../../../context/SiteDataContext';
import { 
  NavigationSection,
  HeroSection, 
  ServicesSection, 
  AboutSection, 
  GallerySection, 
  ReviewsSection, 
  ContactSection 
} from '../../../sections';
import '../../../styles/template.css';

export default function HomepageV1({ tokens = {}, bootstrap = null }) {
  const [data, setData] = useState(bootstrap || {
    company_name: tokens.businessName || 'Your Business Name',
    city: tokens.location ? [tokens.location] : ['Your City'],
    services: tokens.services || 'Your Services',
    colours: tokens.primaryColor ? [tokens.primaryColor, tokens.secondaryColor || '#000000'] : ['#5DD39E', '#000000'],
    industry: tokens.industry || 'Your Industry',
    images: tokens.images || [],
    google_profile: tokens.google || {}
  });

  // Load demo data if no bootstrap provided
  useEffect(() => {
    if (!bootstrap || Object.keys(bootstrap).length === 0) {
      fetch('/api/user-data', { credentials: 'include' })
        .then(response => response.json())
        .then(userData => {
          console.log('Template loaded demo data:', userData);
          setData(userData);
        })
        .catch(error => {
          console.log('Template using fallback data:', error);
        });
    }
  }, [bootstrap]);
  
  console.log('HomepageV1 using data:', data);

  return (
    <SiteDataContext.Provider value={data}>
      <div>
        <style>{`
          :root {
            --primary: ${data.colours?.[0] || '#5DD39E'};
            --secondary: ${data.colours?.[1] || '#EFD5BD'};
          }
        `}</style>
        <NavigationSection />
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <GallerySection />
        <ReviewsSection />
        <ContactSection />
      </div>
    </SiteDataContext.Provider>
  );
}