import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ServicesSection() {
  const { services = [], images = [] } = useContext(SiteDataContext) || {};
  
  const defaultServices = [
    {
      title: 'General Dentistry',
      description: 'Complete check-ups, cleanings, and preventive treatments for all ages.',
      image: 'https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60'
    },
    {
      title: 'Cosmetic Veneers',
      description: 'Transform your smile with custom-crafted porcelain veneers.',
      image: 'https://plus.unsplash.com/premium_photo-1674567520651-6e1f0a5a8fd3?w=900&auto=format&fit=crop&q=60'
    },
    {
      title: 'Invisalign®',
      description: 'Straighten your teeth discreetly with clear aligners.',
      image: 'https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60'
    }
  ];

  // Handle services as either string or array
  const servicesList = Array.isArray(services) ? services :
                      (typeof services === 'string' && services.length > 0) ? [services] : [];
  
  // Ensure images is an array of strings
  const imageUrls = Array.isArray(images) ? 
    images.filter(img => typeof img === 'string' && img.length > 0) : [];

  const servicesToShow = servicesList.length > 0 ? servicesList.map((service, index) => ({
    title: service,
    description: `Professional ${service.toLowerCase()} services tailored to your needs.`,
    image: imageUrls[index + 1] || defaultServices[index]?.image || defaultServices[0].image
  })) : defaultServices;

  return (
    <section className="services">
      <h2>Our Services</h2>
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