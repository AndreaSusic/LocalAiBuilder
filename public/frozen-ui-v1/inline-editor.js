/**
 * INLINE EDITOR BRIDGE FOR FROZEN UI
 * Makes elements editable and responds to dashboard toolbar commands
 */

class InlineEditor {
  constructor() {
    this.isActive = false;
    this.currentElement = null;
    this.init();
  }

  init() {
    this.makeElementsEditable();
    this.setupMessageListener();
    this.setupClickHandlers();
    console.log('🔧 Inline Editor: Initialized in iframe');
  }

  makeElementsEditable() {
    // Make text elements editable
    const textSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'div:not(.nav-links):not(.contact-grid):not(.features)',
      '.hero h1', '.hero p',
      '.location-text h2', '.location-text p',
      '.secondary-cta h2', '.secondary-cta p',
      'footer h4', 'footer p'
    ];

    textSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Skip if already processed or contains child elements
        if (element.dataset.editable || element.children.length > 0) return;
        
        element.setAttribute('data-editable', 'true');
        element.style.cursor = 'pointer';
        
        // Add hover effect
        element.addEventListener('mouseenter', () => {
          if (!element.contentEditable || element.contentEditable === 'false') {
            element.style.outline = '2px dotted #ff0000';
            element.style.outlineOffset = '2px';
          }
        });
        
        element.addEventListener('mouseleave', () => {
          if (!element.contentEditable || element.contentEditable === 'false') {
            element.style.outline = 'none';
          }
        });
      });
    });

    console.log(`🔧 Inline Editor: Made ${document.querySelectorAll('[data-editable="true"]').length} elements editable`);
  }

  setupClickHandlers() {
    document.addEventListener('click', (e) => {
      const editable = e.target.closest('[data-editable="true"]');
      if (editable) {
        e.preventDefault();
        this.activateElement(editable);
      }
    });
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'contentChanged') {
        this.handleFormatCommand(event.data.command, event.data.value);
      }
    });
  }

  activateElement(element) {
    // Deactivate previous element
    if (this.currentElement && this.currentElement !== element) {
      this.deactivateElement();
    }

    this.currentElement = element;
    element.contentEditable = 'true';
    element.focus();
    
    // Update styling
    element.style.outline = '2px solid #ffc000';
    element.style.outlineOffset = '2px';
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    console.log('🔧 Inline Editor: Activated element', element.tagName);
  }

  deactivateElement() {
    if (this.currentElement) {
      this.currentElement.contentEditable = 'false';
      this.currentElement.style.outline = 'none';
      this.currentElement = null;
      
      // Clear selection
      const selection = window.getSelection();
      selection.removeAllRanges();
    }
  }

  handleFormatCommand(command, value) {
    if (!this.currentElement) {
      console.warn('🔧 Inline Editor: No active element for command', command);
      return;
    }

    // Ensure element is focused
    this.currentElement.focus();
    
    // Execute the command
    try {
      document.execCommand(command, false, value);
      console.log(`🔧 Inline Editor: Applied ${command}${value ? ` with value ${value}` : ''}`);
    } catch (error) {
      console.error('🔧 Inline Editor: Command failed', command, error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.inlineEditor = new InlineEditor();
  });
} else {
  window.inlineEditor = new InlineEditor();
}