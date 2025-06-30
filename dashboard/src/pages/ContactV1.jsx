import React, { useState } from "react";

// Contact page tokens and data
export const contactTokens = {
  companyName: "Your Website",
  heroTitle: "Let's Talk",
  heroSubtitle: "We answer every message within one business day.",
  ctaLabel: "Jump to Form ↓",
  
  contactInfo: [
    {
      icon: "fa fa-phone",
      title: "Call Us",
      primary: "+1 234 567 89",
      secondary: "Mon–Fri, 08:00–17:00",
      link: "tel:+123456789"
    },
    {
      icon: "fa fa-envelope", 
      title: "Email",
      primary: "info@yourwebsite.com",
      secondary: "We reply within 6 h",
      link: "mailto:info@yourwebsite.com"
    },
    {
      icon: "fa fa-map-marker-alt",
      title: "Office", 
      primary: "123 Dental St.\nAustin, TX 78701",
      secondary: "Get Directions",
      link: "#map"
    }
  ],

  formTitle: "Send us an inquiry or a message, we will get back to you soon.",
  
  operatingHours: [
    { day: "Monday", hours: "08:00 – 17:00" },
    { day: "Tuesday", hours: "08:00 – 17:00" },
    { day: "Wednesday", hours: "08:00 – 17:00" },
    { day: "Thursday", hours: "08:00 – 17:00" },
    { day: "Friday", hours: "08:00 – 17:00" },
    { day: "Saturday", hours: "Closed" },
    { day: "Sunday", hours: "Closed" }
  ],

  mapUrl: "https://maps.google.com/maps?q=dental%20clinic%20austin&t=&z=13&ie=UTF8&iwloc=&output=embed",
  
  secondaryCta: {
    text: "Not ready?",
    linkText: "Explore our Knowledge Base →",
    href: "/kb"
  },

  footer: {
    practice: {
      name: "Your Website",
      address: "123 Dental St.\nAustin, TX 78701"
    },
    services: ["General Dentistry", "Cosmetic Veneers", "Invisalign®"],
    links: ["Home", "About", "FAQ"]
  }
};

// Navigation Component
const NavBar = ({ tokens }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav>
      <div className="logo">{tokens.companyName}</div>
      <button className="hamburger" aria-label="menu" onClick={toggleMenu}>☰</button>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <li><a href="/">Home</a></li>
        <li>
          <a href="#">Services ▾</a>
          <ul>
            <li><a href="#">General Dentistry</a></li>
            <li><a href="#">Cosmetic Veneers</a></li>
            <li><a href="#">Invisalign®</a></li>
          </ul>
        </li>
        <li><a href="#">About</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li className="contact-phone">
          <a href="tel:+123456789">📞 +1 234 567 89</a>
          <button className="cta">Schedule Now</button>
        </li>
      </ul>
    </nav>
  );
};

// Hero Component
const Hero = ({ tokens }) => (
  <header className="container hero" id="top">
    <h1>{tokens.heroTitle}</h1>
    <p>{tokens.heroSubtitle}</p>
    <a href="#contact-form-section" className="btn-primary">{tokens.ctaLabel}</a>
  </header>
);

// Contact Grid Component
const ContactGrid = ({ tokens }) => (
  <section className="container" aria-label="Key contact information">
    <div className="contact-grid-info">
      {tokens.contactInfo.map((info, i) => (
        <div key={i} className="card">
          <i className={info.icon}></i>
          <h3>{info.title}</h3>
          {info.link.startsWith('#') ? (
            <p>{info.primary.split('\n').map((line, j) => (
              <span key={j}>{line}{j < info.primary.split('\n').length - 1 && <br />}</span>
            ))}</p>
          ) : (
            <a href={info.link}>{info.primary.replace(/\n/g, ' ')}</a>
          )}
          {info.link.startsWith('#') ? (
            <a href={info.link}>{info.secondary}</a>
          ) : (
            <p>{info.secondary}</p>
          )}
        </div>
      ))}
    </div>
  </section>
);

// Contact Form Component
const ContactForm = ({ tokens }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="container" id="contact-form-section" aria-label="Contact form">
      <h2>{tokens.formTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea 
            id="message" 
            name="message" 
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn-primary">Send Message</button>
      </form>
    </section>
  );
};

// Map Component
const Map = ({ tokens }) => (
  <section className="map-wrapper" id="map" aria-label="Map and Directions">
    <iframe
      loading="lazy"
      src={tokens.mapUrl}
      allowFullScreen=""
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </section>
);

// Hours Table Component
const HoursTable = ({ tokens }) => (
  <section className="container" aria-label="Operating hours">
    <table className="hours-table">
      <caption>Operating Hours (GMT+2)</caption>
      <tbody>
        {tokens.operatingHours.map((hour, i) => (
          <tr key={i}>
            <th>{hour.day}</th>
            <td>{hour.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

// Secondary CTA Component
const SecondaryCTA = ({ tokens }) => (
  <section className="secondary-cta">
    <p>{tokens.secondaryCta.text} <a href={tokens.secondaryCta.href}>{tokens.secondaryCta.linkText}</a></p>
  </section>
);

// Footer Component
const Footer = ({ tokens }) => (
  <footer>
    <div className="footer-grid">
      <div>
        <h4>{tokens.footer.practice.name}</h4>
        <p>{tokens.footer.practice.address.split('\n').map((line, i) => (
          <span key={i}>{line}{i < tokens.footer.practice.address.split('\n').length - 1 && <br />}</span>
        ))}</p>
      </div>
      <div>
        <h4>Services</h4>
        {tokens.footer.services.map((service, i) => (
          <a key={i} href="#">{service}</a>
        ))}
      </div>
      <div>
        <h4>Quick Links</h4>
        {tokens.footer.links.map((link, i) => (
          <a key={i} href={link === 'Home' ? '/' : link === 'FAQ' ? '#faq' : '#'}>{link}</a>
        ))}
      </div>
      <div>
        <h4>Connect</h4>
        <div className="footer-social">
          <a className="icon" href="#" aria-label="Facebook">
            <svg viewBox="0 0 24 24">
              <path d="M15 3h4V0h-4c-3.9 0-7 3.1-7 7v3H5v4h3v10h4V14h3.1l.9-4H12V7c0-1.1.9-2 2-2z"/>
            </svg>
          </a>
          <a className="icon" href="#" aria-label="Twitter">
            <svg viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a className="icon" href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Contact Component
export default function ContactV1() {
  return (
    <div>
      <style>{`
        /* ===== TOKENS (copied from service template) ===== */
        :root {
          --primary: #5DD39E;
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
        body {
          font: 16px/1.6 var(--font-sans);
          color: var(--text);
        }
        
        /* Desktop body display block */
        @media (min-width: 768px) {
          body {
            display: block;
          }
        }
        h1, h2, h3, h4 {
          font-family: var(--font-heading);
          color: var(--text);
        }
        a {
          text-decoration: none;
          color: var(--primary);
        }
        img {
          max-width: 100%;
          display: block;
        }

        /* ===== NAVIGATION ===== */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          padding: 1rem;
          border-bottom: 1px solid #ddd;
          position: relative;
          z-index: 100;
        }
        nav .logo {
          font-size: 1.5rem;
          font-weight: 700;
        }
        nav .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.6rem;
          cursor: pointer;
        }
        nav ul {
          list-style: none;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        nav li {
          position: relative;
        }
        nav li:hover > ul {
          display: block;
        }
        nav li > ul {
          display: none;
          position: absolute;
          top: 2.5rem;
          left: 0;
          background: #fff;
          border: 1px solid #ddd;
          padding: 0.5rem 0;
          min-width: 10rem;
        }
        nav li > ul li {
          padding: 0.5rem 1rem;
        }
        nav .nav-links > li > a {
          padding: 0.5rem;
          color: #000;
        }
        nav .contact-phone {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        nav .cta {
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          nav .hamburger {
            display: block;
          }
          nav ul {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: #fff;
            border-bottom: 1px solid #ddd;
          }
          nav ul.open {
            display: flex;
          }
          nav li {
            padding: 0.75rem;
            text-align: center;
          }
        }

        /* ===== GENERIC SECTIONS ===== */
        .container {
          max-width: 1100px;
          margin: auto;
          padding: 20px;
        }

        /* ===== HERO ===== */
        .hero {
          text-align: center;
          padding-top: 110px;
        }
        .hero p {
          max-width: 420px;
          margin: 0.5rem auto 2rem;
        }
        .btn-primary {
          background: var(--primary);
          color: #fff;
          padding: 0.75rem 1.75rem;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease-in-out;
          display: inline-block;
        }
        .btn-primary:hover {
          opacity: 0.9;
        }

        /* ===== CONTACT INFO GRID ===== */
        .contact-grid-info {
          display: grid;
          gap: 1.75rem;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          margin-top: 3rem;
        }
        .card {
          background: #fff;
          padding: 2rem 1.5rem;
          text-align: center;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .card i {
          font-size: 2rem;
          color: var(--primary);
          margin-bottom: 0.6rem;
        }
        .card h3 {
          margin-bottom: 0.25rem;
          font-size: 1.15rem;
        }
        .card p {
          margin: 0.25rem 0 0;
          font-size: 0.95rem;
        }

        /* ===== CONTACT FORM ===== */
        #contact-form-section {
          background: #fff;
          padding: 2.5rem 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          max-width: 720px;
          margin: 4rem auto;
        }
        #contact-form-section h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.25rem;
        }
        label {
          font-weight: 600;
          margin-bottom: 0.4rem;
        }
        input,
        textarea {
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font: inherit;
        }
        textarea {
          min-height: 160px;
          resize: vertical;
        }

        /* ===== MAP ===== */
        .map-wrapper {
          position: relative;
          width: 100%;
          margin: 3.5rem 0 0;
        }
        .map-wrapper iframe {
          width: 100%;
          height: 400px;
          border: 0;
        }

        /* ===== OPERATING HOURS ===== */
        .hours-table {
          width: 100%;
          max-width: 480px;
          margin: 0 auto 4rem;
          border-collapse: collapse;
        }
        .hours-table th,
        .hours-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #eee;
          text-align: left;
          font-size: 0.95rem;
        }
        .hours-table th {
          background: var(--primary);
          color: #fff;
          font-weight: 600;
        }
        .hours-table caption {
          caption-side: top;
          font-weight: 700;
          margin-bottom: 0.75rem;
          text-align: left;
        }

        /* ===== SECONDARY CTA ===== */
        .secondary-cta {
          text-align: center;
          margin: 4rem 0 6rem;
        }
        .secondary-cta a {
          font-weight: 600;
          font-size: 1.1rem;
        }

        /* ===== FOOTER ===== */
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
          color: #fff;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        footer a {
          color: #ccc;
          display: block;
          margin: 0.35rem 0;
          font-size: 0.9rem;
        }
        .footer-social {
          display: flex;
          gap: 14px;
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
          transition: 0.25s;
        }
        .footer-social .icon svg {
          fill: #fff;
          width: 20px;
          height: 20px;
        }
        .footer-social .icon:hover {
          background: var(--primary);
          border-color: var(--primary);
        }
        /* ensure font-awesome icon alignment if used */
        .footer-social .icon i {
          color: #fff;
          font-size: 18px;
        }

        /* ===== BUTTON FULL-WIDTH ON SMALL ===== */
        @media (max-width: 600px) {
          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700&family=Roboto:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        integrity="sha512-9KSk2qde2+ftXyP42X2u5S/3lfHJjXywcmATgZnKe3gZCfr3HairziO+z965C2Q3VF3Zr5y4V7dejvVlsL5MIg=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <NavBar tokens={contactTokens} />
      <Hero tokens={contactTokens} />
      <ContactGrid tokens={contactTokens} />
      <ContactForm tokens={contactTokens} />
      <Map tokens={contactTokens} />
      <HoursTable tokens={contactTokens} />
      <SecondaryCTA tokens={contactTokens} />
      <Footer tokens={contactTokens} />
    </div>
  );
}