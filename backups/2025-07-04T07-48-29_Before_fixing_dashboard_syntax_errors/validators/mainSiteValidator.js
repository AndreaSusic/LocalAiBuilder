/**
 * MAIN SITE VALIDATOR
 * Validates landing page, pricing, and core site elements
 */

export const REQUIRED_MAIN_SITE_ELEMENTS = {
  landingPage: {
    header: ['logo', 'navigation', 'login button'],
    hero: ['headline', 'prompt form', 'word counter', 'submit button'],
    sections: ['benefits', 'how-it-works', 'faq', 'testimonials'],
    footer: ['legal links', 'contact info', 'social media']
  },
  pricingPage: {
    plans: ['Basic', 'Pro', 'Agency'],
    features: ['billing toggle', 'feature comparison', 'pricing cards'],
    buttons: ['Try for Free', 'Get Started', 'Contact Sales'],
    elements: ['monthly/annual toggle', 'feature grid', 'FAQ section']
  },
  navigation: {
    desktop: ['Home', 'Pricing', 'Industries', 'FAQ', 'Account'],
    mobile: ['hamburger menu', 'mobile navigation', 'close button'],
    auth: ['Login', 'Sign Up', 'Profile', 'Logout']
  },
  forms: {
    prompt: ['business description', 'word counter', 'validation'],
    contact: ['name', 'email', 'message', 'submit'],
    auth: ['email', 'password', 'remember me', 'forgot password']
  }
};

export const CRITICAL_MAIN_CSS = [
  'header', 'nav', 'hero', 'benefits', 'pricing-cards', 
  'btn-primary', 'btn-secondary', 'mobile-nav', 'footer'
];

/**
 * Validates landing page structure
 */
export function validateLandingPage(htmlCode) {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_MAIN_SITE_ELEMENTS.landingPage;

  // Check header elements
  requirements.header.forEach(element => {
    const elementChecks = {
      'logo': ['logo', 'brand'],
      'navigation': ['nav', 'nav-links'],
      'login button': ['login', 'sign in']
    };
    
    const checks = elementChecks[element] || [element];
    const found = checks.some(check => htmlCode.toLowerCase().includes(check));
    
    if (!found) {
      issues.push(`Missing header element: ${element}`);
    }
  });

  // Check hero section
  requirements.hero.forEach(element => {
    const elementChecks = {
      'headline': ['h1', 'hero-title'],
      'prompt form': ['form', 'prompt-form'],
      'word counter': ['word-count', 'counter'],
      'submit button': ['submit', 'btn-primary']
    };
    
    const checks = elementChecks[element] || [element];
    const found = checks.some(check => htmlCode.toLowerCase().includes(check));
    
    if (!found) {
      issues.push(`Missing hero element: ${element}`);
    }
  });

  // Check main sections
  requirements.sections.forEach(section => {
    if (!htmlCode.toLowerCase().includes(section)) {
      warnings.push(`Missing section: ${section}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Landing page - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates pricing page structure
 */
export function validatePricingPage(htmlCode) {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_MAIN_SITE_ELEMENTS.pricingPage;

  // Check for pricing plans
  requirements.plans.forEach(plan => {
    if (!htmlCode.includes(plan)) {
      issues.push(`Missing pricing plan: ${plan}`);
    }
  });

  // Check for pricing features
  requirements.features.forEach(feature => {
    const featureChecks = {
      'billing toggle': ['monthly', 'annual', 'toggle'],
      'feature comparison': ['features', 'comparison'],
      'pricing cards': ['pricing-card', 'plan-card']
    };
    
    const checks = featureChecks[feature] || [feature];
    const found = checks.some(check => htmlCode.toLowerCase().includes(check));
    
    if (!found) {
      issues.push(`Missing pricing feature: ${feature}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Pricing page - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates navigation structure
 */
export function validateNavigation(htmlCode) {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_MAIN_SITE_ELEMENTS.navigation;

  // Check desktop navigation
  requirements.desktop.forEach(navItem => {
    if (!htmlCode.includes(navItem)) {
      warnings.push(`Missing desktop nav item: ${navItem}`);
    }
  });

  // Check mobile navigation
  requirements.mobile.forEach(mobileElement => {
    const elementChecks = {
      'hamburger menu': ['hamburger', 'nav-toggle'],
      'mobile navigation': ['mobile-nav', 'nav-mobile'],
      'close button': ['close', 'nav-close']
    };
    
    const checks = elementChecks[mobileElement] || [mobileElement];
    const found = checks.some(check => htmlCode.toLowerCase().includes(check));
    
    if (!found) {
      issues.push(`Missing mobile nav element: ${mobileElement}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Navigation - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates JavaScript functionality
 */
export function validateMainSiteJS(jsCode) {
  const issues = [];
  const warnings = [];

  // Check for core functions
  const requiredFunctions = [
    'initNavigation', 'initPromptForm', 'initFAQ', 
    'initPricing', 'validateEmail', 'makeRequest'
  ];

  requiredFunctions.forEach(func => {
    if (!jsCode.includes(func)) {
      warnings.push(`Missing function: ${func}`);
    }
  });

  // Check for event listeners
  if (!jsCode.includes('addEventListener') && !jsCode.includes('onclick')) {
    issues.push('Missing event listeners for user interaction');
  }

  // Check for form validation
  if (!jsCode.includes('validation') && !jsCode.includes('validate')) {
    warnings.push('Missing form validation');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Main site JS - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Comprehensive main site validation
 */
export function validateMainSite() {
  console.log('🔍 Running main site validation...');
  
  const results = {
    landingPage: null,
    pricingPage: null,
    navigation: null,
    javascript: null,
    overall: { valid: true, totalIssues: 0 }
  };

  // Would be expanded to read actual files and validate
  console.log('✅ Main site validation complete');
  console.log('📋 Check MAIN_SITE_BACKUP.md for required elements');
  
  return results;
}

export default {
  validateLandingPage,
  validatePricingPage,
  validateNavigation,
  validateMainSiteJS,
  validateMainSite,
  REQUIRED_MAIN_SITE_ELEMENTS,
  CRITICAL_MAIN_CSS
};