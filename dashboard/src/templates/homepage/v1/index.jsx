import React, { useState, useEffect } from 'react';
import { SiteDataContext } from '../../../context/SiteDataContext';
import NavigationSection from '../../../sections/NavigationSection.jsx';
import HeroSection from '../../../sections/HeroSection.jsx';
import ServicesSection from '../../../sections/ServicesSection.jsx';
import AboutSection from '../../../sections/AboutSection.jsx';
import GallerySection from '../../../sections/GallerySection.jsx';
import ReviewsSection from '../../../sections/ReviewsSection.jsx';
import ContactSection from '../../../sections/ContactSection.jsx';
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
    <SiteDataContext.Provider value={{...data, safeImg}}>
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <style>{`
          :root {
            --primary: ${data.colours?.[0] || '#5DD39E'};
            --secondary: ${data.colours?.[1] || '#EFD5BD'};
          }
          body { background: white !important; color: #333 !important; }
        `}</style>
        <div style={{ padding: '20px', background: '#f0f0f0', textAlign: 'center', fontSize: '18px', color: '#333', marginBottom: '20px' }}>
          🔍 DEBUG: {data.company_name || 'No Company'} - Enhanced Data: {data.google_profile?.products ? 'YES' : 'NO'}
        </div>
        
        {/* Basic HTML content to verify rendering */}
        <div style={{ padding: '40px', backgroundColor: '#fff', margin: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '20px' }}>
            {data.company_name || 'Your Business'}
          </h1>
          <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>
            {data.ai_customization?.hero_subtitle || 'Professional services in your area'}
          </p>
          
          {data.google_profile?.products && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Our Products</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {data.google_profile.products.map((product, index) => (
                  <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '15px' }} />
                    <h3 style={{ color: '#333', marginBottom: '10px' }}>{product.name}</h3>
                    <p style={{ color: '#666', marginBottom: '10px' }}>{product.description}</p>
                    <p style={{ color: '#007BFF', fontWeight: 'bold' }}>{product.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.google_profile?.phone && (
            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>Contact Information</h3>
              <p style={{ color: '#666' }}>📞 {data.google_profile.phone}</p>
              {data.google_profile.email && <p style={{ color: '#666' }}>✉️ {data.google_profile.email}</p>}
              {data.google_profile.address && <p style={{ color: '#666' }}>📍 {data.google_profile.address}</p>}
            </div>
          )}
        </div>
      </div>
    </SiteDataContext.Provider>
  );
}