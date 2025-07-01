import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function AboutSection() {
  const { company_name, city = 'Austin', images = [] } = useContext(SiteDataContext) || {};
  
  const aboutImage = images[1] || 'https://plus.unsplash.com/premium_photo-1674575134867-cb7623d39bdb?w=900&auto=format&fit=crop&q=60';
  
  return (
    <>
      {/* Location & Expertise */}
      <section className="location-section">
        <div className="location-content">
          <div className="location-image">
            <img src={aboutImage} alt="Dentistry Services" />
          </div>
          <div className="location-text">
            <h2>Serving {city}'s Smiles with Excellence</h2>
            <p>At {company_name || 'Your Practice'}, we're proud to be part of the {city} community. From our state-of-the-art facilities in downtown {city} to our friendly, highly trained staff, every element is designed to put you at ease and deliver world-class care.</p>
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
    </>
  );
}