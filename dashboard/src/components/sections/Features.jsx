import React from "react";
import { useTheme } from "../../lib/theme.jsx";

export default function Features({ data }) {
  const { colors, fonts } = useTheme();
  
  return (
    <section style={{
      padding: '4rem 2rem',
      backgroundColor: colors.bgLight,
      fontFamily: fonts.body
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {data.map((feature, index) => (
            <div 
              key={index} 
              style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: colors.radius,
                boxShadow: colors.shadow,
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                color: colors.primary,
                fontFamily: fonts.heading,
                fontSize: '1.5rem',
                marginBottom: '1rem',
                fontWeight: 'bold'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: colors.text,
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}