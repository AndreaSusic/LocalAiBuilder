import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext.js';

export default function ServicesSection() {
  const contextData = useContext(SiteDataContext) || {};
  const { services = [], images = [], google_profile = {}, industry = '', ai_customization = {}, safeImg } = contextData;
  
  // Only treat as grass/sod landscaping if services actually mention grass or sod
  const isLandscaping = industry && typeof industry === 'string' && industry.toLowerCase().includes('landscap') && 
    (typeof services === 'string' && (services.toLowerCase().includes('grass') || services.toLowerCase().includes('sod')));
  
  // Check if we have enhanced product data from GBP
  const hasProductData = google_profile.products && google_profile.products.length > 0;
  
  // Parse services to extract individual products/services
  let servicesList = [];
  
  if (hasProductData) {
    // Use detailed product information from GBP
    servicesList = google_profile.products.map(product => ({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price
    }));
  } else if (Array.isArray(services)) {
    servicesList = services;
  } else if (typeof services === 'string' && services.length > 0) {
    // For landscaping, look for specific grass types mentioned or extract from context
    if (isLandscaping) {
      const grassTypes = [];
      const lowerServices = services.toLowerCase();
      
      // Check for explicit mentions
      if (lowerServices.includes('bermuda')) grassTypes.push('Bermuda Grass');
      if (lowerServices.includes('zoysia')) grassTypes.push('Zoysia Grass');
      if (lowerServices.includes('st. august') || lowerServices.includes('st august')) grassTypes.push('St. Augustine Grass');
      if (lowerServices.includes('buffalo')) grassTypes.push('Buffalo Grass');
      
      // If no specific types found but it's a general sod producer, add common Texas grasses
      if (grassTypes.length === 0 && (lowerServices.includes('sod') || lowerServices.includes('grass'))) {
        grassTypes.push('Bermuda Grass', 'Zoysia Grass');
      }
      
      servicesList = grassTypes.length > 0 ? grassTypes : [services];
    } else {
      // For other industries, split by common delimiters
      servicesList = services.split(/[,&+]/).map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  
  // Use GBP photos first, then provided images, then default stock images
  const gbpPhotos = google_profile.photos || [];
  const providedImages = Array.isArray(images) ? 
    images.filter(img => 
      typeof img === 'string' && 
      img.length > 0 && 
      !img.includes('placeholder') &&
      (img.startsWith('http://') || img.startsWith('https://'))
    ) : [];
  
  const availableImages = [...gbpPhotos, ...providedImages];
  
  // Default images for landscaping business
  const defaultImages = [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1574423151175-86c268d8a62a?w=900&auto=format&fit=crop&q=60'
  ];
  
  const sectionTitle = isLandscaping ? 'Our Products' : 'Our Services';

  const servicesToShow = servicesList.length > 0 ? servicesList.map((service, index) => ({
    title: service,
    description: isLandscaping ? 
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
            <img 
              src={safeImg ? safeImg(service.image) : service.image} 
              alt={service.title || service.name} 
            />
            <h4>{service.title || service.name}</h4>
            <p>{service.description}</p>
            {service.price && (
              <div className="service-price">
                <strong>{service.price}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}