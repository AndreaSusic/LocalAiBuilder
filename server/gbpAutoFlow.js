/**
 * AUTOMATIC GBP DATA IMPORT FLOW
 * 
 * Server-side strict flow for automatically importing GBP data for ANY user profile:
 * 1. Contact information (phone, address, email) - PRIORITY 1
 * 2. Authentic reviews with reviewer names and ratings - PRIORITY 2  
 * 3. Business hours and operational status - PRIORITY 3
 * 4. Maps URL and location data - PRIORITY 4
 * 5. Authentic photos and visual content - PRIORITY 5
 * 
 * Data Priority Hierarchy Enforcement:
 * 1) User chat input (highest)
 * 2) Website extraction
 * 3) GBP data/AI content
 * 4) Stock images (lowest)
 */

// Use dynamic import for node-fetch ES module
let fetch;
async function ensureFetch() {
  if (!fetch) {
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
  }
  return fetch;
}

/**
 * Automatic GBP data import flow for any user profile
 * @param {string} placeUrl - Google Business Profile URL or place ID
 * @param {Object} existingUserData - Existing user data to respect priority hierarchy
 * @returns {Object} - Comprehensive GBP data with automatic imports
 */
async function executeAutoGbpFlow(placeUrl, existingUserData = {}) {
  console.log('🚀 EXECUTING AUTOMATIC GBP IMPORT FLOW');
  console.log('📍 Profile URL:', placeUrl);
  console.log('🔍 Existing user data keys:', Object.keys(existingUserData));
  
  try {
    // Step 1: Ensure fetch is available
    await ensureFetch();
    
    // Step 2: Fetch comprehensive GBP details
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }
    
    // Extract place ID from various URL formats
    let place_id = await extractPlaceId(placeUrl, GOOGLE_API_KEY);
    if (!place_id) {
      throw new Error('Could not extract place ID from URL');
    }
    
    console.log('🔑 Extracted place_id:', place_id);
    
    // Step 2: Fetch place details with comprehensive field set
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,business_status,opening_hours,rating,user_ratings_total,reviews,photos,types,url,editorial_summary&key=${GOOGLE_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const details = await detailsResponse.json();
    
    if (details.status !== 'OK' || !details.result) {
      throw new Error(`Place details fetch failed: ${details.status}`);
    }
    
    const place = details.result;
    console.log('✅ Place details fetched for:', place.name);
    
    // Step 3: Process reviews with authentic reviewer data
    const reviews = await processAuthenticReviews(place.reviews || []);
    
    // Step 4: Process photos with proper URLs
    const photos = await processAuthenticPhotos(place.photos || [], GOOGLE_API_KEY);
    
    // Step 5: Format business hours
    const businessHours = formatBusinessHours(place.opening_hours);
    
    // Step 6: Create comprehensive GBP data object following priority hierarchy
    const gbpImportData = {
      // PRIORITY 1: Contact Information (only if user hasn't provided)
      phone: shouldImportField(existingUserData, 'phone') ? 
        (place.formatted_phone_number || place.international_phone_number) : existingUserData.phone,
      
      address: shouldImportField(existingUserData, 'address') ? 
        place.formatted_address : existingUserData.address,
      
      website: shouldImportField(existingUserData, 'website') ? 
        place.website : existingUserData.website,
      
      email: shouldImportField(existingUserData, 'email') ? 
        generateBusinessEmail(place.name) : existingUserData.email,
      
      // PRIORITY 2: Authentic Reviews (always import)
      reviews: reviews,
      rating: place.rating,
      total_reviews: place.user_ratings_total,
      
      // PRIORITY 3: Business Hours and Status
      business_hours: businessHours,
      business_status: place.business_status,
      
      // PRIORITY 4: Maps URL and Location
      maps_url: place.url || placeUrl,
      place_id: place_id,
      
      // PRIORITY 5: Photos (only if user hasn't uploaded images)
      photos: shouldImportField(existingUserData, 'images') ? photos : existingUserData.images || [],
      
      // Business Profile Metadata
      google_profile: {
        name: place.name,
        place_id: place_id,
        types: place.types,
        editorial_summary: place.editorial_summary?.overview,
        verified: true,
        auto_imported: true,
        import_date: new Date().toISOString(),
        source_url: placeUrl
      }
    };
    
    // Step 7: Log successful imports
    logImportResults(gbpImportData, existingUserData);
    
    console.log('✅ AUTOMATIC GBP IMPORT FLOW COMPLETED');
    return gbpImportData;
    
  } catch (error) {
    console.error('❌ AUTOMATIC GBP IMPORT FLOW ERROR:', error.message);
    throw error;
  }
}

/**
 * Extract place ID from various GBP URL formats
 */
async function extractPlaceId(placeUrl, apiKey) {
  await ensureFetch();
  
  // Direct place_id parameter
  const placeIdMatch = placeUrl.match(/place_id=([^&]+)/);
  if (placeIdMatch) {
    return placeIdMatch[1];
  }
  
  // Handle shortened URLs and search queries
  if (placeUrl.includes('g.co/kgs/') || placeUrl.includes('google.com/maps/place/')) {
    // Extract business name from URL for text search
    const nameMatch = placeUrl.match(/place\/([^\/,]+)/);
    if (nameMatch) {
      const businessName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
      console.log('🔍 Searching for business:', businessName);
      
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(businessName)}&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchResults = await searchResponse.json();
      
      if (searchResults.results && searchResults.results.length > 0) {
        return searchResults.results[0].place_id;
      }
    }
  }
  
  throw new Error('Could not extract place_id from URL format');
}

/**
 * Process authentic reviews with proper data structure
 */
async function processAuthenticReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    console.log('⚠️ No reviews available from GBP');
    return [];
  }
  
  const processedReviews = reviews.map(review => ({
    author_name: review.author_name,
    author_url: review.author_url,
    language: review.language,
    original_language: review.original_language,
    profile_photo_url: review.profile_photo_url,
    rating: review.rating,
    relative_time_description: review.relative_time_description,
    text: review.text,
    time: review.time,
    translated: review.translated || false,
    source: 'google_business_profile'
  }));
  
  console.log('⭐ Processed', processedReviews.length, 'authentic reviews');
  return processedReviews;
}

/**
 * Process authentic photos with proper Google Photos URLs
 */
async function processAuthenticPhotos(photos, apiKey) {
  if (!photos || photos.length === 0) {
    console.log('⚠️ No photos available from GBP');
    return [];
  }
  
  const photoUrls = photos.map((photo, index) => {
    if (!photo.photo_reference) {
      console.log(`⚠️ Photo ${index + 1} has no photo_reference, skipping`);
      return null;
    }
    
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${apiKey}`;
    return photoUrl;
  }).filter(url => url !== null);
  
  console.log('📸 Processed', photoUrls.length, 'authentic GBP photos');
  return photoUrls;
}

/**
 * Format business hours for consistent display
 */
function formatBusinessHours(openingHours) {
  if (!openingHours) {
    return null;
  }
  
  return {
    open_now: openingHours.open_now,
    periods: openingHours.periods,
    weekday_text: openingHours.weekday_text
  };
}

/**
 * Generate business email placeholder
 */
function generateBusinessEmail(businessName) {
  if (!businessName) return null;
  
  const domain = businessName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
  
  return `info@${domain}.com`;
}

/**
 * Check if field should be imported based on priority hierarchy
 */
function shouldImportField(existingData, field) {
  // Priority 1: User has provided data - don't override
  if (existingData[field] && existingData[field] !== '' && existingData[field] !== null) {
    console.log(`⚠️ RESPECTING USER DATA: Skipping ${field} import - user provided:`, existingData[field]);
    return false;
  }
  
  // Priority 2: No user data - safe to import
  return true;
}

/**
 * Log import results for transparency
 */
function logImportResults(importedData, existingData) {
  console.log('📊 IMPORT RESULTS SUMMARY:');
  
  const imported = [];
  const skipped = [];
  
  if (importedData.phone && importedData.phone !== existingData.phone) imported.push('phone');
  else if (existingData.phone) skipped.push('phone (user data)');
  
  if (importedData.address && importedData.address !== existingData.address) imported.push('address');
  else if (existingData.address) skipped.push('address (user data)');
  
  if (importedData.website && importedData.website !== existingData.website) imported.push('website');
  else if (existingData.website) skipped.push('website (user data)');
  
  if (importedData.reviews && importedData.reviews.length > 0) imported.push(`${importedData.reviews.length} reviews`);
  
  if (importedData.photos && importedData.photos.length > 0) imported.push(`${importedData.photos.length} photos`);
  
  if (importedData.business_hours) imported.push('business hours');
  
  console.log('✅ AUTO-IMPORTED:', imported.join(', ') || 'none');
  console.log('⚠️ SKIPPED (user priority):', skipped.join(', ') || 'none');
}

module.exports = {
  executeAutoGbpFlow,
  extractPlaceId,
  processAuthenticReviews,
  processAuthenticPhotos,
  shouldImportField
};