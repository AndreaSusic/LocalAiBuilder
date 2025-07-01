import React, { useState, useEffect } from "react";

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
          --secondary: #EFD5BD;
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
        h1, h2, h3, h4 {
          font-family: 'Work Sans', sans-serif;
          font-weight: 600;
          line-height: 1.2;
        }
        body {
          display: block;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        /* Header Styles */
        .header {
          background: white;
          padding: 10px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary);
        }
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 30px;
        }
        .nav-menu a {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          cursor: pointer;
          gap: 3px;
        }
        .hamburger span {
          width: 25px;
          height: 3px;
          background: var(--text);
          transition: 0.3s;
        }
        
        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, var(--bg-light) 0%, white 100%);
          padding: 80px 0;
          text-align: center;
        }
        .hero h1 {
          font-size: 3rem;
          color: var(--text);
          margin-bottom: 20px;
        }
        .hero p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 30px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Services Section */
        .services {
          padding: 80px 0;
          background: white;
        }
        .services h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 50px;
          color: var(--text);
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .service-card {
          background: var(--bg-light);
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .service-card:hover {
          transform: translateY(-5px);
        }
        .service-card h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: var(--text);
        }
        
        /* About Section */
        .about {
          padding: 80px 0;
          background: var(--bg-light);
        }
        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }
        .about h2 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: var(--text);
        }
        .about p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #666;
        }
        
        /* Contact Section */
        .contact {
          padding: 80px 0;
          background: white;
          text-align: center;
        }
        .contact h2 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: var(--text);
        }
        .contact p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 30px;
        }
        
        /* Footer */
        .footer {
          background: var(--text);
          color: white;
          padding: 40px 0;
          text-align: center;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .hamburger {
            display: flex;
          }
          .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0,0,0,0.05);
            padding: 20px 0;
          }
          .nav-menu.active {
            left: 0;
          }
          .hero h1 {
            font-size: 2rem;
          }
          .about-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">{data.company_name || 'YourLogo'}</div>
            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">{itemsLabel}</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#" className="btn">Schedule now</a></li>
            </ul>
            <div className="hamburger" onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <h1>{textContent.heroTitle}</h1>
          <p>{textContent.heroSubtitle}</p>
          <a href="#contact" className="btn">{textContent.ctaText}</a>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <div className="container">
          <h2>{textContent.servicesTitle}</h2>
          <div className="services-grid">
            {servicesList.map((service, index) => (
              <div key={index} className="service-card">
                <h3>{service}</h3>
                <p>Professional {service.toLowerCase()} services tailored to your needs.</p>
              </div>
            ))}
            {servicesList.length === 0 && (
              <div className="service-card">
                <h3>Our {itemLabel}</h3>
                <p>Professional {data.services?.toLowerCase() || 'services'} tailored to your needs.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div>
              <h2>{textContent.aboutTitle}</h2>
              <p>{textContent.aboutText}</p>
              <p>Located in {data.city?.[0] || 'your area'}, we're committed to delivering exceptional results for our {getReviewerLabel(data.industry).toLowerCase()}.</p>
            </div>
            <div>
              <div style={{
                width: '100%',
                height: '300px',
                background: 'var(--bg-dark)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666'
              }}>
                {getGalleryTitle(data.industry)} Image
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <h2>{textContent.contactTitle}</h2>
          <p>Ready to get started? Contact us today for a consultation.</p>
          <a href="#" className="btn">{textContent.ctaText}</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 {data.company_name || 'Your Business'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}