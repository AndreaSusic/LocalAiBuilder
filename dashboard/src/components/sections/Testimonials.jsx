import React from "react";
import { useTheme } from "../../lib/theme";

export default function Testimonials({ data }) {
  const { colors, fonts } = useTheme();
  
  const renderStars = (count) => {
    return "★".repeat(count) + "☆".repeat(5 - count);
  };
  
  return (
    <section style={{
      padding: '4rem 2rem',
      backgroundColor: colors.bgDark,
      fontFamily: fonts.body
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          color: colors.text,
          fontFamily: fonts.heading,
          fontSize: '2.5rem',
          marginBottom: '3rem',
          fontWeight: 'bold'
        }}>
          What Our Patients Say
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {data.map((testimonial, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: colors.radius,
                boxShadow: colors.shadow,
                textAlign: 'center'
              }}
            >
              <div style={{
                color: '#FFD700',
                fontSize: '1.5rem',
                marginBottom: '1rem'
              }}>
                {renderStars(testimonial.stars)}
              </div>
              <p style={{
                color: colors.text,
                fontSize: '1.1rem',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}