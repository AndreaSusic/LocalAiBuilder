import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext.js';
import Editable from '../components/Editable.jsx';

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
  
  // Use industrial/septic tank facility image for Kigen Plastika
  const septicFacilityImage = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&auto=format&fit=crop&q=60'; // Industrial facility
  const aboutImage = availableImages[2] || availableImages[1] || availableImages[0] || septicFacilityImage;
  
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
            <Editable as="h2" path="aboutTitle">{isLandscaping ? `Premium Grass & Sod in ${cityName}` : `Serving ${cityName} with Excellence`}</Editable>
            <Editable as="p" path="aboutParagraph1">At {company_name || 'Your Business'}, we're proud to serve the {cityName} community. {isLandscaping ? 
              `From premium sod varieties to expert lawn installation, we provide everything you need for a beautiful, healthy lawn.` :
              `We combine the latest techniques with exceptional service to deliver outstanding results.`
            }</Editable>
            <Editable as="p" path="aboutParagraph2">{isLandscaping ? 
              `Our high-quality grass varieties are carefully selected for Texas climate conditions, ensuring your lawn thrives year-round.` :
              `We take the time to understand your needs and deliver personalized solutions that exceed expectations.`
            }</Editable>
            <Editable as="p" path="aboutParagraph3">{isLandscaping ? 
              `Whether you're starting a new lawn project or renovating an existing one, our team provides expert guidance and premium products for lasting results.` :
              `From consultation to completion, we ensure every detail meets our high standards and your satisfaction.`
            }</Editable>
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
          <Editable as="h3" path="feature1Title">{isLandscaping ? 'Premium Quality Sod' : 'Expert Service'}</Editable>
          <Editable as="p" path="feature1Description">{isLandscaping ? 'We source the highest quality grass varieties perfect for Texas climate conditions.' : 'Our experienced team provides exceptional service tailored to your needs.'}</Editable>
        </div>

        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <Editable as="h3" path="feature2Title">{isLandscaping ? 'Professional Installation' : 'Quality Results'}</Editable>
          <Editable as="p" path="feature2Description">{isLandscaping ? 'Expert installation services ensure your new lawn establishes quickly and thrives.' : 'We use proven methods to deliver outstanding, lasting results.'}</Editable>
        </div>

        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <Editable as="h3" path="feature3Title">{isLandscaping ? 'Customer Satisfaction' : 'Dedicated Care'}</Editable>
          <Editable as="p" path="feature3Description">{isLandscaping ? 'From consultation to completion, we ensure you love your new lawn.' : 'Our friendly team is dedicated to exceeding your expectations.'}</Editable>
        </div>
      </section>

      {/* Team Section - REMOVED as requested by user (can be stored in files but not displayed) */}
    </>
  );
}