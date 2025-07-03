import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext.js';

export default function AboutSection() {
  const { company_name, city = [], images = [], industry = '', google_profile = {}, team = [] } = useContext(SiteDataContext) || {};
  
  // Debug team data to understand why dummy data appears
  console.log('AboutSection DEBUG - Team data:', team, 'Length:', team.length);
  
  const cityName = Array.isArray(city) ? city[0] || 'Austin' : city;
  const gbpPhotos = google_profile.photos || [];
  const providedImages = Array.isArray(images) ? 
    images.filter(img => typeof img === 'string' && img.length > 0) : [];
  
  // Extract image URLs properly from GBP photos
  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') {
      return img.url || img.src || null;
    }
    return null;
  };

  const gbpPhotoUrls = gbpPhotos.map(getImageUrl).filter(url => url && url.startsWith('http'));
  const providedImageUrls = providedImages.map(getImageUrl).filter(url => url && url.startsWith('http'));
  const availableImages = [...gbpPhotoUrls, ...providedImageUrls];
  
  // Use a different image for location section - prefer GBP exterior/building photos
  const aboutImage = availableImages[2] || availableImages[1] || availableImages[0] || 
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=60';
  
  // Only treat as grass/sod landscaping if services actually mention grass or sod
  const contextData = useContext(SiteDataContext) || {};
  const { services = '' } = contextData;
  const isLandscaping = industry && industry.toLowerCase().includes('landscap') && 
    (typeof services === 'string' && (services.toLowerCase().includes('grass') || services.toLowerCase().includes('sod')));
  
  return (
    <>
      {/* Location & Expertise */}
      <section className="location-section">
        <div className="location-content">
          <div className="location-image">
            <img src={aboutImage} alt={isLandscaping ? "Landscaping Services" : "Our Services"} />
          </div>
          <div className="location-text">
            <h2>{isLandscaping ? `Premium Grass & Sod in ${cityName}` : `Serving ${cityName} with Excellence`}</h2>
            <p>At {company_name || 'Your Business'}, we're proud to serve the {cityName} community. {isLandscaping ? 
              `From premium sod varieties to expert lawn installation, we provide everything you need for a beautiful, healthy lawn.` :
              `We combine the latest techniques with exceptional service to deliver outstanding results.`
            }</p>
            <p>{isLandscaping ? 
              `Our high-quality grass varieties are carefully selected for Texas climate conditions, ensuring your lawn thrives year-round.` :
              `We take the time to understand your needs and deliver personalized solutions that exceed expectations.`
            }</p>
            <p>{isLandscaping ? 
              `Whether you're starting a new lawn project or renovating an existing one, our team provides expert guidance and premium products for lasting results.` :
              `From consultation to completion, we ensure every detail meets our high standards and your satisfaction.`
            }</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
          <h3>{isLandscaping ? 'Premium Quality Sod' : 'Expert Service'}</h3>
          <p>{isLandscaping ? 'We source the highest quality grass varieties perfect for Texas climate conditions.' : 'Our experienced team provides exceptional service tailored to your needs.'}</p>
        </div>

        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>{isLandscaping ? 'Professional Installation' : 'Quality Results'}</h3>
          <p>{isLandscaping ? 'Expert installation services ensure your new lawn establishes quickly and thrives.' : 'We use proven methods to deliver outstanding, lasting results.'}</p>
        </div>

        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3>{isLandscaping ? 'Customer Satisfaction' : 'Dedicated Care'}</h3>
          <p>{isLandscaping ? 'From consultation to completion, we ensure you love your new lawn.' : 'Our friendly team is dedicated to exceeding your expectations.'}</p>
        </div>
      </section>

      {/* Team Section - Only show if team data exists and has actual member information */}
      {team && Array.isArray(team) && team.length > 0 && team.some(member => member && member.name && member.name.trim() !== '') && (
        <section className="team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {team.filter(member => member.name && member.name.trim() !== '').map((member, index) => (
              <div key={index} className="team-member">
                <img src={member.image || '/api/placeholder/200/200'} alt={member.name} />
                <h4>{member.name}</h4>
                <p>{member.title}</p>
                <p>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}