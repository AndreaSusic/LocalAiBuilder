import React, { useState, useEffect } from "react";
import { HeroSection, ServicesSection, AboutSection, GallerySection, ReviewsSection, ContactSection } from '../../../sections';

export default function HomepageV1({ tokens = {}, bootstrap = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Use bootstrap data if available, otherwise use tokens
  const data = bootstrap || {
    company_name: tokens.businessName || 'Your Business Name',
    city: tokens.location ? [tokens.location] : ['Your City'],
    services: tokens.services || 'Your Services',
    colours: tokens.primaryColor ? [tokens.primaryColor, tokens.secondaryColor || '#000000'] : ['#5DD39E', '#000000'],
    industry: tokens.industry || 'Your Industry'
  };
  
  console.log('HomepageV1 received bootstrap data:', data);

  // Determine if this is products or services based on industry and content
  const hasProducts = data.industry && (
    data.industry.toLowerCase().includes('retail') ||
    data.industry.toLowerCase().includes('shop') ||
    data.industry.toLowerCase().includes('store') ||
    data.industry.toLowerCase().includes('ecommerce') ||
    data.industry.toLowerCase().includes('manufacturing') ||
    (data.services && data.services.toLowerCase().includes('product'))
  );
  
  const itemLabel = hasProducts ? 'Product' : 'Service';
  const itemsLabel = hasProducts ? 'Products' : 'Services';
  
  // Parse services/products into array
  const servicesList = data.services ? data.services.split(',').map(s => s.trim()).filter(s => s) : [];
  const isSingleItem = servicesList.length === 1;

  // State for AI-generated text content
  const [textContent, setTextContent] = useState({
    heroTitle: `Welcome to ${data.company_name || 'Your Business'}`,
    heroSubtitle: `Professional ${data.services || 'services'} in ${data.city?.[0] || 'your area'}`,
    servicesTitle: isSingleItem ? `Our ${itemLabel}` : `Our ${itemsLabel}`,
    aboutTitle: `About ${data.company_name || 'Our Business'}`,
    aboutText: `We provide professional ${data.services?.toLowerCase() || 'services'} with a focus on quality and customer satisfaction.`,
    ctaText: 'Schedule Consultation',
    contactTitle: 'Get in Touch'
  });

  // Generate AI-adapted content on mount
  useEffect(() => {
    if (data.company_name && data.industry) {
      const generateContent = async () => {
        try {
          const response = await fetch('/api/ai-text-mapping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessData: data })
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setTextContent(prev => ({ ...prev, ...result.textMappings }));
            }
          }
        } catch (error) {
          console.error('Failed to generate AI content:', error);
        }
      };
      
      generateContent();
    }
  }, [data.company_name, data.industry]);
  
  // Helper functions for industry-specific labels
  const getGalleryTitle = (industry) => {
    if (!industry) return 'Our Gallery';
    const ind = industry.toLowerCase();
    if (ind.includes('landscaping') || ind.includes('sod') || ind.includes('grass')) return 'Our Grass';
    if (ind.includes('dental') || ind.includes('medical') || ind.includes('clinic')) return 'Our Office';
    if (ind.includes('restaurant') || ind.includes('food')) return 'Our Restaurant';
    if (ind.includes('salon') || ind.includes('spa')) return 'Our Salon';
    if (ind.includes('gym') || ind.includes('fitness')) return 'Our Facility';
    return 'Our Space';
  };
  
  const getReviewerLabel = (industry) => {
    if (!industry) return 'Clients';
    const ind = industry.toLowerCase();
    if (ind.includes('dental') || ind.includes('medical') || ind.includes('clinic')) return 'Patients';
    if (ind.includes('restaurant') || ind.includes('food')) return 'Customers';
    if (ind.includes('retail') || ind.includes('shop') || ind.includes('store')) return 'Customers';
    return 'Clients';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Prepare data for sections with proper image integration
  const sectionData = {
    hero: {
      title: textContent.heroTitle,
      subtitle: textContent.heroSubtitle,
      ctaLabel: textContent.ctaText,
      bgImage: data.images?.[0] || data.gbp_photos?.[0] || null
    },
    services: servicesList.map((service, index) => ({
      title: service,
      text: `Professional ${service.toLowerCase()} services tailored to your needs.`,
      img: data.images?.[index + 1] || data.stock_images?.[index] || null
    })),
    about: {
      title: textContent.aboutTitle,
      text: textContent.aboutText,
      location: data.city?.[0] || 'your area',
      reviewerType: getReviewerLabel(data.industry).toLowerCase()
    },
    gallery: {
      title: getGalleryTitle(data.industry),
      images: data.gbp_photos || data.stock_images || []
    },
    contact: {
      headline: textContent.contactTitle,
      address: data.gbp_address || `${data.city?.[0] || 'Your City'}`,
      phone: data.gbp_phone || '',
      map: data.gbp_map_url || `https://maps.google.com/maps?q=${data.city?.[0] || 'Austin'}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    },
    reviews: data.gbp_reviews || [],
    team: data.team || [],
    colors: data.colours || ['#5DD39E', '#EFD5BD'],
    companyName: data.company_name || 'Your Business',
    itemsLabel: itemsLabel
  };

  return (
    <div style={{
      fontFamily: "'Roboto', sans-serif",
      color: '#3f3f3f',
      lineHeight: '1.5',
      margin: 0,
      padding: 0
    }}>
      <style>{`
        :root {
          --primary: ${data.colours?.[0] || '#5DD39E'};
          --secondary: ${data.colours?.[1] || '#EFD5BD'};
          --text: #3f3f3f;
          --bg-light: #f9f9f9;
          --bg-dark: #f5f5f5;
          --font-sans: 'Roboto', sans-serif;
          --font-heading: 'Work Sans', sans-serif;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          display: block;
        }
        h1, h2, h3, h4 {
          font-family: 'Work Sans', sans-serif;
          color: var(--text);
        }
      `}</style>
      
      <HeroSection data={sectionData.hero} colors={sectionData.colors} companyName={sectionData.companyName} />
      <ServicesSection 
        services={sectionData.services} 
        title={isSingleItem ? `Our ${itemLabel}` : `Our ${itemsLabel}`}
        colors={sectionData.colors} 
      />
      <AboutSection data={sectionData.about} colors={sectionData.colors} />
      {sectionData.gallery.images.length > 0 && (
        <GallerySection data={sectionData.gallery} colors={sectionData.colors} />
      )}
      {sectionData.reviews.length > 0 && (
        <ReviewsSection reviews={sectionData.reviews} colors={sectionData.colors} />
      )}
      <ContactSection data={sectionData.contact} colors={sectionData.colors} />
    </div>
  );
}