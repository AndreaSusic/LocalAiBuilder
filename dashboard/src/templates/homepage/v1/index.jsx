import React, { useState, useEffect } from 'react';
// import { validateBeforeRender } from '../../../utils/dataValidation.js';

console.log('🕵️‍♀️ HomepageV1 module evaluated');
import NavigationSection from '../../../sections/NavigationSection.jsx';
import HeroSection from '../../../sections/HeroSection.jsx';
import ServicesSection from '../../../sections/ServicesSection.jsx';
import AboutSection from '../../../sections/AboutSection.jsx';
import GallerySection from '../../../sections/GallerySection.jsx';
import ReviewsSection from '../../../sections/ReviewsSection.jsx';
import ContactSection from '../../../sections/ContactSection.jsx';
import ColorContrastAnalyzer from '../../../components/ColorContrastAnalyzer.jsx';
import { SiteDataContext } from '../../../context/SiteDataContext.js';
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

export default function HomepageV1({ tokens = {}, bootstrap = null }) {
  console.log('🚀 HomepageV1 function started, bootstrap:', !!bootstrap);
  console.log('🔍 Bootstrap data preview:', bootstrap?.company_name || 'No company name');
  
  try {
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
        .then(apiResponse => {
          console.log('Template loaded demo data:', apiResponse);
          const userData = apiResponse.bootstrap || apiResponse;
          
          // Run data validation before setting data
          // try {
          //   validateBeforeRender(userData);
            setData(userData);
          // } catch (validationError) {
          //   console.error('Data validation failed:', validationError);
          //   // Use only safe fallback data if validation fails
          //   setData(initialData);
          // }
        })
        .catch(error => {
          console.log('Template using fallback data:', error);
          setData(initialData);
        });
    } else {
      // Process bootstrap data to ensure correct format
      const processedBootstrap = {
        ...bootstrap,
        // Convert services string to array if needed
        services: typeof bootstrap.services === 'string' 
          ? [bootstrap.services] 
          : (Array.isArray(bootstrap.services) ? bootstrap.services : []),
        // Fix industry to match services when it's landscaping but services are septic tanks
        industry: bootstrap.services === 'Septic Tanks' ? 'Septic Tanks' : bootstrap.industry
      };
      
      console.log('🔧 Processed bootstrap data:', {
        company_name: processedBootstrap.company_name,
        services: processedBootstrap.services,
        industry: processedBootstrap.industry
      });
      
      setData(processedBootstrap);
    }
  }, [bootstrap]);

  // Initialize editor bridge after React components have rendered
  useEffect(() => {
    // Signal that React DOM is ready for editor bridge
    const reactReadyEvent = new CustomEvent('react-dom-ready', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(reactReadyEvent);
    console.log('✅ React DOM ready event dispatched');
  }, [data]); // Re-run when data changes
  
  console.log('HomepageV1 using data:', data);

    console.log('🏠 HomepageV1 rendering with data:', Object.keys(data));
    
    return (
      <SiteDataContext.Provider value={{...data, safeImg}}>
        <div>
          <style>{`
            :root {
              --primary: ${data.colours?.[0] || '#5DD39E'};
              --secondary: ${data.colours?.[1] || '#EFD5BD'};
            }
          `}</style>
          <NavigationSection bootstrap={bootstrap} />
          {console.log('🔥 About to render HeroSection')}
          <HeroSection bootstrap={bootstrap} />
          {console.log('🔥 HeroSection rendered, moving to ServicesSection')}
          <ServicesSection bootstrap={bootstrap} />
          <AboutSection bootstrap={bootstrap} />
          <GallerySection bootstrap={bootstrap} />
          <ReviewsSection bootstrap={bootstrap} />
          <ContactSection bootstrap={bootstrap} />
          
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
    
  } catch (error) {
    console.error('🔥 HomepageV1 render error:', error);
    return (
      <div style={{ padding: '20px', background: '#f0f0f0' }}>
        <h1 style={{ color: 'red' }}>HomepageV1 Error</h1>
        <p>Error: {error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}