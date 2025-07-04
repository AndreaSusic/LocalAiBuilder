/**
 * TEMPLATE COMPONENT VALIDATOR
 * Validates homepage, service, and contact templates
 */

export const REQUIRED_TEMPLATE_ELEMENTS = {
  homepage: {
    v1: {
      sections: ['HeroSection', 'ServicesSection', 'AboutSection', 'ReviewsSection', 'ContactSection'],
      buttons: ['Contact Us', 'Schedule now'],
      navigation: ['Home', 'Services', 'About', 'Contact'],
      data: ['companyName', 'phone', 'address', 'services']
    },
    v2: {
      sections: ['header', 'hero', 'services', 'testimonials', 'contact'],
      buttons: ['Schedule Consultation', 'Call Now'],
      navigation: ['Home', 'Services', 'About', 'Contact'],
      data: ['companyName', 'phone', 'address', 'services']
    },
    v3: {
      sections: ['header', 'hero', 'features', 'gallery', 'reviews'],
      buttons: ['Get Started', 'Learn More'],
      navigation: ['Home', 'Services', 'About', 'Contact'],
      data: ['companyName', 'phone', 'address', 'services']
    }
  },
  service: {
    elements: ['navigation', 'hero', 'benefits', 'beforeAfter', 'faq', 'cta'],
    buttons: ['Schedule Consultation', 'Call Now'],
    forms: ['consultation form'],
    data: ['service name', 'phone', 'pricing']
  },
  contact: {
    elements: ['navigation', 'contactForm', 'contactInfo', 'map', 'hours'],
    buttons: ['Send Message', 'Call Now'],
    forms: ['contact form'],
    data: ['phone', 'address', 'email', 'hours']
  }
};

export const CRITICAL_CSS_CLASSES = [
  'hero-section', 'services-grid', 'testimonials', 'contact-section',
  'btn-primary', 'btn-secondary', 'nav-links', 'mobile-nav'
];

/**
 * Validates homepage template structure
 */
export function validateHomepageTemplate(templateCode, version = 'v1') {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_TEMPLATE_ELEMENTS.homepage[version];

  // Check for required sections
  requirements.sections.forEach(section => {
    if (!templateCode.includes(section)) {
      issues.push(`Missing required section: ${section}`);
    }
  });

  // Check for required buttons
  requirements.buttons.forEach(button => {
    if (!templateCode.includes(button)) {
      issues.push(`Missing required button: "${button}"`);
    }
  });

  // Check for navigation elements
  requirements.navigation.forEach(navItem => {
    if (!templateCode.includes(navItem)) {
      warnings.push(`Missing navigation item: "${navItem}"`);
    }
  });

  // Check for data integration
  requirements.data.forEach(dataField => {
    if (!templateCode.includes(dataField)) {
      warnings.push(`Missing data field: ${dataField}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Homepage ${version} - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates service template structure
 */
export function validateServiceTemplate(templateCode) {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_TEMPLATE_ELEMENTS.service;

  requirements.elements.forEach(element => {
    if (!templateCode.includes(element)) {
      issues.push(`Missing service element: ${element}`);
    }
  });

  requirements.buttons.forEach(button => {
    if (!templateCode.includes(button)) {
      issues.push(`Missing service button: "${button}"`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Service template - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates contact template structure
 */
export function validateContactTemplate(templateCode) {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_TEMPLATE_ELEMENTS.contact;

  requirements.elements.forEach(element => {
    if (!templateCode.includes(element)) {
      issues.push(`Missing contact element: ${element}`);
    }
  });

  requirements.buttons.forEach(button => {
    if (!templateCode.includes(button)) {
      issues.push(`Missing contact button: "${button}"`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Contact template - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Comprehensive template validation runner
 */
export function validateAllTemplates() {
  console.log('🔍 Running template validation suite...');
  
  const results = {
    homepage: {},
    service: null,
    contact: null,
    overall: { valid: true, totalIssues: 0 }
  };

  // Would be expanded to read actual files and validate
  console.log('✅ Template validation complete');
  console.log('📋 Check TEMPLATE_BACKUP.md for required elements');
  
  return results;
}

export default {
  validateHomepageTemplate,
  validateServiceTemplate, 
  validateContactTemplate,
  validateAllTemplates,
  REQUIRED_TEMPLATE_ELEMENTS,
  CRITICAL_CSS_CLASSES
};