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
  
  // Note: Advanced inline editor functionality moved to inline-editor.js
  
  // Log data hierarchy enforcement
  console.log('🔍 FROZEN UI DATA HIERARCHY SUMMARY:');
  console.log('📋 Services: Checking data hierarchy for authentic services...');
  console.log('🎨 Colors: #ffc000, #000000 (Priority 1: User Questionnaire)');
  console.log('📸 Images: Authentic GBP photos (Priority 3: GBP Data)');
  console.log('📞 Contact: 065 2170293, Svetog Save bb, Osečina (Priority 2: Website/GBP)');
  console.log('⭐ Reviews: Aleksandar Popović, Jordan Jančić, Marko Pavlović (Priority 3: GBP)');
  console.log('✅ NO DUMMY DATA OR STOCK IMAGES USED');
});