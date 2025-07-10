import React, { useContext, useEffect, useState } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';

// Color contrast utility functions
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

const darkenColor = (hex, factor) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.max(0, Math.floor(rgb.r * (1 - factor)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - factor)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - factor)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const lightenColor = (hex, factor) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export default function ColorContrastAnalyzer({ isVisible = false, onClose }) {
  const data = useContext(SiteDataContext);
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    if (data.colours && data.colours.length >= 2) {
      analyzeColors();
    }
  }, [data.colours]);
  
  const analyzeColors = () => {
    const primaryColor = data.colours[0] || '#000000';
    const secondaryColor = data.colours[1] || '#ffffff';
    
    // Common background and text combinations
    const combinations = [
      { bg: '#ffffff', text: primaryColor, context: 'Primary text on white background' },
      { bg: '#ffffff', text: secondaryColor, context: 'Secondary text on white background' },
      { bg: primaryColor, text: '#ffffff', context: 'White text on primary background' },
      { bg: primaryColor, text: '#000000', context: 'Black text on primary background' },
      { bg: secondaryColor, text: '#000000', context: 'Black text on secondary background' },
      { bg: secondaryColor, text: '#ffffff', context: 'White text on secondary background' },
      { bg: '#f8f9fa', text: primaryColor, context: 'Primary text on light gray background' },
      { bg: '#f8f9fa', text: secondaryColor, context: 'Secondary text on light gray background' }
    ];
    
    const results = combinations.map(combo => {
      const ratio = getContrastRatio(combo.bg, combo.text);
      const passesAA = ratio >= 4.5;
      const passesAAA = ratio >= 7;
      const passesLargeAA = ratio >= 3;
      
      let recommendation = null;
      if (!passesAA) {
        // Generate suggestion for better contrast
        const darkenedText = darkenColor(combo.text, 0.3);
        const lightenedText = lightenColor(combo.text, 0.3);
        const darkenedRatio = getContrastRatio(combo.bg, darkenedText);
        const lightenedRatio = getContrastRatio(combo.bg, lightenedText);
        
        if (darkenedRatio >= 4.5) {
          recommendation = {
            type: 'darken',
            color: darkenedText,
            ratio: darkenedRatio
          };
        } else if (lightenedRatio >= 4.5) {
          recommendation = {
            type: 'lighten',
            color: lightenedText,
            ratio: lightenedRatio
          };
        }
      }
      
      return {
        ...combo,
        ratio: Math.round(ratio * 100) / 100,
        passesAA,
        passesAAA,
        passesLargeAA,
        grade: passesAAA ? 'AAA' : passesAA ? 'AA' : passesLargeAA ? 'AA Large' : 'Fail',
        recommendation
      };
    });
    
    setAnalysis(results);
  };
  
  if (!isVisible || !analysis) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#333',
            margin: 0
          }}>
            Color Accessibility Analysis
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>
            Current Color Scheme
          </h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: data.colours[0],
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}></div>
              <span>Primary: {data.colours[0]}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: data.colours[1],
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}></div>
              <span>Secondary: {data.colours[1]}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>
            Contrast Analysis Results
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysis.map((result, index) => (
              <div key={index} style={{
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: result.passesAA ? '#f0f8f0' : '#fff8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '30px',
                      backgroundColor: result.bg,
                      color: result.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}>
                      Aa
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      {result.context}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span style={{ fontWeight: '600' }}>
                      {result.ratio}:1
                    </span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: result.passesAA ? '#4caf50' : '#f44336',
                      color: 'white'
                    }}>
                      {result.grade}
                    </span>
                  </div>
                </div>
                
                {result.recommendation && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    <strong>Suggestion:</strong> Try {result.recommendation.color} for better contrast 
                    (would achieve {Math.round(result.recommendation.ratio * 100) / 100}:1 ratio)
                    <div style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      backgroundColor: result.recommendation.color,
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginLeft: '0.5rem',
                      verticalAlign: 'middle'
                    }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>WCAG Guidelines:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>AA: 4.5:1 minimum for normal text</li>
            <li>AA Large: 3:1 minimum for large text (18pt+ or 14pt+ bold)</li>
            <li>AAA: 7:1 enhanced contrast for normal text</li>
          </ul>
        </div>
      </div>
    </div>
  );
}