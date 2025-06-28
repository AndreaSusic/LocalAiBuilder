import React from "react";
import { useTheme } from "../../lib/theme";

export default function Footer({ data }) {
  const { colors, fonts } = useTheme();
  
  return (
    <footer style={{
      padding: '3rem 2rem 1rem',
      backgroundColor: colors.text,
      color: 'white',
      fontFamily: fonts.body
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{
              fontFamily: fonts.heading,
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: colors.primary,
              fontWeight: 'bold'
            }}>
              {data.practice}
            </h3>
            <p style={{
              lineHeight: '1.6',
              opacity: 0.9,
              whiteSpace: 'pre-line'
            }}>
              {data.address}
            </p>
          </div>
          <div>
            <h4 style={{
              fontFamily: fonts.heading,
              fontSize: '1.2rem',
              marginBottom: '1rem',
              color: colors.primary,
              fontWeight: 'bold'
            }}>
              Services
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {data.services.map((service, index) => (
                <li key={index} style={{
                  marginBottom: '0.5rem',
                  opacity: 0.9
                }}>
                  {service}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{
              fontFamily: fonts.heading,
              fontSize: '1.2rem',
              marginBottom: '1rem',
              color: colors.primary,
              fontWeight: 'bold'
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {data.links.map((link, index) => (
                <li key={index} style={{
                  marginBottom: '0.5rem'
                }}>
                  <a href="#" style={{
                    color: 'white',
                    textDecoration: 'none',
                    opacity: 0.9,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '1'}
                  onMouseOut={(e) => e.target.style.opacity = '0.9'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '1rem',
          textAlign: 'center',
          opacity: 0.7,
          fontSize: '0.9rem'
        }}>
          © 2025 {data.practice}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}