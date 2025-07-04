import tinycolor from 'tinycolor2';

/**
 * Color Guard utility that enforces WCAG contrast ratios and prevents dark section clashes
 */
export function enforceColors() {
  console.log('🎨 Color Guard: Starting color enforcement...');
  
  // 1. Fix text contrast for all sections
  document.querySelectorAll('.section, section').forEach(sec => {
    const bg = tinycolor(getComputedStyle(sec).backgroundColor);
    
    // Skip if background is transparent/invalid
    if (!bg.isValid() || bg.getAlpha() === 0) return;
    
    sec.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, a, span').forEach(el => {
      const fg = tinycolor(getComputedStyle(el).color);
      
      if (fg.isValid() && tinycolor.readability(bg, fg) < 4.5) {
        const newColor = bg.isDark() ? '#ffffff' : '#000000';
        el.style.color = newColor;
        console.log(`🔧 Color Guard: Fixed contrast for element, bg: ${bg.toHexString()}, new color: ${newColor}`);
      }
    });
  });

  // 2. Avoid near-black neighbors (sections with similar dark backgrounds)
  const sections = Array.from(document.querySelectorAll('.section, section'));
  sections.forEach((sec, i) => {
    const next = sections[i + 1];
    if (!next) return;
    
    const c1 = tinycolor(getComputedStyle(sec).backgroundColor);
    const c2 = tinycolor(getComputedStyle(next).backgroundColor);
    
    // Skip if colors are invalid
    if (!c1.isValid() || !c2.isValid()) return;
    
    // Calculate ΔL* (difference in lightness)
    const dL = Math.abs(c1.toHsl().l * 100 - c2.toHsl().l * 100);
    
    // If both are dark and too similar, lighten the second one
    if (c1.isDark() && c2.isDark() && dL < 10) {
      const lighterColor = tinycolor(c2).lighten(7).toHexString();
      next.style.backgroundColor = lighterColor;
      console.log(`🔧 Color Guard: Fixed dark neighbor clash, lightened ${c2.toHexString()} to ${lighterColor}`);
    }
  });
  
  console.log('✅ Color Guard: Color enforcement complete');
}

/**
 * Initialize Color Guard - call this after React mounts
 */
export function initColorGuard() {
  // Run enforcement after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceColors);
  } else {
    enforceColors();
  }
  
  // Re-run on dynamic content changes (optional)
  const observer = new MutationObserver((mutations) => {
    let shouldRerun = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldRerun = true;
      }
    });
    if (shouldRerun) {
      setTimeout(enforceColors, 100); // Debounce
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}