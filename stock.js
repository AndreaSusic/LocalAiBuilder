const fetch = require('node-fetch');

// Environment variables for API keys
const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
const PEXELS_KEY = process.env.PEXELS_KEY;

// Unsplash API wrapper
async function fetchUnsplashImages(query, count = 10) {
  if (!UNSPLASH_KEY) {
    console.warn('UNSPLASH_KEY not configured');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map(img => ({
      src: img.urls.regular,
      alt: img.alt_description || img.description || query,
      hiddenCredit: `Photo by ${img.user.name} on Unsplash`,
      origin: 'unsplash'
    }));
  } catch (error) {
    console.warn('Unsplash fetch failed:', error.message);
    return [];
  }
}

// Pexels API wrapper
async function fetchPexelsImages(query, count = 10) {
  if (!PEXELS_KEY) {
    console.warn('PEXELS_KEY not configured');
    return [];
  }
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.photos.map(img => ({
      src: img.src.large,
      alt: img.alt || query,
      hiddenCredit: `Photo by ${img.photographer} on Pexels`,
      origin: 'pexels'
    }));
  } catch (error) {
    console.warn('Pexels fetch failed:', error.message);
    return [];
  }
}

// Face detection filtering (simplified - requires face-api.js setup)
async function filterFaces(images) {
  // For now, return all images - face detection would require additional setup
  // In production, this would check for happy/neutral expressions > 0.6
  return images;
}

// Content-based filtering for faceless images
function filterNoFace(images, serviceType) {
  const serviceKeywords = {
    'dentist': ['dental', 'clinic', 'tooth', 'teeth', 'medical', 'office', 'clean', 'professional'],
    'lawyer': ['office', 'legal', 'professional', 'business', 'courthouse', 'meeting'],
    'restaurant': ['food', 'dining', 'kitchen', 'chef', 'meal', 'table']
  };
  
  const keywords = serviceKeywords[serviceType.toLowerCase()] || ['professional', 'business', 'office'];
  
  return images.filter(img => {
    const text = (img.alt || '').toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  });
}

// Face-aware filtering orchestrator
async function faceAwareFilter(images, serviceType) {
  // First try face detection
  const faceFiltered = await filterFaces(images);
  
  // If no faces or need more images, filter by content
  if (faceFiltered.length < images.length / 2) {
    const noFaceFiltered = filterNoFace(images, serviceType);
    return [...faceFiltered, ...noFaceFiltered].slice(0, 10);
  }
  
  return faceFiltered;
}

module.exports = {
  fetchUnsplashImages,
  fetchPexelsImages,
  faceAwareFilter,
  filterNoFace
};