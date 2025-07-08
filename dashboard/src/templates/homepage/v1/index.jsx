import React, { useState } from 'react';
import { SiteDataContext } from '../../../context/SiteDataContext.js';
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
  // Handle non-string values
  if (!url || typeof url !== 'string') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  // Allow all valid HTTP/HTTPS URLs, including Google Maps API
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Only use placeholder for actual placeholder URLs or invalid formats
  if (url.includes('placeholder')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }
  
  return url;
};

export default function HomepageV1({ bootstrap = {} }) {
  const [showContrastAnalyzer, setShowContrastAnalyzer] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ---------- one-time normalisation ---------- */
  const processed = {
    ...bootstrap,
    services: Array.isArray(bootstrap.services)
      ? bootstrap.services
      : bootstrap.services
      ? [bootstrap.services]
      : [],
  };
  console.log('🏗️  HomepageV1 provider data:', processed);

  /* ---------- UI ---------- */
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    /* PROVIDER WRAPS EVERYTHING */
    <SiteDataContext.Provider value={processed}>
      <div
        style={{
          fontFamily: "'Roboto', sans-serif",
          color: '#3f3f3f',
          lineHeight: '1.5',
          margin: 0,
          padding: 0,
        }}
      >
        <style>{`
          :root {
            --primary: ${processed.colours?.[0] || '#5DD39E'};
            --secondary: ${processed.colours?.[1] || '#EFD5BD'};
          }
        `}</style>

        <NavigationSection />
        
        {/* sections now pick up data from context */}
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ReviewsSection />
        <GallerySection />
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