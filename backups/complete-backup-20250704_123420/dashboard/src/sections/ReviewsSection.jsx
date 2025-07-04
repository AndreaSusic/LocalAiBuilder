import React, { useContext } from 'react';
import SiteDataContext from '../context/SiteDataContext';
import Editable from '../components/Editable.jsx';

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

  // Try multiple paths for GBP reviews data
  const gbpReviews = google_profile?.reviews || reviews || siteData.reviews || [];
  console.log('🔍 ReviewsSection - GBP reviews found:', gbpReviews.length, 'reviews');
  console.log('🔍 ReviewsSection - First review sample:', gbpReviews[0]);
  
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
        <Editable as="h2" path="reviewsTitle">{reviewsTitle}</Editable>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <Editable as="p" path={`testimonialText${index}`}>"{testimonial.text}"</Editable>
              <div className="stars">{testimonial.stars}</div>
              <Editable as="p" path={`testimonialAuthor${index}`}><strong>— {testimonial.author}</strong></Editable>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section - REMOVED as requested by user (can be stored in files but not displayed) */}
    </>
  );
}