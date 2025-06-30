import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ReviewsSection() {
  const { google = {} } = useContext(SiteDataContext) || {};
  
  // Default testimonials
  const defaultTestimonials = [
    {
      text: "Exceptional service and care. The staff made me feel comfortable throughout my visit.",
      author: "Sarah M.",
      rating: 5
    },
    {
      text: "Professional, friendly, and thorough. I highly recommend their services.",
      author: "John D.",
      rating: 5
    },
    {
      text: "Outstanding results and excellent customer service. Very pleased with my experience.",
      author: "Maria L.",
      rating: 5
    }
  ];

  // Use Google rating info if available
  const hasGoogleData = google.rating && google.reviews;
  const testimonials = hasGoogleData ? [
    {
      text: `Rated ${google.rating}/5 stars with ${google.reviews} reviews on Google`,
      author: "Google Reviews",
      rating: Math.round(google.rating)
    },
    ...defaultTestimonials.slice(1)
  ] : defaultTestimonials;

  return (
    <section className="testimonials">
      <h2>What Our Clients Say</h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial">
            <p>"{testimonial.text}"</p>
            <div className="stars">
              {"★".repeat(testimonial.rating)}
            </div>
            <strong>— {testimonial.author}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}