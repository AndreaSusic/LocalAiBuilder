/**
 * DATA PRIORITY HIERARCHY ENFORCER
 * 
 * This module provides validation and enforcement functions to ensure
 * the data priority hierarchy is maintained system-wide.
 * 
 * CRITICAL BUSINESS RULE:
 * 1. HIGHEST: User input data from chat 
 * 2. SECOND: Website extraction data
 * 3. THIRD: GBP data and AI content
 * 4. FOURTH: Stock images (lowest priority)
 */

/**
 * Validate that data follows the correct priority hierarchy
 */
function validateDataHierarchy(data) {
  const violations = [];
  
  // Check services/products priority
  if (data.userServices && data.currentServices !== data.userServices) {
    if (data.currentServices === data.aiServices) {
      violations.push('CRITICAL: AI services overriding user input');
    }
  }
  
  // Check image priority
  if (data.userImages?.length > 0 && data.currentImages) {
    const usingStockImages = data.currentImages.some(img => 
      img.includes('unsplash.com') || img.includes('pexels.com'));
    
    if (usingStockImages) {
      violations.push('CRITICAL: Stock images used when user images available');
    }
  }
  
  // Check GBP vs stock images
  if (data.gbpImages?.length > 0 && data.currentImages) {
    const usingStockImages = data.currentImages.some(img => 
      img.includes('unsplash.com') || img.includes('pexels.com'));
    
    if (usingStockImages && !data.userImages?.length) {
      violations.push('VIOLATION: Stock images used when GBP images available');
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
    severity: violations.some(v => v.includes('CRITICAL')) ? 'CRITICAL' : 'WARNING'
  };
}

/**
 * Enforce priority hierarchy on any data object
 */
function enforcePriorityHierarchy(dataObject) {
  console.log('🏅 ENFORCING DATA PRIORITY HIERARCHY');
  
  // Services/Products enforcement
  if (dataObject.services) {
    const sources = {
      userInput: dataObject.userServices || dataObject.services,
      websiteData: dataObject.websiteServices || dataObject.products || [],
      gbpData: dataObject.gbpServices || [],
      aiGenerated: dataObject.aiServices || []
    };
    
    // Apply priority order
    if (sources.userInput && (Array.isArray(sources.userInput) ? sources.userInput.length > 0 : sources.userInput.trim().length > 0)) {
      dataObject.services = sources.userInput;
      console.log('🥇 Using user input services (Priority 1)');
    } else if (sources.websiteData.length > 0) {
      dataObject.services = sources.websiteData;
      console.log('🥈 Using website services (Priority 2)');
    } else if (sources.gbpData.length > 0) {
      dataObject.services = sources.gbpData;
      console.log('🥉 Using GBP services (Priority 3)');
    } else {
      dataObject.services = sources.aiGenerated;
      console.log('🏅 Using AI services (Priority 4)');
    }
  }
  
  // Images enforcement
  if (dataObject.images) {
    const imageTypes = {
      user: [],
      website: [],
      gbp: [],
      stock: []
    };
    
    // Categorize images
    dataObject.images.forEach(img => {
      if (!img || typeof img !== 'string') return;
      
      if (img.includes('unsplash.com') || img.includes('pexels.com')) {
        imageTypes.stock.push(img);
      } else if (img.includes('maps.googleapis.com')) {
        imageTypes.gbp.push(img);
      } else if (!img.includes('placeholder')) {
        imageTypes.user.push(img);
      }
    });
    
    // Apply priority order
    const prioritizedImages = [
      ...imageTypes.user,    // Priority 1
      ...imageTypes.website, // Priority 2  
      ...imageTypes.gbp,     // Priority 3
      ...imageTypes.stock    // Priority 4
    ];
    
    dataObject.images = prioritizedImages;
    
    if (imageTypes.user.length > 0) {
      console.log('🥇 Using user uploaded images (Priority 1)');
    } else if (imageTypes.website.length > 0) {
      console.log('🥈 Using website images (Priority 2)');
    } else if (imageTypes.gbp.length > 0) {
      console.log('🥉 Using GBP images (Priority 3)');
    } else {
      console.log('🏅 Using stock images (Priority 4)');
    }
  }
  
  return dataObject;
}

/**
 * Log priority hierarchy status for debugging
 */
function logPriorityStatus(data) {
  console.log('📊 DATA PRIORITY STATUS:');
  console.log('   User Services:', data.userServices ? '✅' : '❌');
  console.log('   Website Services:', data.websiteServices?.length > 0 ? '✅' : '❌');
  console.log('   GBP Services:', data.gbpServices?.length > 0 ? '✅' : '❌');
  console.log('   User Images:', data.userImages?.length > 0 ? '✅' : '❌');
  console.log('   GBP Images:', data.gbpImages?.length > 0 ? '✅' : '❌');
  console.log('   Stock Images:', data.stockImages?.length > 0 ? '✅' : '❌');
}

module.exports = {
  validateDataHierarchy,
  enforcePriorityHierarchy,
  logPriorityStatus
};