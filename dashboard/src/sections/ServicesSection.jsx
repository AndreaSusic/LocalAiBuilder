import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ServicesSection() {
  const { services = [], images = [], google_profile = {}, industry = '', ai_customization = {} } = useContext(SiteDataContext) || {};
  
  // Handle services as either string or array
  const servicesList = Array.isArray(services) ? services :
                      (typeof services === 'string' && services.length > 0) ? [services] : [];
  
  // Use GBP photos first, then provided images, then default stock images
  const gbpPhotos = google_profile.photos || [];
  const providedImages = Array.isArray(images) ? 
    images.filter(img => typeof img === 'string' && img.length > 0) : [];
  
  const availableImages = [...gbpPhotos, ...providedImages];
  
  // Default images for landscaping business
  const defaultImages = [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1574423151175-86c268d8a62a?w=900&auto=format&fit=crop&q=60'
  ];
  
  const isProduct = industry && industry.toLowerCase().includes('landscap');
  const sectionTitle = isProduct ? 'Our Products' : 'Our Services';

  const servicesToShow = servicesList.length > 0 ? servicesList.map((service, index) => ({
    title: service,
    description: isProduct ? 
      `Premium ${service.toLowerCase()} perfect for your lawn and landscaping needs.` :
      `Professional ${service.toLowerCase()} services tailored to your needs.`,
    image: availableImages[index] || defaultImages[index] || defaultImages[0]
  })) : [];

  // Don't show section if no services
  if (servicesToShow.length === 0) return null;

  return (
    <section className="services">
      <h2>{sectionTitle}</h2>
      <div className="services-grid">
        {servicesToShow.map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.image} alt={service.title} />
            <h4>{service.title}</h4>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}