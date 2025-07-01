import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ReviewsSection() {
  const { google_profile = {}, ai_customization = {} } = useContext(SiteDataContext) || {};
  
  const defaultTestimonials = [
    {
      text: "The staff at this practice are absolutely amazing. They made me feel comfortable and explained everything clearly.",
      author: "Sarah M.",
      stars: "★★★★★"
    },
    {
      text: "I've been coming here for years and wouldn't trust my dental care to anyone else. Highly recommend!",
      author: "Michael R.",
      stars: "★★★★★"
    },
    {
      text: "Professional, friendly, and top-notch care. The results exceeded my expectations.",
      author: "Lisa K.",
      stars: "★★★★★"
    }
  ];

  // Use GBP reviews if available, with proper star formatting
  const testimonials = google_profile.reviews && google_profile.reviews.length > 0 
    ? google_profile.reviews.map(review => ({
        text: review.text,
        author: review.author,
        stars: "★".repeat(review.rating) + "☆".repeat(5 - review.rating)
      }))
    : defaultTestimonials;

  const reviewsTitle = ai_customization.reviewsTitle || `What Our ${ai_customization.reviewerLabel || 'Clients'} Say`;

  return (
    <>
      {/* Testimonials */}
      <section className="testimonials">
        <h2>{reviewsTitle}</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <p>"{testimonial.text}"</p>
              <div className="stars">{testimonial.stars}</div>
              <p><strong>— {testimonial.author}</strong></p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?w=900&auto=format&fit=crop&q=60" alt="Dr. Smith" />
            <h4>Dr. Jane Smith</h4>
            <p>Lead Dentist, DDS</p>
          </div>
          <div className="team-member">
            <img src="https://plus.unsplash.com/premium_photo-1674575134867-cb7623d39bdb?w=900&auto=format&fit=crop&q=60" alt="Dr. Johnson" />
            <h4>Dr. Mike Johnson</h4>
            <p>Cosmetic Specialist</p>
          </div>
          <div className="team-member">
            <img src="https://plus.unsplash.com/premium_photo-1681997265061-0f44c165ac67?w=900&auto=format&fit=crop&q=60" alt="Sarah" />
            <h4>Sarah Wilson</h4>
            <p>Dental Hygienist</p>
          </div>
        </div>
      </section>
    </>
  );
}