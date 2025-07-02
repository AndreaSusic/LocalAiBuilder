import React, { useState, useEffect } from 'react';
import { SiteDataContext } from '../../../context/SiteDataContext';
import { validateBeforeRender } from '../../../utils/dataValidation.js';
import NavigationSection from '../../../sections/NavigationSection.jsx';
import HeroSection from '../../../sections/HeroSection.jsx';
import ServicesSection from '../../../sections/ServicesSection.jsx';
import AboutSection from '../../../sections/AboutSection.jsx';
import GallerySection from '../../../sections/GallerySection.jsx';
import ReviewsSection from '../../../sections/ReviewsSection.jsx';
import ContactSection from '../../../sections/ContactSection.jsx';
import ColorContrastAnalyzer from '../../../components/ColorContrastAnalyzer.jsx';
import '../../../styles/template.css';

// Helper function to handle placeholder images
const safeImg = (url) => {
  if (!url || url.includes('placeholder') || !url.startsWith('http')) {
    // Return a data URL for a simple gray placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  return url;
};

export default function HomepageV1({ tokens = {}, bootstrap = null }) {
  const initialData = bootstrap || {
    company_name: tokens.businessName || 'Your Business Name',
    city: tokens.location ? [tokens.location] : ['Your City'],
    services: tokens.services || 'Your Services',
    colours: tokens.primaryColor ? [tokens.primaryColor, tokens.secondaryColor || '#000000'] : ['#5DD39E', '#000000'],
    industry: tokens.industry || 'Your Industry',
    images: tokens.images || [],
    google_profile: tokens.google || {}
  };
  
  const [data, setData] = useState(initialData);
  const [showContrastAnalyzer, setShowContrastAnalyzer] = useState(false);

  // Load demo data if no bootstrap provided
  useEffect(() => {
    if (!bootstrap || Object.keys(bootstrap).length === 0) {
      fetch('/api/user-data', { credentials: 'include' })
        .then(response => response.json())
        .then(userData => {
          console.log('Template loaded demo data:', userData);
          
          // Run data validation before setting data
          try {
            validateBeforeRender(userData);
            setData(userData);
          } catch (validationError) {
            console.error('Data validation failed:', validationError);
            // Use only safe fallback data if validation fails
            setData(initialData);
          }
        })
        .catch(error => {
          console.log('Template using fallback data:', error);
          setData(initialData);
        });
    } else {
      // Validate bootstrap data as well
      try {
        validateBeforeRender(bootstrap);
        setData(bootstrap);
      } catch (validationError) {
        console.error('Bootstrap data validation failed:', validationError);
        setData(initialData);
      }
    }
  }, [bootstrap]);
  
  console.log('HomepageV1 using data:', data);

  return (
    <SiteDataContext.Provider value={{...data, safeImg}}>
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
        
        {/* Floating Color Contrast Analyzer Button */}
        <button
          onClick={() => setShowContrastAnalyzer(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
          title="Check Color Accessibility"
        >
          🎨
        </button>
        
        {/* Color Contrast Analyzer Modal */}
        <ColorContrastAnalyzer 
          isVisible={showContrastAnalyzer}
          onClose={() => setShowContrastAnalyzer(false)}
        />
      </div>
    </SiteDataContext.Provider>
  );
}