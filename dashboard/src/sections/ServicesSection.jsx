import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ServicesSection() {
  const { services = [], images = [], google = {} } = useContext(SiteDataContext) || {};
  
  // Default services if none provided
  const defaultServices = [
    { name: "General Dentistry", description: "Comprehensive dental care for the whole family", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&auto=format&fit=crop" },
    { name: "Cosmetic Veneers", description: "Transform your smile with custom veneers", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&auto=format&fit=crop" },
    { name: "Invisalign®", description: "Straighten teeth with clear aligners", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=300&auto=format&fit=crop" }
  ];

  const servicesList = services.length > 0 ? 
    services.map((service, index) => ({
      name: service,
      description: `Professional ${service.toLowerCase()} services`,
      image: images[index + 1] || google.photos?.[index + 1] || defaultServices[index]?.image || defaultServices[0].image
    })) : 
    defaultServices;

  return (
    <section className="services">
      <h2>Our Services</h2>
      <div className="services-grid">
        {servicesList.map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.image} alt={service.name} />
            <h4>{service.name}</h4>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}