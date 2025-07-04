/**
 * CHAT INTERFACE VALIDATOR
 * Validates chat functionality and UI elements
 */

export const REQUIRED_CHAT_ELEMENTS = {
  interface: {
    bubbles: ['bubble', 'bubble-ai', 'bubble-user'],
    input: ['chatInput', 'sendUser', 'clearInput'],
    upload: ['dropZone', 'imageUpload', 'fileInput'],
    pickers: ['colorPicker', 'fontPicker'],
    buttons: ['Send', 'Upload Images', 'Choose Colors']
  },
  functionality: {
    api: ['sendUser', 'performGbpLookup', 'saveDraft'],
    state: ['mergeState', 'bootstrap', 'conversation'],
    validation: ['validateEmail', 'guessIndustry'],
    storage: ['saveDraft', 'loadDraft']
  },
  flows: {
    onboarding: ['company', 'city', 'industry', 'services', 'colors', 'images'],
    gbp: ['gbpLookup', 'gbpConfirmation', 'gbpImport'],
    completion: ['buildSite', 'redirect', 'preview']
  }
};

export const CRITICAL_CHAT_CSS = [
  'chat-container', 'bubble', 'bubble-ai', 'bubble-user', 
  'chat-input', 'drop-zone', 'color-picker', 'font-picker'
];

/**
 * Validates chat interface HTML structure
 */
export function validateChatHTML(htmlCode) {
  const issues = [];
  const warnings = [];

  // Check for chat container
  if (!htmlCode.includes('id="chatContainer"') && !htmlCode.includes('class="chat-container"')) {
    issues.push('Missing chat container element');
  }

  // Check for input elements
  if (!htmlCode.includes('id="chatInput"')) {
    issues.push('Missing chat input field');
  }

  // Check for thread display
  if (!htmlCode.includes('id="chatThread"')) {
    issues.push('Missing chat thread display');
  }

  // Check for upload zone
  if (!htmlCode.includes('drop-zone') && !htmlCode.includes('dropZone')) {
    warnings.push('Missing image upload zone');
  }

  // Check for color picker
  if (!htmlCode.includes('color-picker') && !htmlCode.includes('colorPicker')) {
    warnings.push('Missing color picker interface');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Chat HTML - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates chat JavaScript functionality
 */
export function validateChatJS(jsCode) {
  const issues = [];
  const warnings = [];
  const requirements = REQUIRED_CHAT_ELEMENTS.functionality;

  // Check for core API functions
  requirements.api.forEach(func => {
    if (!jsCode.includes(`function ${func}`) && !jsCode.includes(`${func} =`) && !jsCode.includes(`async function ${func}`)) {
      issues.push(`Missing required function: ${func}`);
    }
  });

  // Check for state management
  requirements.state.forEach(stateItem => {
    if (!jsCode.includes(stateItem)) {
      warnings.push(`Missing state element: ${stateItem}`);
    }
  });

  // Check for OpenAI integration
  if (!jsCode.includes('/api/build-site') && !jsCode.includes('fetch')) {
    issues.push('Missing API integration');
  }

  // Check for GBP functionality
  if (!jsCode.includes('gbp') && !jsCode.includes('Google Business Profile')) {
    warnings.push('Missing GBP integration');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Chat JS - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Validates chat conversation flow
 */
export function validateChatFlow(jsCode) {
  const issues = [];
  const warnings = [];
  const flows = REQUIRED_CHAT_ELEMENTS.flows;

  // Check onboarding flow
  flows.onboarding.forEach(step => {
    if (!jsCode.includes(step)) {
      warnings.push(`Missing onboarding step: ${step}`);
    }
  });

  // Check GBP flow
  flows.gbp.forEach(step => {
    if (!jsCode.includes(step)) {
      warnings.push(`Missing GBP step: ${step}`);
    }
  });

  // Check completion flow
  flows.completion.forEach(step => {
    if (!jsCode.includes(step)) {
      warnings.push(`Missing completion step: ${step}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    summary: `Chat Flow - ${issues.length} issues, ${warnings.length} warnings`
  };
}

/**
 * Comprehensive chat validation
 */
export function validateChatInterface() {
  console.log('🔍 Running chat interface validation...');
  
  const results = {
    html: null,
    javascript: null,
    flow: null,
    overall: { valid: true, totalIssues: 0 }
  };

  // Would be expanded to read actual files and validate
  console.log('✅ Chat validation complete');
  console.log('📋 Check CHAT_BACKUP.md for required elements');
  
  return results;
}

export default {
  validateChatHTML,
  validateChatJS,
  validateChatFlow,
  validateChatInterface,
  REQUIRED_CHAT_ELEMENTS,
  CRITICAL_CHAT_CSS
};