import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ReviewsSection() {
  const siteData = useContext(SiteDataContext) || {};
  const { google_profile = {}, reviews = [], rating = null, ai_customization = {}, team = [] } = siteData;
  
  // Debug logging to understand data structure
  console.log('🔍 ReviewsSection - Full siteData:', siteData);
  console.log('🔍 ReviewsSection - google_profile:', google_profile);
  console.log('🔍 ReviewsSection - google_profile.reviews:', google_profile?.reviews);
  console.log('🔍 ReviewsSection - reviews prop:', reviews);
  console.log('🔍 ReviewsSection - team data:', team);
  
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

  // Use authentic GBP reviews from google_profile.reviews if available
  const gbpReviews = google_profile?.reviews || reviews || [];
  console.log('🔍 ReviewsSection - GBP reviews found:', gbpReviews.length, 'reviews');
  
  const testimonials = gbpReviews && gbpReviews.length > 0 
    ? gbpReviews.map(review => ({
        text: review.text,
        author: review.author_name,
        stars: "★".repeat(review.rating) + "☆".repeat(5 - review.rating)
      }))
    : defaultTestimonials;

  const reviewsTitle = ai_customization.reviewsTitle || `What Our ${ai_customization.reviewerLabel || 'Clients'} Say`;
  
  // Check if team data exists and has members
  const hasTeamData = team && Array.isArray(team) && team.length > 0;

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

      {/* Team - Only show if team data exists */}
      {hasTeamData && (
        <section className="team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-member">
                <img src={member.photo || 'https://plus.unsplash.com/premium_photo-1681966962522-546f370bc98e?w=900&auto=format&fit=crop&q=60'} alt={member.name} />
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}