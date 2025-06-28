import React from "react";
import { useTheme } from "../../lib/theme";

export default function Team({ data }) {
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
          Meet Our Team
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {data.map((member, index) => (
            <div 
              key={index}
              style={{
                textAlign: 'center',
                backgroundColor: colors.bgLight,
                padding: '2rem',
                borderRadius: colors.radius,
                boxShadow: colors.shadow,
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img 
                src={member.img} 
                alt={member.name}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '1rem',
                  border: `3px solid ${colors.primary}`
                }}
              />
              <h3 style={{
                color: colors.text,
                fontFamily: fonts.heading,
                fontSize: '1.3rem',
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                {member.name}
              </h3>
              <p style={{
                color: colors.primary,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}