import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ContactSection() {
  const { 
    company_name = "Your Practice",
    city = "Austin",
    google = {} 
  } = useContext(SiteDataContext) || {};
  
  // Use Google Business Profile data if available
  const phone = google.phone || "+1 234 567 89";
  const address = google.address || `123 Main Street, ${city}, TX 78701`;

  return (
    <>
      {/* Features */}
      <section className="features">
        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3>Expert Care</h3>
          <p>Experienced professionals dedicated to your health and comfort</p>
        </div>
        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>Modern Technology</h3>
          <p>State-of-the-art equipment for precise and comfortable treatment</p>
        </div>
        <div className="feature">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h3>Personalized Service</h3>
          <p>Tailored treatment plans designed specifically for your needs</p>
        </div>
      </section>

      {/* Team */}
      <section className="team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop" alt="Dr. Smith" />
            <h4>Dr. Sarah Smith</h4>
            <p>Lead Practitioner</p>
          </div>
          <div className="team-member">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop" alt="Dr. Johnson" />
            <h4>Dr. Michael Johnson</h4>
            <p>Specialist</p>
          </div>
          <div className="team-member">
            <img src="https://images.unsplash.com/photo-1594824804732-ca8c2b7def49?w=200&auto=format&fit=crop" alt="Lisa Wilson" />
            <h4>Lisa Wilson</h4>
            <p>Practice Manager</p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form">
        <h2>Contact Us</h2>
        <div className="contact-grid">
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="tel" placeholder="Phone Number" />
            <textarea placeholder="Message" required></textarea>
            <button type="submit">Send Message</button>
          </form>
          <div className="map-container">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(address)}`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${company_name} Location`}
            ></iframe>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="secondary-cta">
        <h2>Ready to Get Started?</h2>
        <p>Schedule your appointment today and experience the difference quality care makes.</p>
        <button className="btn-accent">Book Appointment</button>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-grid">
          <div>
            <h4>{company_name}</h4>
            <a href={`tel:${phone}`}>{phone}</a>
            <a href="#">{address}</a>
            <div className="footer-social">
              <a href="#" className="icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4>Services</h4>
            <a href="#">General Care</a>
            <a href="#">Cosmetic Procedures</a>
            <a href="#">Emergency Services</a>
            <a href="#">Consultation</a>
          </div>
          <div>
            <h4>Information</h4>
            <a href="#">About Us</a>
            <a href="#">Insurance</a>
            <a href="#">New Patients</a>
            <a href="#">Reviews</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href={`tel:${phone}`}>{phone}</a>
            <a href="#">{address}</a>
            <a href="#">Hours: Mon-Fri 8AM-6PM</a>
          </div>
        </div>
      </footer>
    </>
  );
}