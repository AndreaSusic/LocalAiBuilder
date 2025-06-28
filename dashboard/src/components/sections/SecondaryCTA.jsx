import React from "react";
import { useTheme } from "../../lib/theme.jsx";

export default function SecondaryCTA({ data }) {
  const { colors, fonts } = useTheme();
  
  return (
    <section style={{
      padding: '4rem 2rem',
      backgroundColor: colors.primary,
      color: 'white',
      textAlign: 'center',
      fontFamily: fonts.body
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: fonts.heading,
          fontSize: '2.5rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {data.headline}
        </h2>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          opacity: 0.9,
          lineHeight: '1.6'
        }}>
          {data.sub}
        </p>
        <button style={{
          backgroundColor: 'white',
          color: colors.primary,
          padding: '1rem 2rem',
          border: 'none',
          borderRadius: colors.radius,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: colors.shadow
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {data.button}
        </button>
      </div>
    </section>
  );
}