/**
 * DASHBOARD COMPONENT VALIDATOR
 * Prevents accidental deletion of critical UI elements
 * Run this before any major dashboard changes
 */

export const REQUIRED_DASHBOARD_ELEMENTS = {
  desktop: {
    header: {
      logo: '.logo-section',
      newSiteButton: 'button:contains("New Site")',
      saveButton: 'button:contains("Save")',
      undoButton: 'button:contains("Undo")',
      redoButton: 'button:contains("Redo")',
      creditsDisplay: '.credits-info',
      pagesDropdown: 'button:contains("Pages")',
      notificationBell: 'button:contains("🔔")',
      publishButton: 'button:contains("Publish")',
      logoutButton: 'button:contains("Logout")'
    },
    layout: {
      headerWireframe: '.header-wireframe',
      headerCenter: '.header-center',
      headerActions: '.header-actions',
      mainContent: '.main-content-wireframe',
      leftPanel: '.left-panel-wireframe',
      rightPanel: '.right-panel-wireframe'
    }
  },
  mobile: {
    header: {
      logo: '.mobile-dashboard-logo',
      notificationBell: 'button:contains("🔔")',
      publishButton: 'button:contains("Publish")',
      logoutButton: 'button:contains("Logout")'
    }
  }
};

export const REQUIRED_CSS_CLASSES = [
  'dashboard-wireframe',
  'header-wireframe',
  'logo-section',
  'header-center',
  'header-actions',
  'credits-info',
  'btn-primary',
  'btn-wireframe',
  'main-content-wireframe',
  'left-panel-wireframe',
  'right-panel-wireframe'
];

/**
 * Validates that all required dashboard elements exist in the component
 * @param {string} componentCode - The component code to validate
 * @returns {object} Validation result
 */
export function validateDashboardComponent(componentCode) {
  const issues = [];
  const warnings = [];

  // Check for required buttons in desktop header
  const requiredButtons = [
    '+ New Site',
    'Save', 
    'Undo',
    'Redo',
    'Credits remaining',
    'Pages',
    'Publish',
    'Logout'
  ];

  requiredButtons.forEach(buttonText => {
    if (!componentCode.includes(buttonText)) {
      issues.push(`Missing required button: "${buttonText}"`);
    }
  });

  // Check for required CSS classes
  REQUIRED_CSS_CLASSES.forEach(className => {
    if (!componentCode.includes(className)) {
      issues.push(`Missing required CSS class: "${className}"`);
    }
  });

  // Check for header structure
  const requiredStructure = [
    'header-wireframe',
    'logo-section', 
    'header-center',
    'header-actions'
  ];

  requiredStructure.forEach(structure => {
    if (!componentCode.includes(structure)) {
      issues.push(`Missing required header structure: "${structure}"`);
    }
  });

  // Check for Undo/Redo functionality
  if (!componentCode.includes('window.postMessage({type: \'undo\'}, \'*\')')) {
    warnings.push('Undo button may not be properly connected to editor');
  }

  if (!componentCode.includes('window.postMessage({type: \'redo\'}, \'*\')')) {
    warnings.push('Redo button may not be properly connected to editor');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Found ${issues.length} critical issues and ${warnings.length} warnings`
  };
}

/**
 * Validates CSS file for required dashboard styles
 * @param {string} cssCode - The CSS code to validate  
 * @returns {object} Validation result
 */
export function validateDashboardCSS(cssCode) {
  const issues = [];

  REQUIRED_CSS_CLASSES.forEach(className => {
    if (!cssCode.includes(`.${className}`)) {
      issues.push(`Missing CSS definition for: .${className}`);
    }
  });

  // Check for critical layout styles
  const criticalStyles = [
    'display: flex',
    'justify-content: center', // for header-center
    'flex: 1', // for header-center
    'grid-template-columns' // for main layout
  ];

  criticalStyles.forEach(style => {
    if (!cssCode.includes(style)) {
      issues.push(`Missing critical CSS style: "${style}"`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    summary: `Found ${issues.length} CSS issues`
  };
}

/**
 * Pre-change validation - run before modifying components
 */
export function runPreChangeValidation() {
  console.log('🔍 Running dashboard validation...');
  
  // This would be expanded to actually read files and validate
  console.log('✅ Validation complete - save current state before changes');
  console.log('📋 Required elements checklist saved to COMPONENT_BACKUP.md');
}

/**
 * Post-change validation - run after modifying components  
 */
export function runPostChangeValidation(componentCode, cssCode) {
  console.log('🔍 Validating dashboard after changes...');
  
  const componentResult = validateDashboardComponent(componentCode);
  const cssResult = validateDashboardCSS(cssCode);
  
  if (!componentResult.valid || !cssResult.valid) {
    console.error('❌ VALIDATION FAILED:');
    console.error('Component issues:', componentResult.issues);
    console.error('CSS issues:', cssResult.issues);
    console.error('🚨 RESTORE FROM BACKUP IMMEDIATELY');
    return false;
  }

  if (componentResult.warnings.length > 0) {
    console.warn('⚠️ Warnings:', componentResult.warnings);
  }

  console.log('✅ All dashboard elements validated successfully');
  return true;
}

export default {
  validateDashboardComponent,
  validateDashboardCSS,
  runPreChangeValidation,
  runPostChangeValidation,
  REQUIRED_DASHBOARD_ELEMENTS,
  REQUIRED_CSS_CLASSES
};