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
  'AI_CUSTOMIZATION_COHERENCE'
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
  const { google_profile = {}, company_name, city } = siteData;
  
  if (!google_profile.place_id && !google_profile.name) {
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

  return { passed: true, reason: 'Google Business Profile data correctly associated' };
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