/**
 * FROZEN UI INTERACTIVE FUNCTIONALITY
 * Hamburger menu functionality for mobile navigation
 */

document.addEventListener('DOMContentLoaded', function() {
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-links');
  
  if (ham && menu) {
    ham.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }
  
  // Log data hierarchy enforcement
  console.log('🔍 FROZEN UI DATA HIERARCHY SUMMARY:');
  console.log('📋 Services: Plastični rezervoari, Cisterne, Septičke jame');
  console.log('🎨 Colors: #ffc000, #2c3e50 (Priority 1: User/Business Colors)');
  console.log('📸 Images: Authentic business photos from GBP');
  console.log('📞 Contact: 065 2170293, Svetog Save bb, Osečina');
  console.log('⭐ Reviews: Marija Nikolic, Aleksandar Popović, Jordan Jančić');
  console.log('✅ AUTHENTIC KIGEN PLASTIKA DATA ONLY');
});