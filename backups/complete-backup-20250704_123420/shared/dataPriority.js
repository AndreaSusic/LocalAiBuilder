/**
 * DATA PRIORITY HIERARCHY - Core Business Rule
 * 
 * This module enforces the critical data priority order system-wide:
 * 1. HIGHEST: User input data from chat (services/products, uploaded images)
 * 2. SECOND: Website extraction data
 * 3. THIRD: Google Business Profile data and AI-generated content
 * 4. FOURTH: Stock images from Unsplash/Pexels APIs (lowest priority)
 */

/**
 * Apply data priority hierarchy for services/products
 * @param {Object} sources - All available data sources
 * @param {Array|string} sources.userInput - User chat input services
 * @param {Array} sources.websiteData - Website extracted services
 * @param {Array} sources.gbpData - GBP services/products
 * @param {string} sources.industry - Industry context for fallback
 * @returns {Array} Prioritized services list
 */
function prioritizeServices({ userInput, websiteData = [], gbpData = [], industry = '' }) {
  console.log('🏅 APPLYING SERVICE PRIORITY HIERARCHY');
  
  // PRIORITY 1: User chat input (highest priority)
  if (Array.isArray(userInput) && userInput.length > 0) {
    console.log('🥇 PRIORITY 1: Using user input services from chat:', userInput);
    return userInput.slice(0, 3);
  } else if (typeof userInput === 'string' && userInput.length > 0) {
    console.log('🥇 PRIORITY 1: Using user input services text from chat:', userInput);
    // Parse user input based on industry context
    const isLandscaping = industry && industry.toLowerCase().includes('landscap') && 
      (userInput.toLowerCase().includes('grass') || userInput.toLowerCase().includes('sod'));
    
    if (isLandscaping) {
      const grassTypes = [];
      const lowerServices = userInput.toLowerCase();
      
      if (lowerServices.includes('bermuda')) grassTypes.push('Bermuda Grass');
      if (lowerServices.includes('zoysia')) grassTypes.push('Zoysia Grass');
      if (lowerServices.includes('st. august') || lowerServices.includes('st august')) grassTypes.push('St. Augustine Grass');
      if (lowerServices.includes('buffalo')) grassTypes.push('Buffalo Grass');
      
      if (grassTypes.length === 0 && (lowerServices.includes('sod') || lowerServices.includes('grass'))) {
        grassTypes.push('Bermuda Grass', 'Zoysia Grass');
      }
      
      return grassTypes.length > 0 ? grassTypes.slice(0, 3) : [userInput];
    } else {
      // For septic tanks and other industries, split by common delimiters
      return userInput.split(/[,&+]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
    }
  }
  
  // PRIORITY 2: Website extraction data (second priority)
  if (websiteData.length > 0) {
    console.log('🥈 PRIORITY 2: Using authentic website-extracted services:', websiteData);
    return websiteData.slice(0, 3).map(product => ({
      name: product.name,
      description: product.description || `Professional ${product.name.toLowerCase()} services`,
      authentic: true,
      source: 'website'
    }));
  }
  
  // PRIORITY 3: GBP data (third priority)
  if (gbpData.length > 0) {
    console.log('🥉 PRIORITY 3: Using GBP products data:', gbpData);
    return gbpData.slice(0, 3).map(product => {
      if (typeof product === 'string') return product;
      return product.name || product.title || String(product);
    });
  }
  
  // PRIORITY 4: AI-generated fallback (lowest priority)
  console.log('🏅 PRIORITY 4: Using AI-generated services as fallback');
  if (industry && industry.toLowerCase().includes('landscap')) {
    return ['Premium Sod Installation', 'Lawn Maintenance', 'Landscaping Design'];
  } else if (industry && industry.toLowerCase().includes('septic')) {
    return ['Septic Tank Systems', 'Plastic Components', 'Installation Services'];
  } else {
    return ['Professional Services', 'Expert Solutions', 'Quality Support'];
  }
}

/**
 * Apply data priority hierarchy for images
 * @param {Object} sources - All available image sources
 * @param {Array} sources.userUploads - User uploaded images from chat
 * @param {Array} sources.websiteImages - Website extracted images
 * @param {Array} sources.gbpPhotos - GBP imported images
 * @param {Array} sources.stockImages - Stock images from APIs
 * @returns {Array} Prioritized images list
 */
function prioritizeImages({ userUploads = [], websiteImages = [], gbpPhotos = [], stockImages = [] }) {
  console.log('🖼️ APPLYING IMAGE PRIORITY HIERARCHY');
  
  // Filter user uploads (exclude stock images and placeholders)
  const validUserUploads = userUploads.filter(img => 
    typeof img === 'string' && 
    img.length > 0 && 
    !img.includes('placeholder') &&
    !img.includes('unsplash.com') &&
    !img.includes('pexels.com') &&
    (img.startsWith('http://') || img.startsWith('https://'))
  );
  
  // Filter stock images
  const validStockImages = stockImages.filter(img => 
    typeof img === 'string' && 
    (img.includes('unsplash.com') || img.includes('pexels.com'))
  );
  
  // Apply priority order
  const prioritizedImages = [
    ...validUserUploads,      // PRIORITY 1: User uploads
    ...websiteImages,         // PRIORITY 2: Website images
    ...gbpPhotos,            // PRIORITY 3: GBP photos
    ...validStockImages      // PRIORITY 4: Stock images
  ];
  
  if (validUserUploads.length > 0) {
    console.log('🥇 PRIORITY 1: Using user uploaded images:', validUserUploads.length);
  } else if (websiteImages.length > 0) {
    console.log('🥈 PRIORITY 2: Using website extracted images:', websiteImages.length);
  } else if (gbpPhotos.length > 0) {
    console.log('🥉 PRIORITY 3: Using GBP imported images:', gbpPhotos.length);
  } else if (validStockImages.length > 0) {
    console.log('🏅 PRIORITY 4: Using stock images as fallback:', validStockImages.length);
  }
  
  return prioritizedImages;
}

/**
 * Apply data priority hierarchy for text content
 * @param {Object} sources - All available text sources
 * @param {string} sources.userInput - User provided text
 * @param {string} sources.websiteContent - Website extracted content
 * @param {string} sources.gbpContent - GBP content
 * @param {string} sources.aiGenerated - AI generated content
 * @returns {string} Prioritized text content
 */
function prioritizeText({ userInput, websiteContent, gbpContent, aiGenerated }) {
  console.log('📝 APPLYING TEXT PRIORITY HIERARCHY');
  
  if (userInput && userInput.trim().length > 0) {
    console.log('🥇 PRIORITY 1: Using user input text');
    return userInput;
  } else if (websiteContent && websiteContent.trim().length > 0) {
    console.log('🥈 PRIORITY 2: Using website extracted content');
    return websiteContent;
  } else if (gbpContent && gbpContent.trim().length > 0) {
    console.log('🥉 PRIORITY 3: Using GBP content');
    return gbpContent;
  } else {
    console.log('🏅 PRIORITY 4: Using AI generated content as fallback');
    return aiGenerated || '';
  }
}

/**
 * Validate that data follows priority hierarchy rules
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
function validateDataPriority(data) {
  const issues = [];
  
  // Check if AI content is overriding user input
  if (data.userInput && data.aiGenerated && data.currentlyUsed === data.aiGenerated) {
    issues.push('AI content is overriding user input - violates priority hierarchy');
  }
  
  // Check if stock images are being used when GBP photos exist
  if (data.gbpPhotos?.length > 0 && data.currentImages?.some(img => 
    img.includes('unsplash.com') || img.includes('pexels.com'))) {
    issues.push('Stock images being used when GBP photos available - violates priority hierarchy');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    message: issues.length === 0 ? 'Data priority hierarchy is correctly enforced' : 'Priority hierarchy violations detected'
  };
}

module.exports = {
  prioritizeServices,
  prioritizeImages,
  prioritizeText,
  validateDataPriority
};