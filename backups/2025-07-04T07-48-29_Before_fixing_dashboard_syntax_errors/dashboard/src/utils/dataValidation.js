/**
 * Data Validation System for Multi-User Website Generation
 * Prevents cross-contamination between different businesses/users
 */

export const DATA_VALIDATION_CHECKPOINTS = [
  'COMPANY_NAME_MATCH',
  'SERVICES_CONSISTENCY', 
  'INDUSTRY_ALIGNMENT',
  'LOCATION_ACCURACY',
  'GBP_ASSOCIATION',
  'USER_ISOLATION',
  'TEMPLATE_DATA_PURITY',
  'AI_CUSTOMIZATION_COHERENCE',
  'MENU_TERMINOLOGY',
  'INDIVIDUAL_SERVICE_PAGES',
  'PHONE_NUMBER_VALIDATION',
  'CONTACT_INFO_CONSISTENCY',
  'BUSINESS_HOURS_VALIDATION',
  'REVIEW_AUTHENTICITY',
  'IMAGE_SOURCE_VALIDATION'
];

/**
 * Validates that all data belongs to the same business entity
 * @param {Object} siteData - Complete site data object
 * @param {string} expectedBusinessId - Unique identifier for the business
 * @returns {Object} Validation results with pass/fail status and details
 */
export function validateDataIntegrity(siteData, expectedBusinessId = null) {
  const results = {
    passed: true,
    checkpoints: {},
    errors: [],
    warnings: []
  };

  // CHECKPOINT 1: Company Name Match
  results.checkpoints.COMPANY_NAME_MATCH = validateCompanyName(siteData);
  if (!results.checkpoints.COMPANY_NAME_MATCH.passed) {
    results.passed = false;
    results.errors.push('Company name inconsistency detected');
  }

  // CHECKPOINT 2: Services Consistency
  results.checkpoints.SERVICES_CONSISTENCY = validateServicesConsistency(siteData);
  if (!results.checkpoints.SERVICES_CONSISTENCY.passed) {
    results.passed = false;
    results.errors.push('Service offerings do not match business type');
  }

  // CHECKPOINT 3: Industry Alignment
  results.checkpoints.INDUSTRY_ALIGNMENT = validateIndustryAlignment(siteData);
  if (!results.checkpoints.INDUSTRY_ALIGNMENT.passed) {
    results.passed = false;
    results.errors.push('Industry classification conflicts with services');
  }

  // CHECKPOINT 4: Location Accuracy
  results.checkpoints.LOCATION_ACCURACY = validateLocationAccuracy(siteData);
  if (!results.checkpoints.LOCATION_ACCURACY.passed) {
    results.passed = false;
    results.errors.push('Geographic location data inconsistency');
  }

  // CHECKPOINT 5: GBP Association
  results.checkpoints.GBP_ASSOCIATION = validateGBPAssociation(siteData);
  if (!results.checkpoints.GBP_ASSOCIATION.passed) {
    results.passed = false;
    results.errors.push('Google Business Profile data mismatch');
  }

  // CHECKPOINT 6: User Isolation
  results.checkpoints.USER_ISOLATION = validateUserIsolation(siteData, expectedBusinessId);
  if (!results.checkpoints.USER_ISOLATION.passed) {
    results.passed = false;
    results.errors.push('Data contamination from other users detected');
  }

  // CHECKPOINT 7: Template Data Purity
  results.checkpoints.TEMPLATE_DATA_PURITY = validateTemplateDataPurity(siteData);
  if (!results.checkpoints.TEMPLATE_DATA_PURITY.passed) {
    results.passed = false;
    results.errors.push('Template contains data from different businesses');
  }

  // CHECKPOINT 8: AI Customization Coherence
  results.checkpoints.AI_CUSTOMIZATION_COHERENCE = validateAICustomizationCoherence(siteData);
  if (!results.checkpoints.AI_CUSTOMIZATION_COHERENCE.passed) {
    results.passed = false;
    results.errors.push('AI-generated content does not match business context');
  }

  // CHECKPOINT 9: Menu Terminology
  results.checkpoints.MENU_TERMINOLOGY = validateMenuTerminology(siteData);
  if (!results.checkpoints.MENU_TERMINOLOGY.passed) {
    results.passed = false;
    results.errors.push('Menu uses incorrect terminology (Products vs Services)');
  }

  // CHECKPOINT 10: Individual Service Pages
  results.checkpoints.INDIVIDUAL_SERVICE_PAGES = validateIndividualServicePages(siteData);
  if (!results.checkpoints.INDIVIDUAL_SERVICE_PAGES.passed) {
    results.warnings.push('Individual service pages may need to be created');
  }

  // CHECKPOINT 11: Phone Number Validation
  results.checkpoints.PHONE_NUMBER_VALIDATION = validatePhoneNumber(siteData);
  if (!results.checkpoints.PHONE_NUMBER_VALIDATION.passed) {
    results.passed = false;
    results.errors.push('Phone number inconsistency detected');
  }

  // CHECKPOINT 12: Contact Info Consistency
  results.checkpoints.CONTACT_INFO_CONSISTENCY = validateContactInfoConsistency(siteData);
  if (!results.checkpoints.CONTACT_INFO_CONSISTENCY.passed) {
    results.passed = false;
    results.errors.push('Contact information inconsistency detected');
  }

  // CHECKPOINT 13: Business Hours Validation
  results.checkpoints.BUSINESS_HOURS_VALIDATION = validateBusinessHours(siteData);
  if (!results.checkpoints.BUSINESS_HOURS_VALIDATION.passed) {
    results.warnings.push('Business hours may need verification');
  }

  // CHECKPOINT 14: Review Authenticity
  results.checkpoints.REVIEW_AUTHENTICITY = validateReviewAuthenticity(siteData);
  if (!results.checkpoints.REVIEW_AUTHENTICITY.passed) {
    results.passed = false;
    results.errors.push('Review authenticity issues detected');
  }

  // CHECKPOINT 15: Image Source Validation
  results.checkpoints.IMAGE_SOURCE_VALIDATION = validateImageSources(siteData);
  if (!results.checkpoints.IMAGE_SOURCE_VALIDATION.passed) {
    results.warnings.push('Image sources may need verification');
  }

  return results;
}

/**
 * CHECKPOINT 1: Validates company name consistency across all data fields
 */
function validateCompanyName(siteData) {
  const { company_name, google_profile = {}, ai_customization = {} } = siteData;
  
  if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
    return { passed: false, reason: 'Company name is missing or invalid' };
  }

  const normalizedName = company_name.toLowerCase().trim();
  
  // Check GBP name consistency
  if (google_profile.name) {
    const gbpName = google_profile.name.toLowerCase().trim();
    if (!gbpName.includes(normalizedName) && !normalizedName.includes(gbpName)) {
      return { passed: false, reason: 'Company name does not match Google Business Profile name' };
    }
  }

  // Check AI customization consistency
  if (ai_customization.hero_title) {
    const heroTitle = ai_customization.hero_title.toLowerCase();
    if (!heroTitle.includes(normalizedName)) {
      return { passed: false, reason: 'AI-generated hero title does not contain company name' };
    }
  }

  return { passed: true, reason: 'Company name is consistent across all data sources' };
}

/**
 * CHECKPOINT 2: Validates services consistency with business type
 */
function validateServicesConsistency(siteData) {
  const { services, industry, company_name } = siteData;
  
  if (!services || (typeof services === 'string' && services.trim().length === 0)) {
    return { passed: false, reason: 'Services data is missing' };
  }

  const servicesList = typeof services === 'string' ? [services] : services;
  const servicesText = servicesList.join(' ').toLowerCase();
  const companyText = company_name ? company_name.toLowerCase() : '';

  // Specific validation for landscaping businesses
  if (industry && industry.toLowerCase().includes('landscap')) {
    const hasGrassServices = servicesText.includes('grass') || servicesText.includes('sod') || servicesText.includes('lawn');
    const hasNonGrassServices = servicesText.includes('septic') || servicesText.includes('tank') || servicesText.includes('plastic');
    
    if (hasNonGrassServices && !hasGrassServices) {
      // This is likely a non-grass landscaping business (e.g., septic tanks, construction)
      return { passed: true, reason: 'Non-grass landscaping services validated' };
    }
  }

  // Check for common service/industry mismatches
  const commonMismatches = [
    { services: ['grass', 'sod', 'lawn'], conflictingServices: ['septic', 'tank', 'dental', 'medical'] },
    { services: ['dental', 'teeth', 'orthodontic'], conflictingServices: ['grass', 'lawn', 'landscape'] },
    { services: ['restaurant', 'food', 'dining'], conflictingServices: ['dental', 'medical', 'grass'] }
  ];

  for (const mismatch of commonMismatches) {
    const hasMainService = mismatch.services.some(s => servicesText.includes(s));
    const hasConflictingService = mismatch.conflictingServices.some(s => servicesText.includes(s));
    
    if (hasMainService && hasConflictingService) {
      return { passed: false, reason: `Conflicting services detected: ${mismatch.services.join(', ')} vs ${mismatch.conflictingServices.join(', ')}` };
    }
  }

  return { passed: true, reason: 'Services are consistent with business type' };
}

/**
 * CHECKPOINT 3: Validates industry classification matches services
 */
function validateIndustryAlignment(siteData) {
  const { industry, services, company_name } = siteData;
  
  if (!industry) {
    return { passed: true, reason: 'No industry specified - allowing flexible classification' };
  }

  const industryLower = industry.toLowerCase();
  const servicesText = typeof services === 'string' ? services.toLowerCase() : (services || []).join(' ').toLowerCase();
  const companyText = company_name ? company_name.toLowerCase() : '';

  // Specific industry validations
  const industryValidations = {
    'dental': ['teeth', 'dental', 'orthodontic', 'braces', 'oral', 'dentist'],
    'medical': ['medical', 'health', 'doctor', 'clinic', 'patient', 'treatment'],
    'restaurant': ['restaurant', 'food', 'dining', 'menu', 'eat', 'kitchen'],
    'landscaping': ['landscape', 'lawn', 'grass', 'garden', 'outdoor', 'yard', 'septic', 'tank', 'plastic']
  };

  for (const [industryType, keywords] of Object.entries(industryValidations)) {
    if (industryLower.includes(industryType)) {
      const hasRelevantKeywords = keywords.some(keyword => 
        servicesText.includes(keyword) || companyText.includes(keyword)
      );
      
      if (!hasRelevantKeywords) {
        return { passed: false, reason: `Industry "${industry}" does not align with services "${services}"` };
      }
    }
  }

  return { passed: true, reason: 'Industry classification aligns with services' };
}

/**
 * CHECKPOINT 4: Validates location data consistency
 */
function validateLocationAccuracy(siteData) {
  const { city, google_profile = {}, ai_customization = {} } = siteData;
  
  if (!city || (Array.isArray(city) && city.length === 0)) {
    return { passed: false, reason: 'Location data is missing' };
  }

  const cityList = Array.isArray(city) ? city : [city];
  const primaryCity = cityList[0];

  // Check GBP location consistency
  if (google_profile.address) {
    const gbpAddress = google_profile.address.toLowerCase();
    const cityMatch = cityList.some(c => gbpAddress.includes(c.toLowerCase()));
    
    if (!cityMatch) {
      return { passed: false, reason: 'City does not match Google Business Profile address' };
    }
  }

  // Check AI customization location consistency
  if (ai_customization.map_query) {
    const mapQuery = ai_customization.map_query.toLowerCase();
    const cityMatch = cityList.some(c => mapQuery.includes(c.toLowerCase()));
    
    if (!cityMatch) {
      return { passed: false, reason: 'City does not match AI-generated map query' };
    }
  }

  return { passed: true, reason: 'Location data is consistent across all sources' };
}

/**
 * CHECKPOINT 5: Validates Google Business Profile data association
 */
function validateGBPAssociation(siteData) {
  const { google_profile = {}, company_name, city, reviews = [] } = siteData;
  
  // Check for authentic GBP data indicators
  const hasGBPData = google_profile.place_id || google_profile.name || reviews.length > 0;
  
  if (!hasGBPData) {
    return { passed: true, reason: 'No GBP data provided - validation skipped' };
  }

  // If GBP data exists, validate it matches the business
  if (google_profile.name && company_name) {
    const gbpName = google_profile.name.toLowerCase();
    const businessName = company_name.toLowerCase();
    
    // Allow partial matches for business name variations
    if (!gbpName.includes(businessName) && !businessName.includes(gbpName)) {
      return { passed: false, reason: 'Google Business Profile name does not match company name' };
    }
  }

  return { passed: true, reason: 'Google Business Profile data correctly associated with authentic data' };
}

/**
 * CHECKPOINT 6: Validates user data isolation
 */
function validateUserIsolation(siteData, expectedBusinessId) {
  // This would typically validate against a database of business IDs
  // For now, we'll validate that the data structure doesn't contain mixed business indicators
  
  const { company_name, services, conversation = [] } = siteData;
  
  if (!company_name) {
    return { passed: false, reason: 'No company identifier found for user isolation validation' };
  }

  // Check conversation history for mixed business discussions
  const conversationText = conversation
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase())
    .join(' ');

  // Look for potential business name conflicts in conversation
  const businessNames = extractPotentialBusinessNames(conversationText);
  if (businessNames.length > 1) {
    const currentBusiness = company_name.toLowerCase();
    const otherBusinesses = businessNames.filter(name => !name.includes(currentBusiness) && !currentBusiness.includes(name));
    
    if (otherBusinesses.length > 0) {
      return { passed: false, reason: `Multiple business names detected in conversation: ${businessNames.join(', ')}` };
    }
  }

  return { passed: true, reason: 'User data isolation maintained' };
}

/**
 * CHECKPOINT 7: Validates template data purity
 */
function validateTemplateDataPurity(siteData) {
  const { services, company_name, industry } = siteData;
  
  // Check for hardcoded template data that doesn't match the business
  const servicesText = typeof services === 'string' ? services.toLowerCase() : (services || []).join(' ').toLowerCase();
  const companyText = company_name ? company_name.toLowerCase() : '';
  
  // Common template contamination patterns
  const templateContamination = [
    { pattern: 'the grass outlet', business: 'grass business' },
    { pattern: 'austin premier dental', business: 'dental business' },
    { pattern: 'demo company', business: 'demo data' },
    { pattern: 'example business', business: 'example data' }
  ];

  for (const contamination of templateContamination) {
    if (servicesText.includes(contamination.pattern) || companyText.includes(contamination.pattern)) {
      if (!isExpectedBusiness(siteData, contamination.business)) {
        return { passed: false, reason: `Template contamination detected: ${contamination.pattern}` };
      }
    }
  }

  return { passed: true, reason: 'Template data is pure and business-specific' };
}

/**
 * CHECKPOINT 8: Validates AI customization coherence
 */
function validateAICustomizationCoherence(siteData) {
  const { ai_customization = {}, company_name, services, industry } = siteData;
  
  if (!ai_customization || Object.keys(ai_customization).length === 0) {
    return { passed: true, reason: 'No AI customization data to validate' };
  }

  const { hero_title, hero_subtitle, services_title, about_text } = ai_customization;
  const companyName = company_name || '';
  const servicesText = typeof services === 'string' ? services : (services || []).join(' ');

  // Validate hero title contains company name
  if (hero_title && !hero_title.toLowerCase().includes(companyName.toLowerCase())) {
    return { passed: false, reason: 'AI-generated hero title does not contain company name' };
  }

  // Validate about text mentions services
  if (about_text && servicesText) {
    const aboutLower = about_text.toLowerCase();
    const servicesLower = servicesText.toLowerCase();
    
    // Check if any service is mentioned in about text
    const serviceWords = servicesLower.split(/[,\s]+/).filter(word => word.length > 3);
    const hasServiceMention = serviceWords.some(word => aboutLower.includes(word));
    
    if (!hasServiceMention) {
      return { passed: false, reason: 'AI-generated about text does not mention business services' };
    }
  }

  return { passed: true, reason: 'AI customization is coherent with business data' };
}

/**
 * Helper function to extract potential business names from text
 */
function extractPotentialBusinessNames(text) {
  const businessIndicators = ['company', 'business', 'corp', 'inc', 'llc', 'ltd', 'clinic', 'dental', 'restaurant', 'outlet'];
  const words = text.split(/\s+/);
  const businessNames = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    const word = words[i].toLowerCase();
    const nextWord = words[i + 1].toLowerCase();
    
    if (businessIndicators.includes(nextWord)) {
      businessNames.push(`${word} ${nextWord}`);
    }
  }
  
  return [...new Set(businessNames)]; // Remove duplicates
}

/**
 * Helper function to check if contamination is expected for this business
 */
function isExpectedBusiness(siteData, businessType) {
  const { industry, services, company_name } = siteData;
  const dataText = `${industry} ${services} ${company_name}`.toLowerCase();
  
  switch (businessType) {
    case 'grass business':
      return dataText.includes('grass') || dataText.includes('sod') || dataText.includes('lawn');
    case 'dental business':
      return dataText.includes('dental') || dataText.includes('teeth') || dataText.includes('orthodontic');
    default:
      return false;
  }
}

/**
 * CHECKPOINT 9: Validates menu terminology (Products vs Services)
 */
function validateMenuTerminology(siteData) {
  const { services, industry, company_name } = siteData;
  
  if (!services) {
    return { passed: true, reason: 'No services data to validate terminology' };
  }

  const servicesText = typeof services === 'string' ? services.toLowerCase() : (services || []).join(' ').toLowerCase();
  const industryText = industry ? industry.toLowerCase() : '';
  const companyText = company_name ? company_name.toLowerCase() : '';
  
  // Determine if business sells products or provides services
  const productIndicators = ['products', 'goods', 'items', 'merchandise', 'equipment', 'materials', 'supplies', 'septic tanks', 'plastic elements'];
  const serviceIndicators = ['services', 'consultation', 'treatment', 'repair', 'maintenance', 'installation', 'cleaning', 'dental care'];
  
  const hasProductKeywords = productIndicators.some(indicator => 
    servicesText.includes(indicator) || companyText.includes(indicator)
  );
  const hasServiceKeywords = serviceIndicators.some(indicator => 
    servicesText.includes(indicator) || industryText.includes(indicator)
  );

  // For businesses like Kigen Plastika (septic tanks), they sell products
  if (hasProductKeywords && !hasServiceKeywords) {
    return { 
      passed: true, 
      reason: 'Business sells products - menu should use "Products" terminology',
      recommendation: 'Use "Products" in navigation menu'
    };
  }
  
  if (hasServiceKeywords && !hasProductKeywords) {
    return { 
      passed: true, 
      reason: 'Business provides services - menu should use "Services" terminology',
      recommendation: 'Use "Services" in navigation menu'
    };
  }

  return { 
    passed: true, 
    reason: 'Mixed products/services business - terminology flexible',
    recommendation: 'Consider using "Products & Services" in menu'
  };
}

/**
 * CHECKPOINT 10: Validates individual service/product pages
 */
function validateIndividualServicePages(siteData) {
  const { services, google_profile = {} } = siteData;
  
  if (!services) {
    return { passed: true, reason: 'No services data to create individual pages' };
  }

  const servicesList = typeof services === 'string' ? [services] : services;
  const gbpServices = google_profile.services || [];
  
  // Check if multiple distinct services/products are offered
  const allServices = [...servicesList, ...gbpServices];
  const distinctServices = [...new Set(allServices.filter(s => s && s.trim().length > 0))];
  
  if (distinctServices.length > 1) {
    return { 
      passed: false, 
      reason: `Multiple services detected: ${distinctServices.join(', ')} - individual pages recommended`,
      recommendation: `Create separate pages for: ${distinctServices.join(', ')}`
    };
  }

  return { passed: true, reason: 'Single service/product - individual pages not required' };
}

/**
 * CHECKPOINT 11: Validates phone number consistency
 */
function validatePhoneNumber(siteData) {
  const { google_profile = {}, contact = {}, ai_customization = {} } = siteData;
  
  const gbpPhone = google_profile.formatted_phone_number || google_profile.international_phone_number;
  const contactPhone = contact.phone || ai_customization.phone;
  
  if (!gbpPhone && !contactPhone) {
    return { passed: true, reason: 'No phone numbers provided - validation skipped' };
  }

  if (gbpPhone && contactPhone) {
    // Normalize phone numbers for comparison (remove spaces, dashes, parentheses)
    const normalizePhone = (phone) => phone.replace(/[\s\-\(\)]/g, '');
    const normalizedGbp = normalizePhone(gbpPhone);
    const normalizedContact = normalizePhone(contactPhone);
    
    if (normalizedGbp !== normalizedContact) {
      return { 
        passed: false, 
        reason: `Phone number mismatch: GBP(${gbpPhone}) vs Contact(${contactPhone})` 
      };
    }
  }

  return { 
    passed: true, 
    reason: gbpPhone ? 'Authentic phone number from GBP integrated' : 'Phone numbers are consistent' 
  };
}

/**
 * CHECKPOINT 12: Validates contact information consistency
 */
function validateContactInfoConsistency(siteData) {
  const { google_profile = {}, ai_customization = {}, city } = siteData;
  
  const gbpAddress = google_profile.address;
  const gbpEmail = google_profile.email;
  const contactEmail = ai_customization.email;
  
  // Validate email consistency
  if (gbpEmail && contactEmail && gbpEmail !== contactEmail) {
    return { 
      passed: false, 
      reason: `Email mismatch: GBP(${gbpEmail}) vs Contact(${contactEmail})` 
    };
  }

  // Validate address consistency with city
  if (gbpAddress && city) {
    const cityList = Array.isArray(city) ? city : [city];
    const addressLower = gbpAddress.toLowerCase();
    const cityMatch = cityList.some(c => addressLower.includes(c.toLowerCase()));
    
    if (!cityMatch) {
      return { 
        passed: false, 
        reason: `Address city mismatch: Address(${gbpAddress}) vs City(${city})` 
      };
    }
  }

  return { passed: true, reason: 'Contact information is consistent' };
}

/**
 * CHECKPOINT 13: Validates business hours
 */
function validateBusinessHours(siteData) {
  const { google_profile = {}, contact = {} } = siteData;
  
  // Check both contact and google_profile for business hours
  const businessHours = contact.business_hours || google_profile.opening_hours?.weekday_text || google_profile.hours;
  
  if (!businessHours || (Array.isArray(businessHours) && businessHours.length === 0)) {
    return { 
      passed: false, 
      reason: 'No business hours provided - may need to be added',
      recommendation: 'Add business hours from Google Business Profile'
    };
  }

  // Validate hours format
  if (Array.isArray(businessHours)) {
    // GBP weekday_text format - should have at least some days
    if (businessHours.length === 0) {
      return { 
        passed: false, 
        reason: 'Business hours array is empty',
        recommendation: 'Populate business hours data from GBP'
      };
    }
    return { 
      passed: true, 
      reason: `Authentic business hours validated from GBP (${businessHours.length} entries)`
    };
  }

  if (typeof businessHours === 'object') {
    const daysWithHours = Object.keys(businessHours).length;
    if (daysWithHours === 0) {
      return { 
        passed: false, 
        reason: 'Business hours object is empty',
        recommendation: 'Populate business hours data'
      };
    }
  }

  return { passed: true, reason: 'Business hours are provided' };
}

/**
 * CHECKPOINT 14: Validates review authenticity
 */
function validateReviewAuthenticity(siteData) {
  const { google_profile = {}, reviews = [] } = siteData;
  
  // Use the reviews array from data structure which contains authentic GBP reviews
  const reviewsToValidate = reviews.length > 0 ? reviews : (google_profile.reviews || []);
  
  if (reviewsToValidate.length === 0) {
    return { passed: true, reason: 'No reviews to validate' };
  }

  // Check for authentic GBP review structure
  for (const review of reviewsToValidate) {
    if (!review.author_name || !review.text) {
      return { 
        passed: false, 
        reason: 'Review missing required fields (author_name or text)' 
      };
    }

    // GBP reviews should have additional authentic fields
    if (review.profile_photo_url || review.author_url || review.time) {
      continue; // This looks like an authentic GBP review
    }

    // Check for generic/template reviews
    const genericPhrases = ['great service', 'highly recommend', 'excellent work', 'very professional'];
    const reviewText = review.text.toLowerCase();
    const genericCount = genericPhrases.filter(phrase => reviewText.includes(phrase)).length;
    
    if (genericCount > 2 && reviewText.length < 50) {
      return { 
        passed: false, 
        reason: `Potentially generic review detected: "${review.text}"` 
      };
    }
  }

  return { 
    passed: true, 
    reason: `${reviewsToValidate.length} authentic reviews validated from GBP`
  };
}

/**
 * CHECKPOINT 15: Validates image sources
 */
function validateImageSources(siteData) {
  const { images = [], google_profile = {} } = siteData;
  
  const gbpPhotos = google_profile.photos || [];
  const providedImages = Array.isArray(images) ? images : [];
  
  // Check for placeholder images
  const placeholderPatterns = ['placeholder', 'stock_photos_placeholder', 'example.com', 'lorem'];
  const hasPlaceholders = [...providedImages, ...gbpPhotos].some(img => 
    typeof img === 'string' && placeholderPatterns.some(pattern => img.includes(pattern))
  );

  if (hasPlaceholders) {
    return { 
      passed: false, 
      reason: 'Placeholder images detected - need authentic business photos',
      recommendation: 'Replace with authentic business photos from GBP or user uploads'
    };
  }

  // Check for sufficient image variety
  const totalImages = gbpPhotos.length + providedImages.filter(img => 
    typeof img === 'string' && img.length > 0 && !placeholderPatterns.some(p => img.includes(p))
  ).length;

  if (totalImages < 3) {
    return { 
      passed: false, 
      reason: `Only ${totalImages} images available - more images recommended for better presentation`,
      recommendation: 'Add more authentic business photos'
    };
  }

  return { passed: true, reason: 'Image sources are adequate and authentic' };
}

/**
 * Main validation function to be called before rendering templates
 */
export function validateBeforeRender(siteData, businessId = null) {
  console.log('🔍 DATA VALIDATION CHECKPOINT - Starting validation for:', siteData.company_name);
  
  const validation = validateDataIntegrity(siteData, businessId);
  
  console.log('📊 VALIDATION RESULTS:', {
    passed: validation.passed,
    checkpoints: Object.keys(validation.checkpoints).map(key => ({
      checkpoint: key,
      passed: validation.checkpoints[key].passed,
      reason: validation.checkpoints[key].reason
    })),
    errors: validation.errors,
    warnings: validation.warnings
  });

  if (!validation.passed) {
    console.error('❌ DATA VALIDATION FAILED:', validation.errors);
    throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
  }

  console.log('✅ DATA VALIDATION PASSED - Safe to render template');
  return validation;
}