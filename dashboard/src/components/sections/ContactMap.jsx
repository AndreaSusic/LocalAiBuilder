import React from "react";
import { useTheme } from "../../lib/theme";

export default function ContactMap({ data }) {
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
          {data.headline}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: colors.bgLight,
            padding: '2rem',
            borderRadius: colors.radius,
            boxShadow: colors.shadow
          }}>
            <h3 style={{
              color: colors.primary,
              fontFamily: fonts.heading,
              fontSize: '1.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}>
              Visit Us
            </h3>
            <p style={{
              color: colors.text,
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              {data.address}
            </p>
            <button style={{
              backgroundColor: colors.primary,
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: colors.radius,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Get Directions
            </button>
          </div>
          <div style={{
            borderRadius: colors.radius,
            overflow: 'hidden',
            boxShadow: colors.shadow,
            height: '300px'
          }}>
            <iframe
              src={data.map}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}