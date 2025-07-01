import React, { useState } from "react";

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
          color: var(--text);
        }
        a {
          color: var(--primary);
          text-decoration: none;
        }
        img {
          max-width: 100%;
          display: block;
        }
        
        /* Navigation */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 1rem;
          border-bottom: 1px solid #ddd;
          position: relative;
        }
        .nav a {
          color: #000;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: 'Work Sans', sans-serif;
        }
        .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .nav-links {
          list-style: none;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .nav-links li {
          position: relative;
        }
        .nav-links li:hover > ul {
          display: block;
        }
        .nav-links li > ul {
          display: none;
          position: absolute;
          top: 2.5rem;
          left: 0;
          background: white;
          border: 1px solid #ddd;
          padding: 0.5rem 0;
          min-width: 10rem;
          z-index: 1000;
        }
        .nav-links li > ul li {
          padding: 0.5rem 1rem;
        }
        .nav-links > li > a {
          padding: 0.5rem;
        }
        .contact-phone {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        .cta {
          background: var(--primary);
          color: white !important;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }
        
        /* Hero */
        .hero {
          position: relative;
          background-image: url('https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-size: cover;
          background-position: center;
          text-align: center;
          padding: 6rem 1rem;
          color: white;
        }
        .hero::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
        }
        .hero * {
          position: relative;
        }
        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 3.5rem;
          color: white;
        }
        .hero p {
          font-size: 1.1rem;
          margin-bottom: 4.5rem;
        }
        .btn-primary {
          background: var(--secondary);
          color: var(--text);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
        }
        
        /* Location Section */
        .location-section {
          background: #fff;
          padding: 40px 20px;
        }
        .location-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          max-width: 900px;
          gap: 50px;
          margin: 0 auto;
        }
        .location-image {
          flex: 1 1 300px;
        }
        .location-image img {
          width: 100%;
          height: auto;
          border-radius: 10px;
        }
        .location-text {
          flex: 2 1 400px;
        }
        .location-text h2 {
          font-size: 2rem;
          margin-bottom: 16px;
        }
        .location-text p {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 16px;
          color: #444;
        }
        
        /* Features */
        .features {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          background: white;
          padding: 3rem 1rem;
          text-align: center;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .feature {
          flex: 1;
          padding: 1rem;
        }
        .feature .icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          color: var(--primary);
        }
        .feature h3 {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .feature p {
          font-size: 0.95rem;
          color: #555;
        }
        
        /* Services */
        .services {
          background: white;
          padding: 3rem 1rem;
        }
        .services h2 {
          text-align: center;
          font-size: 2.75rem;
          margin-bottom: 3rem;
        }
        .services-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .service-card {
          background: white;
          border-radius: 6px;
          overflow: hidden;
          text-align: center;
        }
        .service-card img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
        }
        .service-card h4 {
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
        }
        .service-card p {
          padding: 0 0.75rem 1rem;
          font-size: 0.9rem;
          color: #555;
        }
        
        /* Testimonials */
        .testimonials {
          background: white;
          padding: 3rem 1rem;
          text-align: center;
        }
        .testimonials h2 {
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .testimonials-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .testimonial {
          background: var(--bg-light);
          border-left: 4px solid var(--primary);
          padding: 1rem;
          border-radius: 4px;
          font-style: italic;
          position: relative;
        }
        .testimonial p {
          margin-bottom: 0.75rem;
        }
        .stars {
          color: gold;
          font-size: 1.1rem;
        }
        
        /* Team */
        .team {
          background: var(--bg-dark);
          padding: 3rem 1rem;
          text-align: center;
        }
        .team h2 {
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .team-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }
        .team-member img {
          border-radius: 50%;
          width: 200px;
          height: 200px;
          object-fit: cover;
          margin: 0 auto 0.5rem;
        }
        .team-member h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .team-member p {
          font-size: 0.9rem;
          color: #555;
        }
        
        /* Gallery */
        .gallery {
          background: white;
          padding: 3rem 1rem;
        }
        .gallery h2 {
          text-align: center;
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .gallery-grid {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }
        .gallery-grid img {
          flex: 0 0 auto;
          width: 200px;
          height: 150px;
          object-fit: cover;
          border-radius: 6px;
        }
        
        /* Contact + Map */
        .contact-form {
          background: var(--bg-light);
          padding: 3rem 1rem;
        }
        .contact-form h2 {
          text-align: center;
          margin-bottom: 2.5rem;
          font-size: 2.75rem;
        }
        .contact-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr 1fr;
        }
        .contact-grid form {
          display: grid;
          gap: 1rem;
        }
        .contact-grid input,
        .contact-grid textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
        }
        .contact-grid button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        .contact-grid .map-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 4px;
        }
        
        /* Secondary CTA */
        .secondary-cta {
          background: var(--secondary);
          padding: 4rem 1rem;
          text-align: center;
        }
        .secondary-cta h2 {
          font-size: 2.75rem;
          margin-bottom: 2.5rem;
        }
        .secondary-cta p {
          font-size: 1rem;
          margin-bottom: 3rem;
          color: var(--text);
        }
        .btn-accent {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        
        /* Footer */
        footer {
          background: #3f3f3f;
          color: #eee;
          padding: 2rem 1rem;
        }
        .footer-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        footer h4 {
          margin-bottom: 0.75rem;
          font-size: 1rem;
          color: white;
        }
        footer a {
          color: #ccc;
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .footer-social {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-top: 8px;
        }
        .footer-social .icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          border: 1px solid #fff;
          border-radius: 50%;
          justify-content: center;
          align-items: center;
          transition: background .25s, border-color .25s;
        }
        .footer-social .icon svg {
          width: 20px;
          height: 20px;
          fill: #fff;
        }
        .footer-social .icon:hover {
          background: #5DD39E;
          border-color: #5DD39E;
        }
        
        /* Mobile Responsive */
        @media (max-width: 800px) {
          .hamburger {
            display: block;
          }
          .nav-links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #fff;
            border-bottom: 1px solid #ddd;
            z-index: 1000;
          }
          .nav-links.mobile-open {
            display: flex;
          }
          .nav-links li {
            padding: 0.75rem;
            text-align: center;
          }
          .location-content {
            flex-direction: column;
          }
          .features {
            flex-direction: column;
            align-items: stretch;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
          .team-grid {
            display: flex;
            overflow-x: auto;
            gap: 1rem;
            padding-bottom: 0.5rem;
          }
          .team-member {
            flex: 0 0 auto;
            margin-bottom: 0;
          }
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .gallery-grid img {
            width: 150px;
            height: 100px;
          }
        }
      `}</style>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      
      {/* Navigation */}
      <nav className="nav">
        <div className="logo">{data.company_name || 'YourLogo'}</div>
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">☰</button>
        <ul className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <li><a href="#">Home</a></li>
          <li>
            <a href="#">Services ▾</a>
            <ul>
              <li><a href="#">General Dentistry</a></li>
              <li><a href="#">Cosmetic Veneers</a></li>
              <li><a href="#">Invisalign®</a></li>
            </ul>
          </li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="tel:+123456789" className="contact-phone">📞 +1 234 567 89</a></li>
          <li><a href="#" className="cta">Schedule now</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero">
        <h1>{data.company_name || 'Your Practice Name'}</h1>
        <p>{data.services ? `Professional ${data.services} services` : 'High-quality care in a welcoming environment—expertise you can trust.'}</p>
        <button className="btn-primary">Schedule Now</button>
      </section>

      {/* Location & Expertise */}
      <section className="location-section">
        <div className="location-content">
          <div className="location-image">
            <img src="https://plus.unsplash.com/premium_photo-1674575134867-cb7623d39bdb?w=900&auto=format&fit=crop&q=60" alt="Dentistry Services" />
          </div>
          <div className="location-text">
            <h2>Serving Austin's Smiles with Excellence</h2>
            <p>At Your Practice, we're proud to be part of the Austin community. From our state-of-the-art facilities in downtown Austin to our friendly, highly trained staff, every element is designed to put you at ease and deliver world-class care.</p>
            <p>We combine the latest minimally invasive techniques with a warm, inviting atmosphere so you feel relaxed from the moment you walk in.</p>
            <p>Whether it's a routine cleaning or a complex cosmetic procedure, our team takes the time to listen to your needs, explain every step, and ensure you leave with a healthier, more confident smile.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 7a4 4 0 1 1 6 0v1H9V7z"/>
              <path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
            </svg>
          </div>
          <h3>Experienced Dentists</h3>
          <p>Our highly skilled dentists provide compassionate and personalized care to each patient.</p>
        </div>

        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <path d="M3 11V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/>
            </svg>
          </div>
          <h3>State-of-the-Art Facility</h3>
          <p>We use advanced technology to ensure accurate diagnoses and effective treatments.</p>
        </div>

        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3>Patient-Centered Care</h3>
          <p>Our friendly team is dedicated to making your visit comfortable and stress-free.</p>
        </div>
      </section>

      {/* Services/Products Section */}
      <section className="services">
        <h2>{isSingleItem ? `Our ${itemLabel}` : `Our ${itemsLabel}`}</h2>
        {isSingleItem ? (
          // Single service/product layout
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className="service-card" style={{ display: 'inline-block', maxWidth: '400px' }}>
              <img src={data.images && data.images[0] !== 'stock_photos_placeholder' ? data.images[0] : "https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60"} alt="" />
              <h4>{servicesList[0]}</h4>
              <p>Professional {servicesList[0].toLowerCase()} {hasProducts ? 'solutions' : 'services'} tailored to your needs.</p>
            </div>
          </div>
        ) : (
          // Multiple services/products grid
          <div className="services-grid">
            {servicesList.slice(0, 3).map((service, index) => (
              <div key={index} className="service-card">
                <img src={data.images && data.images[index] !== 'stock_photos_placeholder' ? data.images[index] : `https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60`} alt="" />
                <h4>{service}</h4>
                <p>Professional {service.toLowerCase()} {hasProducts ? 'solutions' : 'services'} designed for excellence.</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Patients Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <p>"Fantastic experience—couldn't be happier with my new smile and the care I received."</p>
            <div className="stars">★★★★★</div>
          </div>
          <div className="testimonial">
            <p>"Professional, friendly staff—every visit exceeded my expectations. Highly recommend!"</p>
            <div className="stars">★★★★☆</div>
          </div>
          <div className="testimonial">
            <p>"Top-quality care in a comfortable environment. My family and I trust them completely."</p>
            <div className="stars">★★★★★</div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="https://images.unsplash.com/photo-1665080954352-5a12ef53017a?w=900&auto=format&fit=crop&q=60" alt="" />
            <h4>Dr. Smith</h4>
            <p>DDS, Founder</p>
          </div>
          <div className="team-member">
            <img src="https://images.unsplash.com/photo-1620928269189-dc4ee9d981c0?w=900&auto=format&fit=crop&q=60" alt="" />
            <h4>Dr. Jones</h4>
            <p>Orthodontist</p>
          </div>
          <div className="team-member">
            <img src="https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=900&auto=format&fit=crop&q=60" alt="" />
            <h4>Dr. Lee</h4>
            <p>Oral Surgeon</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery">
        <h2>Our Office</h2>
        <div className="gallery-grid">
          <img src={data.images && data.images[3] !== 'stock_photos_placeholder' ? data.images[3] : "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&auto=format&fit=crop&q=60"} alt="" />
          <img src={data.images && data.images[4] !== 'stock_photos_placeholder' ? data.images[4] : "https://images.unsplash.com/photo-1616391182219-e080b4d1043a?w=900&auto=format&fit=crop&q=60"} alt="" />
          <img src={data.images && data.images[5] !== 'stock_photos_placeholder' ? data.images[5] : "https://plus.unsplash.com/premium_photo-1672922646298-3afc6c6397c9?w=900&auto=format&fit=crop&q=60"} alt="" />
        </div>
      </section>

      {/* Contact + Map */}
      <section className="contact-form">
        <h2>Get in Touch</h2>
        <div className="contact-grid">
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="tel" placeholder="Phone Number" required />
            <textarea placeholder="How can we help?" rows="4"></textarea>
            <button type="submit">Submit</button>
          </form>
          <div className="map-container">
            <iframe
              src="https://maps.google.com/maps?q=your%20location&t=&z=13&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
              title="Location Map"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="secondary-cta">
        <h2>Ready to Transform Your Smile?</h2>
        <p>View available appointments and enjoy dentistry done right.</p>
        <button className="btn-accent">Contact Us Today</button>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <h4>YourPractice</h4>
            <p>123 Dental St.<br/>City, State ZIP</p>
          </div>
          <div>
            <h4>Services</h4>
            <a href="#">General Dentistry</a>
            <a href="#">Cosmetic Veneers</a>
            <a href="#">Invisalign®</a>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>
          <div>
            <h4>Connect</h4>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="icon">
                <svg viewBox="0 0 24 24"><path d="M15 3h4V0h-4c-3.9 0-7 3.1-7 7v3H5v4h3v10h4V14h3.1l.9-4H12V7c0-1.1.9-2 2-2z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="icon">
                <svg viewBox="0 0 24 24"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-1.7-1.3-3-3-3H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.5A5.5 5.5 0 1 0 17.5 12 5.51 5.51 0 0 0 12 7.5zm0 9A3.5 3.5 0 1 1 15.5 13 3.5 3.5 0 0 1 12 16.5zm5.9-10.1a1.3 1.3 0 1 1-1.3-1.3 1.3 1.3 0 0 1 1.3 1.3z"/></svg>
              </a>
              <a href="#" aria-label="Google Reviews" className="icon">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 8.94 5.78h-8.9v3.44h5.4A5.57 5.57 0 0 1 12 17.56a5.56 5.56 0 0 1 0-11.12c1.5 0 2.85.57 3.88 1.5l2.73-2.73A9.92 9.92 0 0 0 12 2z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}