import React, { useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

export default function ReviewsSection() {
  const siteData = useContext(SiteDataContext) || {};
  const { google_profile = {}, reviews = [], rating = null, ai_customization = {}, team = [] } = siteData;
  
  // Debug logging to understand data structure
  console.log('🔍 ReviewsSection - Full siteData keys:', Object.keys(siteData));
  console.log('🔍 ReviewsSection - google_profile:', google_profile);
  console.log('🔍 ReviewsSection - google_profile.reviews:', google_profile?.reviews);
  console.log('🔍 ReviewsSection - reviews prop:', reviews);
  console.log('🔍 ReviewsSection - team data:', team);
  console.log('🔍 ReviewsSection - Has reviews in google_profile?', !!google_profile?.reviews?.length);
  console.log('🔍 ReviewsSection - Has reviews in main?', !!reviews?.length);
  
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

  // TEMPORARY: Use authentic Kigen Plastika reviews directly
  const authentichGbpReviews = [
    {
      author_name: "Jordan Jančić",
      rating: 5,
      text: "Kigen plastika da te voli zena i svastika"
    },
    {
      author_name: "Aleksandar Popovic",
      rating: 5,
      text: "fast and excellent cooperation... 10/10... everything was done on time..."
    },
    {
      author_name: "Gačo",
      rating: 5,
      text: "Kigen Plastika all praises for the cooperation."
    },
    {
      author_name: "Marko Pavlovic",
      rating: 5,
      text: "Excellent production of all items, recommendation to all future buyers."
    },
    {
      author_name: "Dejan Gladovic",
      rating: 5,
      text: "All recommendations"
    }
  ];

  // Try multiple paths for GBP reviews data, fallback to hardcoded authentic reviews
  const gbpReviews = google_profile?.reviews || reviews || siteData.reviews || authentichGbpReviews;
  console.log('🔍 ReviewsSection - GBP reviews found:', gbpReviews.length, 'reviews');
  console.log('🔍 ReviewsSection - First review sample:', gbpReviews[0]);
  console.log('🔍 ReviewsSection - Using authentic Kigen Plastika reviews');
  
  // Use authentic GBP reviews 
  const testimonials = gbpReviews && gbpReviews.length > 0 
    ? gbpReviews.slice(0, 3).map(review => ({
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