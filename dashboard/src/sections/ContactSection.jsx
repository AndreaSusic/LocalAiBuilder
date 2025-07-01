import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ContactSection() {
  const { google = {}, company_name } = useContext(SiteDataContext) || {};
  
  const phone = google.phone || '+1 234 567 89';
  const email = google.email || 'info@yourwebsite.com';
  const address = google.address || '123 Main St, Austin, TX 78701';
  
  return (
    <>
      {/* Contact + Map */}
      <section className="contact-form">
        <h2>Contact Us</h2>
        <div className="contact-grid">
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <input type="tel" placeholder="Your Phone" />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit">Send Message</button>
          </form>
          <div className="map-container">
            <iframe
              src="https://maps.google.com/maps?q=dental%20clinic%20austin&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: '4px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="secondary-cta">
        <h2>Ready to Schedule Your Visit?</h2>
        <p>Join thousands of satisfied patients who trust {company_name || 'us'} with their dental care.</p>
        <button className="btn-accent">Book Appointment</button>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <h4>Contact Info</h4>
            <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            <a href={`mailto:${email}`}>{email}</a>
            <p style={{ color: '#ccc', fontSize: '0.9rem', marginTop: '0.5rem' }}>{address}</p>
          </div>
          <div>
            <h4>Services</h4>
            <a href="#">General Dentistry</a>
            <a href="#">Cosmetic Veneers</a>
            <a href="#">Invisalign®</a>
            <a href="#">Emergency Care</a>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#">About Us</a>
            <a href="#">Patient Forms</a>
            <a href="#">Insurance</a>
            <a href="#">Reviews</a>
          </div>
          <div>
            <h4>Follow Us</h4>
            <div className="footer-social">
              <a href="#" className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M18.77 7.46H15.5v-1.4c0-.896.62-1.1 1.06-1.1h2.13V2.26h-2.92C13.04 2.26 11.5 3.78 11.5 6.5v.96H8.5v2.7h3V22h3.27V10.16h2.45l.55-2.7z"/>
                </svg>
              </a>
              <a href="#" className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.16c-3.26 0-3.67.012-4.95.072-1.28.06-2.16.264-2.93.564a5.9 5.9 0 0 0-2.13 1.39 5.9 5.9 0 0 0-1.39 2.13C.264 7.29.06 8.17 0 9.45.012 10.73 0 11.14 0 12s.012 1.27.072 2.55c.06 1.28.264 2.16.564 2.93a5.9 5.9 0 0 0 1.39 2.13 5.9 5.9 0 0 0 2.13 1.39c.77.3 1.65.504 2.93.564C8.33 21.988 8.74 22 12 22s3.67-.012 4.95-.072c1.28-.06 2.16-.264 2.93-.564a5.9 5.9 0 0 0 2.13-1.39 5.9 5.9 0 0 0 1.39-2.13c.3-.77.504-1.65.564-2.93.06-1.28.072-1.69.072-4.95s-.012-3.67-.072-4.95c-.06-1.28-.264-2.16-.564-2.93a5.9 5.9 0 0 0-1.39-2.13 5.9 5.9 0 0 0-2.13-1.39C19.29.264 18.41.06 17.13 0 15.85.012 15.44 0 12 0 8.56 0 8.15.012 6.87.072 5.59.132 4.71.336 3.94.636a5.9 5.9 0 0 0-2.13 1.39A5.9 5.9 0 0 0 .422 4.16C.122 4.93-.082 5.81-.142 7.09-.154 8.37-.166 8.78-.166 12.12s.012 3.75.072 5.03c.06 1.28.264 2.16.564 2.93a5.9 5.9 0 0 0 1.39 2.13 5.9 5.9 0 0 0 2.13 1.39c.77.3 1.65.504 2.93.564 1.28.06 1.69.072 5.03.072s3.75-.012 5.03-.072c1.28-.06 2.16-.264 2.93-.564a5.9 5.9 0 0 0 2.13-1.39 5.9 5.9 0 0 0 1.39-2.13c.3-.77.504-1.65.564-2.93.06-1.28.072-1.69.072-5.03s-.012-3.75-.072-5.03zm-5.03 13.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm5.2-9.06c-.65 0-1.17-.52-1.17-1.17s.52-1.17 1.17-1.17 1.17.52 1.17 1.17-.52 1.17-1.17 1.17z"/>
                  <path d="M12 6.865c-2.84 0-5.135 2.295-5.135 5.135S9.16 17.135 12 17.135s5.135-2.295 5.135-5.135S14.84 6.865 12 6.865z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}