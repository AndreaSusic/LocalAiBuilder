/**
 * SERVICE IMAGE MATCHER
 * Automatically matches service images to their appropriate content using AI recognition
 */

(function() {
  'use strict';

  // Configuration
  const SERVICES = [
    'Plastični rezervoari',
    'Cisterne', 
    'Septičke jame'
  ];

  const SERVICE_SELECTORS = {
    'Plastični rezervoari': '.service-card:nth-child(1) img',
    'Cisterne': '.service-card:nth-child(2) img',
    'Septičke jame': '.service-card:nth-child(3) img'
  };

  // Get all current service images
  function getCurrentServiceImages() {
    const images = [];
    const serviceImages = document.querySelectorAll('.service-card img');
    
    serviceImages.forEach(img => {
      if (img.src && img.src.includes('googleapis.com')) {
        images.push(img.src);
      }
    });
    
    return images;
  }

  // Get all gallery images as potential matches
  function getGalleryImages() {
    const images = [];
    const galleryImages = document.querySelectorAll('.gallery-grid img');
    
    galleryImages.forEach(img => {
      if (img.src && img.src.includes('googleapis.com')) {
        images.push(img.src);
      }
    });
    
    return images;
  }

  // Update service images based on AI analysis
  function updateServiceImages(serviceMatches) {
    console.log('🔄 Updating service images with AI matches');
    
    Object.entries(serviceMatches).forEach(([service, imageUrl]) => {
      const selector = SERVICE_SELECTORS[service];
      if (selector) {
        const img = document.querySelector(selector);
        if (img && img.src !== imageUrl) {
          console.log(`📸 Updating ${service} image`);
          img.src = imageUrl;
          img.alt = service;
        }
      }
    });
  }

  // Perform AI analysis of service photos
  async function analyzeServicePhotos() {
    try {
      console.log('🔍 Starting service photo analysis');
      
      // Get all available photos from gallery
      const availablePhotos = getGalleryImages();
      
      if (availablePhotos.length === 0) {
        console.log('⚠️ No gallery photos available for analysis');
        return;
      }
      
      console.log(`📸 Found ${availablePhotos.length} photos to analyze`);
      console.log(`🏷️ Matching against ${SERVICES.length} services`);
      
      // Call the image recognition API
      const response = await fetch('/api/analyze-service-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: availablePhotos,
          services: SERVICES
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.serviceMatches) {
        console.log('✅ AI analysis complete');
        console.log('🎯 Service matches:', data.serviceMatches);
        
        // Update the service images with AI-matched photos
        updateServiceImages(data.serviceMatches);
        
        // Show success notification
        showNotification('Service images updated with AI matching', 'success');
      } else {
        console.log('⚠️ AI analysis failed:', data.error);
        showNotification('Image analysis failed', 'error');
      }
      
    } catch (error) {
      console.error('❌ Service photo analysis error:', error);
      showNotification('Error analyzing service photos', 'error');
    }
  }

  // Show notification to user
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      ${type === 'success' ? 'background-color: #4CAF50;' : ''}
      ${type === 'error' ? 'background-color: #F44336;' : ''}
      ${type === 'info' ? 'background-color: #2196F3;' : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Initialize when DOM is ready
  function init() {
    console.log('🚀 Service Image Matcher initialized');
    
    // Wait for images to load before analyzing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(analyzeServicePhotos, 2000); // Wait 2 seconds for images to load
      });
    } else {
      setTimeout(analyzeServicePhotos, 2000);
    }
  }

  // Start the system
  init();

})();