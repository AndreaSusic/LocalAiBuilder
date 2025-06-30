import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function AboutSection() {
  const { company_name = "Your Practice", city = "Austin", images = [], google = {} } = useContext(SiteDataContext) || {};
  
  const aboutImage = 
    images[1] ||
    google.photos?.[1] ||
    "https://plus.unsplash.com/premium_photo-1674575134867-cb7623d39bdb?w=900&auto=format&fit=crop&q=60";

  return (
    <section className="location-section">
      <div className="location-content">
        <div className="location-image">
          <img src={aboutImage} alt={`${company_name} Services`} />
        </div>
        <div className="location-text">
          <h2>Serving {city}'s Smiles with Excellence</h2>
          <p>
            At {company_name}, we're proud to be part of the {city} community.
            From our state-of-the-art facilities in downtown {city} to our
            friendly, highly trained staff, every element is designed to put
            you at ease and deliver world-class care.
          </p>
          <p>
            We combine the latest minimally invasive techniques with a warm,
            inviting atmosphere so you feel relaxed from the moment you walk
            in.
          </p>
          <p>
            Whether it's a routine cleaning or a complex cosmetic procedure,
            our team takes the time to listen to your needs, explain every
            step, and ensure you leave with a healthier, more confident smile.
          </p>
        </div>
      </div>
    </section>
  );
}