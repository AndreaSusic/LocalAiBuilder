import React from 'react';
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
  // Use bootstrap data if available, otherwise use tokens
  const data = bootstrap || {
    company_name: tokens.businessName || 'Your Business Name',
    city: tokens.location ? [tokens.location] : ['Your City'],
    services: tokens.services || 'Your Services',
    colours: tokens.primaryColor ? [tokens.primaryColor, tokens.secondaryColor || '#000000'] : ['#5DD39E', '#000000'],
    industry: tokens.industry || 'Your Industry',
    images: tokens.images || [],
    google: tokens.google || {}
  };
  
  console.log('HomepageV1 received bootstrap data:', data);

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