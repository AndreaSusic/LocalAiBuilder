// Color contrast analysis and accessibility checker
// This module analyzes color combinations and suggests improvements for WCAG compliance

// Convert hex color to RGB values
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance of a color
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if contrast ratio meets WCAG standards
function isAccessible(contrastRatio, isLargeText = false) {
  if (isLargeText) {
    return {
      AA: contrastRatio >= 3,
      AAA: contrastRatio >= 4.5
    };
  } else {
    return {
      AA: contrastRatio >= 4.5,
      AAA: contrastRatio >= 7
    };
  }
}

// Generate accessible color alternatives
function generateAccessibleColors(baseColor, targetColor, isLargeText = false) {
  const minRatio = isLargeText ? 3 : 4.5;
  const suggestions = [];
  
  // Try darkening the target color
  for (let factor = 0.1; factor <= 0.9; factor += 0.1) {
    const darkened = darkenColor(targetColor, factor);
    if (getContrastRatio(baseColor, darkened) >= minRatio) {
      suggestions.push({
        color: darkened,
        type: 'darkened',
        factor: factor
      });
      break;
    }
  }
  
  // Try lightening the target color
  for (let factor = 0.1; factor <= 0.9; factor += 0.1) {
    const lightened = lightenColor(targetColor, factor);
    if (getContrastRatio(baseColor, lightened) >= minRatio) {
      suggestions.push({
        color: lightened,
        type: 'lightened',
        factor: factor
      });
      break;
    }
  }
  
  return suggestions;
}

// Darken a hex color by a factor (0-1)
function darkenColor(hex, factor) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.max(0, Math.floor(rgb.r * (1 - factor)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - factor)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - factor)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Lighten a hex color by a factor (0-1)
function lightenColor(hex, factor) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Analyze a complete color scheme
function analyzeColorScheme(colors) {
  const analysis = {
    primary: colors[0] || '#000000',
    secondary: colors[1] || '#ffffff',
    combinations: [],
    recommendations: []
  };
  
  // Common background colors to test against
  const backgrounds = ['#ffffff', '#f8f9fa', '#000000', colors[0], colors[1]];
  const textColors = ['#000000', '#333333', '#666666', '#ffffff', colors[0], colors[1]];
  
  backgrounds.forEach(bg => {
    textColors.forEach(text => {
      if (bg !== text) {
        const ratio = getContrastRatio(bg, text);
        const accessible = isAccessible(ratio);
        
        analysis.combinations.push({
          background: bg,
          text: text,
          ratio: Math.round(ratio * 100) / 100,
          passesAA: accessible.AA,
          passesAAA: accessible.AAA,
          grade: accessible.AAA ? 'AAA' : accessible.AA ? 'AA' : 'Fail'
        });
      }
    });
  });
  
  // Generate recommendations for failing combinations
  analysis.combinations
    .filter(combo => !combo.passesAA)
    .forEach(combo => {
      const suggestions = generateAccessibleColors(combo.background, combo.text);
      if (suggestions.length > 0) {
        analysis.recommendations.push({
          problem: `${combo.text} on ${combo.background} has poor contrast (${combo.ratio})`,
          solution: `Use ${suggestions[0].color} instead of ${combo.text}`,
          originalText: combo.text,
          suggestedText: suggestions[0].color,
          background: combo.background
        });
      }
    });
  
  return analysis;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getContrastRatio,
    isAccessible,
    analyzeColorScheme,
    generateAccessibleColors,
    darkenColor,
    lightenColor
  };
} else {
  // Browser environment
  window.ColorContrast = {
    getContrastRatio,
    isAccessible,
    analyzeColorScheme,
    generateAccessibleColors,
    darkenColor,
    lightenColor
  };
}