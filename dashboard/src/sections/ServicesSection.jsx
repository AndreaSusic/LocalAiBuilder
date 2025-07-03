import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext.js';

export default function ServicesSection({ bootstrap }) {
  const contextData = useContext(SiteDataContext) || {};
  const { 
    services = [], 
    images = [], 
    google_profile = {}, 
    industry = '', 
    ai_customization = {}, 
    safeImg,
    company_name = ''
  } = bootstrap || contextData;
  
  console.log('ServicesSection DEBUG - Services data:', services, typeof services);
  console.log('ServicesSection DEBUG - GBP products:', google_profile.products);
  
  // Only treat as grass/sod landscaping if services actually mention grass or sod
  const isLandscaping = industry && industry.toLowerCase().includes('landscap') && 
    (typeof services === 'string' && (services.toLowerCase().includes('grass') || services.toLowerCase().includes('sod')));
  
  // DATA PRIORITY HIERARCHY - Critical Business Rule
  // 1. HIGHEST: User input data from chat (services/products, images)
  // 2. SECOND: Website extraction data  
  // 3. THIRD: GBP data and AI content
  // 4. FOURTH: Stock images (when no GBP)
  
  let servicesList = [];
  const websiteProducts = bootstrap?.products || contextData?.products || [];
  const gbpProducts = google_profile.products || [];
  
  // PRIORITY 1: User chat input services (highest priority)
  if (Array.isArray(services) && services.length > 0) {
    console.log('🥇 PRIORITY 1: Using user input services from chat:', services);
    servicesList = services.slice(0, 3);
  } else if (typeof services === 'string' && services.length > 0) {
    console.log('🥇 PRIORITY 1: Using user input services text from chat:', services);
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
      
      servicesList = grassTypes.length > 0 ? grassTypes.slice(0, 3) : [services];
    } else {
      // For septic tanks and other industries, split by common delimiters
      servicesList = services.split(/[,&+]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
    }
  
  // PRIORITY 2: Website extraction data (second priority)
  } else if (websiteProducts.length > 0) {
    console.log('🥈 PRIORITY 2: Using authentic website-extracted services:', websiteProducts);
    servicesList = websiteProducts.slice(0, 3).map(product => {
      return {
        name: product.name,
        description: product.description || `Professional ${product.name.toLowerCase()} services from ${company_name}`,
        authentic: true,
        source: 'website'
      };
    });
  
  // PRIORITY 3: GBP data (third priority)
  } else if (gbpProducts.length > 0) {
    console.log('🥉 PRIORITY 3: Using GBP products data:', gbpProducts);
    servicesList = gbpProducts.slice(0, 3).map(product => {
      if (typeof product === 'string') return product;
      return product.name || product.title || String(product);
    });
    
  // PRIORITY 4: AI-generated fallback (lowest priority)
  } else {
    console.log('🏅 PRIORITY 4: Using AI-generated services as fallback');
    if (isLandscaping) {
      servicesList = ['Premium Sod Installation', 'Lawn Maintenance', 'Landscaping Design'];
    } else if (industry && industry.toLowerCase().includes('septic')) {
      servicesList = ['Septic Tank Systems', 'Plastic Components', 'Installation Services'];
    } else {
      servicesList = ['Professional Services', 'Expert Solutions', 'Quality Support'];
    }
  }
  
  // IMAGE PRIORITY HIERARCHY - Following same business rule
  // 1. HIGHEST: User uploaded images from chat
  // 2. SECOND: Website images (not implemented yet)
  // 3. THIRD: GBP imported images 
  // 4. FOURTH: Stock images from Unsplash/Pexels
  
  const userUploadedImages = Array.isArray(images) ? 
    images.filter(img => 
      typeof img === 'string' && 
      img.length > 0 && 
      !img.includes('placeholder') &&
      !img.includes('unsplash.com') &&
      !img.includes('pexels.com') &&
      (img.startsWith('http://') || img.startsWith('https://'))
    ) : [];
    
  const gbpPhotos = google_profile.photos || [];
  const stockImages = Array.isArray(images) ? 
    images.filter(img => 
      typeof img === 'string' && 
      (img.includes('unsplash.com') || img.includes('pexels.com'))
    ) : [];
  
  // Priority order: User uploads > GBP photos > Stock images
  const availableImages = [...userUploadedImages, ...gbpPhotos, ...stockImages];
  
  // Default images for landscaping business
  const defaultImages = [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1574423151175-86c268d8a62a?w=900&auto=format&fit=crop&q=60'
  ];
  
  const sectionTitle = isLandscaping ? 'Our Products' : 'Our Services';

  console.log('ServicesSection DEBUG - ServicesList:', servicesList, 'Type:', typeof servicesList);
  console.log('ServicesSection DEBUG - GBP Products:', gbpProducts.length, 'Available:', gbpProducts);
  
  // Helper function to extract image URLs
  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') {
      return img.url || img.src || null;
    }
    return null;
  };
  
  const servicesToShow = servicesList.length > 0 ? servicesList.map((service, index) => {
    console.log('ServicesSection DEBUG - Processing service:', service, 'Type:', typeof service, 'Index:', index);
    
    // Handle authentic website services differently
    if (service && service.authentic && service.source === 'website') {
      console.log('🌐 RENDERING AUTHENTIC WEBSITE SERVICE:', service.name);
      
      // Use septic tank specific images for Kigen Plastika
      const septicImages = [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=900&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=900&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=900&auto=format&fit=crop&q=60'
      ];
      const defaultServiceImage = septicImages[index] || septicImages[0];
      
      return {
        title: service.name,
        description: service.description,
        image: defaultServiceImage,
        authentic: true
      };
    }
    
    const serviceText = typeof service === 'string' ? service : String(service || '');
    
    const serviceImage = getImageUrl(gbpPhotos[index]) || 
                        getImageUrl(availableImages[index]) || 
                        defaultImages[index] || 
                        defaultImages[0];
    
    // Use authentic GMB product data for title and description if available
    let finalTitle = serviceText;
    let finalDescription;
    
    if (gbpProducts.length > 0 && gbpProducts[index]) {
      const gbpProduct = gbpProducts[index];
      
      // Check if this is real GMB data or placeholder data
      const isRealGMBData = gbpProduct.name && !gbpProduct.name.startsWith('Product ');
      
      if (isRealGMBData) {
        // Use authentic GMB product data
        if (typeof gbpProduct === 'object') {
          finalTitle = gbpProduct.name || gbpProduct.title || serviceText;
          finalDescription = gbpProduct.description || `High-quality ${finalTitle.toLowerCase()} from ${company_name}.`;
          console.log('🔒 Using authentic GMB product data:', finalTitle, finalDescription);
        } else if (typeof gbpProduct === 'string') {
          finalTitle = gbpProduct;
          finalDescription = `High-quality ${finalTitle.toLowerCase()} from ${company_name}.`;
        }
      } else {
        // Ignore placeholder data and use actual business services
        console.log('🚫 Ignoring placeholder GMB data, using actual business services');
        finalTitle = serviceText;
        // Create specific descriptions for septic tank business
        if (services.toLowerCase().includes('septic')) {
          if (serviceText.toLowerCase().includes('septic')) {
            finalDescription = `Complete septic tank systems manufactured with high-quality plastic construction for residential and commercial properties from ${company_name}.`;
          } else if (serviceText.toLowerCase().includes('plastic')) {
            finalDescription = `Durable plastic components and containers manufactured for septic systems and water storage applications from ${company_name}.`;
          } else if (serviceText.toLowerCase().includes('installation')) {
            finalDescription = `Professional installation and maintenance services for septic tank systems and plastic components from ${company_name}.`;
          } else {
            finalDescription = `Professional septic tank manufacturing and installation services from ${company_name}.`;
          }
        } else {
          finalDescription = `Professional ${serviceText.toLowerCase()} services from ${company_name}.`;
        }
      }
    } else {
      // Fallback descriptions when no GMB data
      finalDescription = isLandscaping ? 
        `Premium ${serviceText.toLowerCase()} perfect for your lawn and landscaping needs.` :
        `Professional ${serviceText.toLowerCase()} services tailored to your needs.`;
    }
    
    return {
      title: finalTitle,
      description: finalDescription,
      image: serviceImage,
      isAuthentic: gbpProducts.length > 0 // Mark as authentic to protect from AI override
    };
  }) : [];
  
  console.log('ServicesSection DEBUG - ServicesToShow:', servicesToShow);

  // Don't show section if no services
  if (servicesToShow.length === 0) return null;

  return (
    <section className="services">
      <h2>{sectionTitle}</h2>
      <div className="services-grid three-columns">
        {servicesToShow.map((service, index) => (
          <div key={index} className="service-card">
            <img src={safeImg ? safeImg(service.image) : service.image} alt={`${company_name} - ${service.title}`} />
            <h4>{service.title}</h4>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}