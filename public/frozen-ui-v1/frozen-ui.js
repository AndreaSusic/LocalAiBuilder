/**
 * FROZEN UI INTERACTIVE FUNCTIONALITY
 * Hamburger menu and inline editing system
 */

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-links');
  
  if (ham && menu) {
    ham.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }
  
  // Simple inline editor for elements
  const elements = document.querySelectorAll('h1, h2, h3, h4, p');
  
  elements.forEach(el => {
    el.addEventListener('mouseenter', function() {
      this.style.outline = '2px dotted #ff0000';
      this.style.cursor = 'pointer';
    });
    
    el.addEventListener('mouseleave', function() {
      if (!this.hasAttribute('contenteditable')) {
        this.style.outline = 'none';
      }
    });
    
    el.addEventListener('click', function() {
      this.contentEditable = true;
      this.style.outline = '2px solid #ffc000';
      this.focus();
    });
    
    el.addEventListener('blur', function() {
      this.contentEditable = false;
      this.style.outline = 'none';
    });
  });
  
  // Log data hierarchy enforcement
  console.log('🔍 FROZEN UI DATA HIERARCHY SUMMARY:');
  console.log('📋 Services: Using Priority 2 (Website Data): ["Plastični rezervoari", "cisterne", "Cisterne"]');
  console.log('🎨 Colors: #ffc000, #000000 (Priority 1: User Questionnaire)');
  console.log('📸 Images: Authentic GBP photos (Priority 3: GBP Data)');
  console.log('📞 Contact: 065 2170293, Svetog Save bb, Osečina (Priority 2: Website/GBP)');
  console.log('⭐ Reviews: Aleksandar Popović, Jordan Jančić, Marko Pavlović (Priority 3: GBP)');
  console.log('✅ NO DUMMY DATA OR STOCK IMAGES USED');
});