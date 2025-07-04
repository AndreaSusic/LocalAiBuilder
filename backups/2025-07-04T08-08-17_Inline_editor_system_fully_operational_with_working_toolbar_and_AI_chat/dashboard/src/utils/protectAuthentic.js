// Utility to protect authentic data from AI override
export function protectAuthenticData(data) {
  if (!data || typeof data !== 'object') return data;
  
  // Mark authentic GBP products as protected
  if (data.google_profile?.products?.length > 0) {
    console.log('🔒 PROTECTING AUTHENTIC GBP PRODUCTS from AI override');
    return {
      ...data,
      _authenticProducts: true,
      _protectedFields: ['services', 'products', 'company_name', 'phone', 'address']
    };
  }
  
  return data;
}

export function isProtectedField(data, fieldName) {
  return data._protectedFields?.includes(fieldName) || false;
}

export function shouldSkipAIGeneration(data, fieldName) {
  if (data._authenticProducts && ['services', 'products'].includes(fieldName)) {
    console.log(`🔒 SKIPPING AI generation for ${fieldName} - authentic data protected`);
    return true;
  }
  return false;
}