/**
 * INLINE EDITOR BRIDGE
 * Framework-agnostic inline editing system for live preview iframe
 * Turns every text and media node into editable zones with floating toolbar
 */

// Global state
let currentEditableElement = null;
let toolbar = null;
let isToolbarActive = false;

// Toolbar commands mapping
const COMMANDS = {
  '𝐁': () => document.execCommand('bold'),
  '𝑰': () => document.execCommand('italic'),
  '𝑼': () => document.execCommand('underline'),
  'List': () => document.execCommand('insertUnorderedList'),
  '8px': () => document.execCommand('fontSize', false, '1'),
  'A🖌️': () => pickColor('foreColor'),
  '🖍️': () => pickColor('hiliteColor'),
  '🖼️': () => insertMedia('image'),
  '🎥': () => insertMedia('video'),
  '↔️↕️': () => toggleResizeBox(),
  '📐': () => openSpacingPanel(),
  'H₁': () => document.execCommand('formatBlock', false, 'H1'),
  '¶': () => document.execCommand('formatBlock', false, 'P'),
  '🔲': () => insertComponent('card'),
  '📋': () => pastePlain(),
  '</>': () => toggleCodeView(),
  '🔘': () => insertComponent('button')
};

// Initialize the editor bridge
function initEditorBridge() {
  console.log('🔧 Initializing Editor Bridge...');
  
  // Load CSS
  loadEditorStyles();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEditableElements);
  } else {
    setupEditableElements();
  }
  
  // Setup global event listeners
  setupGlobalListeners();
}

// Load editor styles
function loadEditorStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/editorToolbar.css';
  document.head.appendChild(link);
}

// Setup editable elements
function setupEditableElements() {
  console.log('🏷️ Setting up editable elements...');
  
  // Find all text elements that should be editable
  const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, figcaption, blockquote');
  
  textElements.forEach(element => {
    // Skip if element is already marked as non-editable or is part of navigation/toolbar
    if (element.closest('[contenteditable="false"]') || 
        element.closest('.ez-toolbar') || 
        element.closest('nav') || 
        element.closest('header') ||
        element.closest('script') ||
        element.closest('style')) {
      return;
    }
    
    // Skip if element is empty or only contains whitespace
    if (!element.textContent.trim()) {
      return;
    }
    
    // Mark as editable
    element.setAttribute('data-editable', 'true');
    element.style.cursor = 'text';
    element.style.minHeight = '1em';
    
    // Add hover effect
    element.addEventListener('mouseenter', () => {
      if (!isToolbarActive) {
        element.style.outline = '2px dashed #007cff';
        element.style.outlineOffset = '2px';
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (!isToolbarActive || element !== currentEditableElement) {
        element.style.outline = 'none';
      }
    });
  });
  
  console.log(`✅ Made ${textElements.length} elements editable`);
}

// Setup global event listeners
function setupGlobalListeners() {
  // Click handler for editable elements
  document.addEventListener('click', handleElementClick);
  
  // Keydown handler for Enter key and shortcuts
  document.addEventListener('keydown', handleKeydown);
  
  // Input handler for auto-save
  document.addEventListener('input', handleInput);
  
  // Blur handler to hide toolbar
  document.addEventListener('blur', handleBlur, true);
  
  // Click outside to deactivate
  document.addEventListener('click', handleOutsideClick);
}

// Handle element clicks
function handleElementClick(e) {
  const element = e.target;
  
  // Check if clicked element is editable
  if (element.getAttribute('data-editable') === 'true') {
    e.preventDefault();
    activateElement(element);
  }
}

// Activate element for editing
function activateElement(element) {
  console.log('✏️ Activating element for editing:', element.tagName);
  
  // Deactivate previous element
  if (currentEditableElement && currentEditableElement !== element) {
    deactivateElement(currentEditableElement);
  }
  
  // Set as current editable element
  currentEditableElement = element;
  isToolbarActive = true;
  
  // Make contenteditable
  element.contentEditable = 'true';
  element.focus();
  
  // Show visual feedback
  element.style.outline = '2px solid #007cff';
  element.style.outlineOffset = '2px';
  element.style.backgroundColor = 'rgba(0, 124, 255, 0.05)';
  
  // Show toolbar
  showToolbar(element);
}

// Deactivate element
function deactivateElement(element) {
  if (!element) return;
  
  element.contentEditable = 'false';
  element.style.outline = 'none';
  element.style.backgroundColor = '';
  
  // Save changes
  saveElementChanges(element);
}

// Show floating toolbar
function showToolbar(element) {
  if (!toolbar) {
    toolbar = createToolbar();
    document.body.appendChild(toolbar);
  }
  
  // Position toolbar above element
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  toolbar.style.top = (rect.top + scrollTop - toolbar.offsetHeight - 10) + 'px';
  toolbar.style.left = (rect.left + scrollLeft) + 'px';
  toolbar.style.display = 'flex';
  
  // Ensure toolbar is visible
  toolbar.style.zIndex = '10000';
}

// Create toolbar
function createToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'ez-toolbar';
  toolbar.contentEditable = 'false';
  
  // Create buttons
  Object.keys(COMMANDS).forEach(command => {
    const button = document.createElement('button');
    button.className = 'ez-btn';
    button.textContent = command;
    button.title = getCommandTitle(command);
    button.contentEditable = 'false';
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      COMMANDS[command]();
    });
    
    toolbar.appendChild(button);
  });
  
  return toolbar;
}

// Get command title for tooltip
function getCommandTitle(command) {
  const titles = {
    '𝐁': 'Bold',
    '𝑰': 'Italic',
    '𝑼': 'Underline',
    'List': 'Bullet List',
    '8px': 'Small Font',
    'A🖌️': 'Text Color',
    '🖍️': 'Highlight',
    '🖼️': 'Insert Image',
    '🎥': 'Insert Video',
    '↔️↕️': 'Resize',
    '📐': 'Spacing',
    'H₁': 'Heading 1',
    '¶': 'Paragraph',
    '🔲': 'Insert Card',
    '📋': 'Paste Plain',
    '</>': 'Code View',
    '🔘': 'Insert Button'
  };
  return titles[command] || command;
}

// Handle keydown events
function handleKeydown(e) {
  // Handle Enter key
  if (e.key === 'Enter' && currentEditableElement) {
    if (!e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertParagraph');
    }
  }
  
  // Handle keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'b':
        e.preventDefault();
        COMMANDS['𝐁']();
        break;
      case 'i':
        e.preventDefault();
        COMMANDS['𝑰']();
        break;
      case 'u':
        e.preventDefault();
        COMMANDS['𝑼']();
        break;
    }
  }
  
  // Handle Escape key to deactivate
  if (e.key === 'Escape' && currentEditableElement) {
    deactivateCurrentElement();
  }
}

// Handle input events for auto-save
function handleInput(e) {
  if (e.target.getAttribute('data-editable') === 'true') {
    // Debounced save
    clearTimeout(window.editorSaveTimeout);
    window.editorSaveTimeout = setTimeout(() => {
      saveElementChanges(e.target);
    }, 1000);
  }
}

// Handle blur events
function handleBlur(e) {
  // Don't hide toolbar if focus moved to toolbar
  if (e.relatedTarget && e.relatedTarget.closest('.ez-toolbar')) {
    return;
  }
  
  // Small delay to allow for toolbar interactions
  setTimeout(() => {
    if (document.activeElement && !document.activeElement.closest('.ez-toolbar')) {
      hideToolbar();
    }
  }, 100);
}

// Handle outside clicks
function handleOutsideClick(e) {
  if (!e.target.closest('[data-editable="true"]') && 
      !e.target.closest('.ez-toolbar')) {
    deactivateCurrentElement();
  }
}

// Deactivate current element
function deactivateCurrentElement() {
  if (currentEditableElement) {
    deactivateElement(currentEditableElement);
    currentEditableElement = null;
    isToolbarActive = false;
    hideToolbar();
  }
}

// Hide toolbar
function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

// Save element changes
function saveElementChanges(element) {
  const data = {
    element: element.tagName,
    content: element.innerHTML,
    text: element.textContent,
    id: element.id || null,
    classes: element.className || null
  };
  
  // Post message to parent window (dashboard)
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'editor-save',
      data: data
    }, '*');
  }
  
  console.log('💾 Saved changes:', data);
}

// Command implementations
function pickColor(command) {
  const color = prompt('Enter color (hex, rgb, or name):');
  if (color) {
    document.execCommand(command, false, color);
  }
}

function insertMedia(type) {
  const url = prompt(`Enter ${type} URL:`);
  if (url) {
    const element = type === 'image' ? 
      `<img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto;">` :
      `<video src="${url}" controls style="max-width: 100%; height: auto;">`;
    
    document.execCommand('insertHTML', false, element);
  }
}

function toggleResizeBox() {
  // Toggle resize handles on selected element
  console.log('🔄 Toggle resize box');
}

function openSpacingPanel() {
  // Open spacing/margin panel
  console.log('📐 Open spacing panel');
}

function insertComponent(type) {
  let html = '';
  
  switch (type) {
    case 'card':
      html = `<div class="card" style="border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
        <h3>Card Title</h3>
        <p>Card content goes here...</p>
      </div>`;
      break;
    case 'button':
      html = `<button style="background: #007cff; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">Button Text</button>`;
      break;
  }
  
  if (html) {
    document.execCommand('insertHTML', false, html);
  }
}

function pastePlain() {
  // Paste as plain text
  navigator.clipboard.readText().then(text => {
    document.execCommand('insertText', false, text);
  });
}

function toggleCodeView() {
  if (currentEditableElement) {
    const isCodeView = currentEditableElement.getAttribute('data-code-view') === 'true';
    
    if (isCodeView) {
      // Switch back to visual
      currentEditableElement.innerHTML = currentEditableElement.textContent;
      currentEditableElement.setAttribute('data-code-view', 'false');
      currentEditableElement.style.fontFamily = '';
      currentEditableElement.style.whiteSpace = '';
    } else {
      // Switch to code view
      currentEditableElement.textContent = currentEditableElement.innerHTML;
      currentEditableElement.setAttribute('data-code-view', 'true');
      currentEditableElement.style.fontFamily = 'monospace';
      currentEditableElement.style.whiteSpace = 'pre-wrap';
    }
  }
}

// Initialize when script loads
initEditorBridge();

// Export for debugging
window.editorBridge = {
  activate: activateElement,
  deactivate: deactivateCurrentElement,
  toolbar: () => toolbar,
  current: () => currentEditableElement
};