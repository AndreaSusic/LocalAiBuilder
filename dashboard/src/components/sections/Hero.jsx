import React from "react";
import { useTheme } from "../../lib/theme";

export default function Hero({ data }) {
  const { colors } = useTheme();
  
  return (
    <section 
      className="hero" 
      style={{ 
        "--primary": colors.primary,
        backgroundImage: `url(${data.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          {data.title}
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          {data.subtitle}
        </p>
        <button 
          className="btn-primary" 
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {data.ctaLabel}
        </button>
      </div>
    </section>
  );
}