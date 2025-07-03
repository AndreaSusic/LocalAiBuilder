/**
 * AUTOMATIC GBP DATA IMPORT SYSTEM
 * 
 * Strict flow for automatically importing GBP data when user provides profile:
 * 1. Contact information (phone, address, email)
 * 2. Reviews with reviewer names and ratings
 * 3. Business hours and operational status
 * 4. Maps URL and location data
 * 5. Photos and visual content
 * 
 * Data Priority Hierarchy:
 * 1) User chat input (highest)
 * 2) Website extraction
 * 3) GBP data/AI content
 * 4) Stock images (lowest)
 */

/**
 * Automatic GBP data import function
 * @param {string} gbpUrl - Google Business Profile URL or place ID
 * @param {Object} existingData - Existing user data to merge with
 * @param {Object} userRefreshToken - User's OAuth refresh token for Business API
 * @returns {Object} - Merged data with GBP imports
 */
async function autoImportGbpData(gbpUrl, existingData = {}, userRefreshToken = null) {
  console.log('🔄 AUTOMATIC GBP DATA IMPORT STARTED');
  console.log('📍 GBP URL:', gbpUrl);
  console.log('🔑 Has refresh token:', !!userRefreshToken);
  
  try {
    // Step 1: Fetch GBP details using Google Places API
    const response = await fetch('http://localhost:5000/api/gbp-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeUrl: gbpUrl })
    });
    
    const gbpData = await response.json();
    
    if (gbpData.error || !gbpData.name) {
      console.log('❌ GBP import failed:', gbpData.error || 'No business name found');
      return existingData;
    }
    
    console.log('✅ GBP data fetched for:', gbpData.name);
    
    // Step 2: Apply data priority hierarchy - only import if user hasn't provided data
    const importedData = { ...existingData };
    
    // PRIORITY 1: Contact Information (only if user hasn't provided)
    if (!existingData.phone && gbpData.phone) {
      importedData.phone = gbpData.phone;
      console.log('📞 IMPORTED: Phone -', gbpData.phone);
    }
    
    if (!existingData.address && gbpData.address) {
      importedData.address = gbpData.address;
      console.log('📍 IMPORTED: Address -', gbpData.address);
    }
    
    if (!existingData.website && gbpData.website) {
      importedData.website = gbpData.website;
      console.log('🌐 IMPORTED: Website -', gbpData.website);
    }
    
    if (!existingData.email && gbpData.email) {
      importedData.email = gbpData.email;
      console.log('📧 IMPORTED: Email -', gbpData.email);
    }
    
    // PRIORITY 2: Business Hours and Status
    if (!existingData.business_hours && gbpData.business_hours) {
      importedData.business_hours = gbpData.business_hours;
      console.log('🕐 IMPORTED: Business hours');
    }
    
    if (!existingData.business_status && gbpData.business_status) {
      importedData.business_status = gbpData.business_status;
      console.log('🟢 IMPORTED: Business status -', gbpData.business_status);
    }
    
    // PRIORITY 3: Reviews (always import authentic reviews)
    if (gbpData.reviews && gbpData.reviews.length > 0) {
      // Preserve existing reviews if any, but prioritize authentic GBP reviews
      const existingReviews = existingData.reviews || [];
      const gbpReviews = gbpData.reviews.map(review => ({
        ...review,
        source: 'google_business_profile'
      }));
      
      // Merge with priority to GBP reviews
      importedData.reviews = [...gbpReviews, ...existingReviews];
      console.log('⭐ IMPORTED: Reviews -', gbpReviews.length, 'authentic GBP reviews');
    }
    
    // PRIORITY 4: Rating and Review Count
    if (gbpData.rating) {
      importedData.rating = gbpData.rating;
      console.log('⭐ IMPORTED: Rating -', gbpData.rating, 'stars');
    }
    
    if (gbpData.total_reviews) {
      importedData.total_reviews = gbpData.total_reviews;
      console.log('📊 IMPORTED: Total reviews -', gbpData.total_reviews);
    }
    
    // PRIORITY 5: Maps URL and Location
    if (!existingData.maps_url && gbpData.maps_url) {
      importedData.maps_url = gbpData.maps_url;
      console.log('🗺️ IMPORTED: Maps URL -', gbpData.maps_url);
    }
    
    // PRIORITY 6: Photos (only if user hasn't uploaded images)
    const hasUserImages = existingData.images && existingData.images.length > 0;
    if (!hasUserImages && gbpData.photos && gbpData.photos.length > 0) {
      importedData.images = gbpData.photos;
      console.log('📸 IMPORTED: Photos -', gbpData.photos.length, 'authentic GBP photos');
    }
    
    // PRIORITY 7: Store complete GBP profile for reference
    importedData.google_profile = {
      place_id: gbpData.place_id,
      name: gbpData.name,
      verified: true,
      import_date: new Date().toISOString(),
      ...gbpData
    };
    
    console.log('✅ AUTOMATIC GBP IMPORT COMPLETED');
    console.log('📊 Data imported:', {
      contact: !!(importedData.phone || importedData.address || importedData.email),
      reviews: importedData.reviews ? importedData.reviews.length : 0,
      photos: importedData.images ? importedData.images.length : 0,
      business_info: !!(importedData.business_hours || importedData.business_status)
    });
    
    return importedData;
    
  } catch (error) {
    console.error('❌ AUTOMATIC GBP IMPORT ERROR:', error.message);
    return existingData;
  }
}

/**
 * Detect if user input contains GBP URL
 * @param {string} userInput - User's text input
 * @returns {string|null} - Extracted GBP URL or null
 */
function detectGbpUrl(userInput) {
  const gbpPatterns = [
    /https?:\/\/(?:www\.)?google\.[a-z.]+\/maps\/place\/[^?\s]+/i,
    /https?:\/\/goo\.gl\/maps\/[A-Za-z0-9]+/i,
    /https?:\/\/maps\.google\.com\/[^?\s]+/i,
    /https?:\/\/[^.\s]+\.business\.site/i
  ];
  
  for (const pattern of gbpPatterns) {
    const match = userInput.match(pattern);
    if (match) {
      console.log('🔍 GBP URL detected:', match[0]);
      return match[0];
    }
  }
  
  return null;
}

/**
 * Check if data should be imported based on priority hierarchy
 * @param {Object} existingData - Current user data
 * @param {string} field - Field to check
 * @returns {boolean} - Whether to import this field
 */
function shouldImportField(existingData, field) {
  // Priority 1: User has provided data - don't override
  if (existingData[field] && existingData[field] !== '') {
    console.log(`⚠️ SKIPPING ${field} - user data exists:`, existingData[field]);
    return false;
  }
  
  // Priority 2: No user data - safe to import
  return true;
}

/**
 * Validate imported GBP data quality
 * @param {Object} gbpData - Imported GBP data
 * @returns {Object} - Validation results
 */
function validateGbpImport(gbpData) {
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // Check required fields
  if (!gbpData.name) {
    validation.errors.push('Missing business name');
  }
  
  if (!gbpData.phone && !gbpData.address) {
    validation.warnings.push('No contact information available');
  }
  
  if (!gbpData.reviews || gbpData.reviews.length === 0) {
    validation.warnings.push('No reviews available');
  }
  
  validation.valid = validation.errors.length === 0;
  
  return validation;
}

module.exports = {
  autoImportGbpData,
  detectGbpUrl,
  shouldImportField,
  validateGbpImport
};