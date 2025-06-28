import React from "react";
import { useTheme } from "../../lib/theme";

export default function Services({ data }) {
  const { colors, fonts } = useTheme();
  
  return (
    <section style={{
      padding: '4rem 2rem',
      backgroundColor: 'white',
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
          Our Services
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {data.map((service, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: colors.bgLight,
                borderRadius: colors.radius,
                overflow: 'hidden',
                boxShadow: colors.shadow,
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img 
                src={service.img} 
                alt={service.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  color: colors.primary,
                  fontFamily: fonts.heading,
                  fontSize: '1.3rem',
                  marginBottom: '1rem',
                  fontWeight: 'bold'
                }}>
                  {service.title}
                </h3>
                <p style={{
                  color: colors.text,
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {service.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}