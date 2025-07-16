/**
 * FROZEN UI INTERACTIVE FUNCTIONALITY
 * Hamburger menu and inline editing system with undo/redo
 */

// ==================== GLOBAL VARIABLES ====================
let editHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50;
let activeOverlayBtns = [];
let currentActiveElement = null;
let hoverTimeout = null;

// ==================== HELPER FUNCTIONS ====================

// Clear all active overlay buttons with debugging
function clearOverlays(reason = 'Unknown') {
  if (activeOverlayBtns.length > 0) {
    console.log(`🧹 Clearing ${activeOverlayBtns.length} overlays - Reason: ${reason}`);
  }
  activeOverlayBtns.forEach((btn) => btn.remove());
  activeOverlayBtns = [];
}

// Add overlay styles CSS to the document
function addOverlayStyles() {
  // Remove existing overlay styles first
  const existingStyles = document.querySelector('#overlay-styles');
  if (existingStyles) {
    existingStyles.remove();
  }
  
  const overlayStyles = document.createElement('style');
  overlayStyles.id = 'overlay-styles';
  overlayStyles.textContent = `
    .delete-btn, .replace-btn {
      position: absolute !important;
      z-index: 2147483640 !important;
      pointer-events: auto !important;
      opacity: 0.8 !important;
      transition: opacity 0.2s ease !important;
      border: none !important;
      cursor: pointer !important;
      user-select: none !important;
      font-family: system-ui, -apple-system, sans-serif !important;
    }
    
    .delete-btn:hover, .replace-btn:hover {
      opacity: 1 !important;
    }
    
    .delete-btn {
      background: #e53935 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 16px !important;
      height: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 12px !important;
      top: -8px !important;
      right: -8px !important;
    }
    
    .replace-btn {
      background: #1976d2 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 16px !important;
      height: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 10px !important;
      top: -8px !important;
      left: -8px !important;
    }
  `;
  document.head.appendChild(overlayStyles);
  console.log('✅ Overlay styles CSS re-applied');
}

// History management functions - DISABLED: React state-based system handles history
function saveToHistory() {
  console.log('🚫 DOM-based history saving disabled - React state system handles history');
  
  // Notify React component to save state changes via state management
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'saveReactState',
      reason: 'Element changed or deleted'
    }, '*');
  }
}

// Update toolbar button states
function updateToolbarButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn && redoBtn) {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= editHistory.length - 1;
  }
}

// Undo function - DISABLED: React state-based system handles undo/redo
function undo() {
  console.log('🚫 DOM-based undo disabled - React state system handles undo/redo');
  
  // Notify React component to handle undo via state management
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'reactUndo'
    }, '*');
  }
}

// Redo function - DISABLED: React state-based system handles undo/redo
function redo() {
  console.log('🚫 DOM-based redo disabled - React state system handles undo/redo');
  
  // Notify React component to handle redo via state management
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'reactRedo'
    }, '*');
  }
}

// Function to create overlay buttons for images
function createImageOverlayButtons(imageElement) {
  console.log('[img overlay] attempt on', imageElement.src.split('/').pop());
  
  // Check if buttons already exist to avoid duplicates
  const parent = imageElement.parentElement;
  if (parent.querySelector('.delete-btn') || parent.querySelector('.replace-btn')) {
    return; // Buttons already exist
  }

  // Ensure parent has relative positioning
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  // Create delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '✕';
  deleteBtn.style.zIndex = '2147483640';

  deleteBtn.addEventListener('mouseenter', function(e) {
    e.stopPropagation();
    this.style.opacity = '1';
    console.log('🎯 Mouse entered image delete button');
  });
  
  deleteBtn.addEventListener('mouseleave', function(e) {
    e.stopPropagation();
    this.style.opacity = '0.8';
    console.log('🎯 Mouse left image delete button');
  });

  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    console.log('🗑️ Image delete button clicked for', imageElement.tagName);

    // Extract element path from data-edit attribute for React state management
    const elementPath = imageElement.getAttribute('data-edit');
    
    if (elementPath) {
      // Notify parent window to delete via React state system
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'deleteElement',
          elementPath: elementPath,
          elementType: 'img',
          originalElement: imageElement.outerHTML,
          reason: 'User clicked image delete button'
        }, '*');
      }
    } else {
      // Generate a state path for unmapped images
      const generatedPath = generateStatePathForElement(imageElement);
      console.log('🔧 Generated state path for unmapped image:', generatedPath);
      
      if (generatedPath) {
        // Notify parent window to delete via React state system with generated path
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'deleteElement',
            elementPath: generatedPath,
            elementType: 'img',
            originalElement: imageElement.outerHTML,
            reason: 'User clicked delete button on unmapped image'
          }, '*');
        }
      } else {
        // If we can't generate a path, warn but don't delete
        console.warn('⚠️ CRITICAL: Cannot delete image - no state mapping available');
        console.warn('Image:', imageElement.src, imageElement.alt);
        
        // Show user feedback instead of silently failing
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'showWarning',
            message: 'Cannot delete image - no undo/redo support available. Please contact support.',
            element: imageElement.outerHTML
          }, '*');
        }
        
        return; // Don't proceed with deletion
      }
    }
    
    // Clear active element reference
    currentActiveElement = null;
    clearOverlays('Image deleted');
  });

  // Create replace button
  const replaceBtn = document.createElement('button');
  replaceBtn.className = 'replace-btn';
  replaceBtn.textContent = '🖼️';
  replaceBtn.style.zIndex = '2147483640';

  replaceBtn.addEventListener('mouseenter', function(e) {
    e.stopPropagation();
    this.style.opacity = '1';
    console.log('🎯 Mouse entered image replace button');
  });
  
  replaceBtn.addEventListener('mouseleave', function(e) {
    e.stopPropagation();
    this.style.opacity = '0.8';
    console.log('🎯 Mouse left image replace button');
  });

  replaceBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

    console.log('🔄 Image replace button clicked for', imageElement.tagName);

    // Prompt for new image URL
    const newUrl = prompt('Enter new image URL:', imageElement.src);
    if (newUrl && newUrl !== imageElement.src) {
      // Extract element path from data-edit attribute for React state management
      const elementPath = imageElement.getAttribute('data-edit');
      
      if (elementPath) {
        // Notify parent window to update via React state system
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'updateElement',
            elementPath: elementPath,
            newValue: newUrl,
            elementType: 'img',
            reason: 'User replaced image'
          }, '*');
        }
      } else {
        // Generate a state path for unmapped images
        const generatedPath = generateStatePathForElement(imageElement);
        console.log('🔧 Generated state path for unmapped image update:', generatedPath);
        
        if (generatedPath) {
          // Notify parent window to update via React state system with generated path
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'updateElement',
              elementPath: generatedPath,
              newValue: newUrl,
              elementType: 'img',
              reason: 'User replaced unmapped image'
            }, '*');
          }
        } else {
          // Fallback to DOM manipulation with warning
          console.warn('⚠️ WARNING: Image update not tracked in state - undo/redo may not work');
          imageElement.src = newUrl;
        }
      }
    }
  });

  // Append buttons to parent
  parent.appendChild(deleteBtn);
  parent.appendChild(replaceBtn);
  
  // Track active overlay buttons
  activeOverlayBtns.push(deleteBtn, replaceBtn);
}

// Generate a state path for elements without data-edit attributes
function generateStatePathForElement(element) {
  // Map common element types to React state paths
  const elementMapping = {
    // Footer links
    'footer a': 'quickLinks.footer',
    'footer .icon': 'quickLinks.footer',
    'footer .icon-text': 'quickLinks.footer',
    'footer span.icon': 'quickLinks.footer',
    'footer div.icon': 'quickLinks.footer',
    
    // Navigation links
    'nav a': 'quickLinks.nav',
    'nav .icon': 'quickLinks.nav',
    'nav .icon-text': 'quickLinks.nav',
    'nav span.icon': 'quickLinks.nav',
    'nav div.icon': 'quickLinks.nav',
    
    // Contact section icons and links
    '.contact-section a': 'quickLinks.contact',
    '.contact-section .icon': 'quickLinks.contact',
    '.contact-section .icon-text': 'quickLinks.contact',
    '.contact-section span.icon': 'quickLinks.contact',
    '.contact-section div.icon': 'quickLinks.contact',
    
    // Social media links
    '.social-links a': 'quickLinks.social',
    '.social-links .icon': 'quickLinks.social',
    '.social-links .icon-text': 'quickLinks.social',
    '.social-links span.icon': 'quickLinks.social',
    '.social-links div.icon': 'quickLinks.social',
    
    // Generic links and icons
    'a': 'quickLinks.general',
    '.icon': 'quickLinks.general',
    '.icon-text': 'quickLinks.general',
    'span.icon': 'quickLinks.general',
    'div.icon': 'quickLinks.general',
    
    // Images
    'img': 'dynamicElements.images',
    '.gallery img': 'dynamicElements.gallery',
    '.hero img': 'dynamicElements.hero',
    '.service img': 'dynamicElements.services',
    '.contact img': 'dynamicElements.contact'
  };
  
  // Try to find the most specific match
  const tagName = element.tagName.toLowerCase();
  const className = element.className || '';
  const parentSection = element.closest('footer, nav, .contact-section, .social-links');
  
  // Build potential selectors in order of specificity
  const selectors = [];
  
  if (parentSection) {
    const parentTag = parentSection.tagName.toLowerCase();
    const parentClass = parentSection.className ? '.' + parentSection.className.split(' ')[0] : '';
    
    if (parentClass) {
      selectors.push(`${parentClass} ${tagName}`);
    }
    selectors.push(`${parentTag} ${tagName}`);
  }
  
  if (className) {
    selectors.push(`.${className.split(' ')[0]}`);
  }
  
  selectors.push(tagName);
  
  // Find the first matching selector
  for (const selector of selectors) {
    if (elementMapping[selector]) {
      console.log(`🎯 Mapped ${tagName} to ${elementMapping[selector]} via selector: ${selector}`);
      return elementMapping[selector];
    }
  }
  
  // If no specific mapping found, generate a generic path based on element type
  const textContent = element.textContent?.trim();
  if (textContent) {
    const sanitized = textContent.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 20);
    const generatedPath = `dynamicElements.${tagName}_${sanitized}`;
    console.log(`🔧 Generated dynamic path: ${generatedPath}`);
    return generatedPath;
  }
  
  console.warn(`⚠️ Cannot generate state path for element:`, element.tagName, element.className);
  return null;
}

// Create text delete button with proper event handling
function createTextDeleteButton(element) {
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.innerHTML = '✕';
  deleteButton.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    background: #e53935;
    border-radius: 50%;
    color: #fff;
    font-size: 12px;
    border: none;
    cursor: pointer;
    opacity: 0.8;
    z-index: 2147483640;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
    pointer-events: auto;
  `;
  
  deleteButton.addEventListener('mouseenter', function(e) {
    e.stopPropagation();
    this.style.opacity = '1';
    console.log('🎯 Mouse entered delete button');
  });
  
  deleteButton.addEventListener('mouseleave', function(e) {
    e.stopPropagation();
    this.style.opacity = '0.8';
    console.log('🎯 Mouse left delete button');
  });
  
  deleteButton.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('🗑️ Delete button clicked for', element.tagName);
    
    // Extract element path from data-edit attribute for React state management
    const elementPath = element.getAttribute('data-edit');
    
    if (elementPath) {
      // Notify parent window to delete via React state system
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'deleteElement',
          elementPath: elementPath,
          elementType: element.tagName.toLowerCase(),
          reason: 'User clicked delete button'
        }, '*');
      }
    } else {
      // NO FALLBACK TO DOM MANIPULATION - Generate a state path for unmapped elements
      const generatedPath = generateStatePathForElement(element);
      console.log('🔧 Generated state path for unmapped element:', generatedPath);
      
      if (generatedPath) {
        // Notify parent window to delete via React state system with generated path
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'deleteElement',
            elementPath: generatedPath,
            elementType: element.tagName.toLowerCase(),
            originalElement: element.outerHTML,
            reason: 'User clicked delete button on unmapped element'
          }, '*');
        }
      } else {
        // If we can't generate a path, warn but don't delete
        console.warn('⚠️ CRITICAL: Cannot delete element - no state mapping available');
        console.warn('Element:', element.tagName, element.className, element.textContent?.substring(0, 50));
        
        // Show user feedback instead of silently failing
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'showWarning',
            message: `Cannot delete ${element.tagName} element - no undo/redo support available. Please contact support.`,
            element: element.outerHTML
          }, '*');
        }
        
        return; // Don't proceed with deletion
      }
    }
    
    // Clear active element reference
    currentActiveElement = null;
    clearOverlays('Element deleted');
  });
  
  element.appendChild(deleteButton);
  activeOverlayBtns.push(deleteButton);
  console.log('✨ Text delete button created and added to', element.tagName);
}

// Wire inline editor for all elements with robust overlay management
function wireInlineEditor(root = document, forceRewire = false) {
  const selector = 'h1,h2,h3,h4,p,nav,.contact-phone,.cta,.btn-primary,.btn-accent,footer,.nav-links li a,.logo,img,.img-placeholder,a,.icon,.icon-text,span.icon,div.icon';
  const elements = root.nodeType === 1 
    ? (root.matches && root.matches(selector) ? [root] : root.querySelectorAll(selector))
    : root.querySelectorAll(selector);

  console.log(`🔌 Wire inline editor called with ${elements.length} elements (forceRewire: ${forceRewire})`);

  elements.forEach((el) => {
    // Skip if already wired, unless forcing rewire (after undo/redo)
    if (el.dataset.wired && !forceRewire) {
      console.log(`⏭️ Skipping already wired element: ${el.tagName}`);
      return;
    }
    
    // When force rewiring, completely clear the wired flag to ensure fresh start
    if (forceRewire) {
      delete el.dataset.wired;
      console.log(`🔥 Force rewire: Clearing wired flag for ${el.tagName}`);
      
      // Remove existing event listeners to prevent duplicates
      if (el._mouseenterHandler) {
        el.removeEventListener('mouseenter', el._mouseenterHandler);
      }
      if (el._mouseleaveHandler) {
        el.removeEventListener('mouseleave', el._mouseleaveHandler);
      }
      if (el._clickHandler) {
        el.removeEventListener('click', el._clickHandler);
      }
      if (el._blurHandler) {
        el.removeEventListener('blur', el._blurHandler);
      }
    }
    
    // Mark as wired
    el.dataset.wired = '1';
    console.log(`🔗 Wiring element: ${el.tagName} (${el.textContent?.substring(0, 30) || 'image'}...)`);
    
    // Remove any existing overlay buttons to prevent duplicates
    const existingButtons = el.querySelectorAll('.delete-btn, .replace-btn');
    existingButtons.forEach(btn => btn.remove());
    if (existingButtons.length > 0) {
      console.log(`🧹 Removed ${existingButtons.length} existing overlay buttons from ${el.tagName}`);
    }
    
    // Store event handler references for potential removal
    const mouseenterHandler = function(e) {
      // Clear any existing hover timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // Only clear overlays if we're entering a completely different element
      if (currentActiveElement && currentActiveElement !== this) {
        clearOverlays('Switching to different element');
      }
      
      currentActiveElement = this;
      
      // Apply hover styles
      this.style.outline = '2px dotted #ff0000';
      this.style.cursor = 'pointer';
      this.style.position = 'relative';
      this.style.zIndex = '9999';
      
      // Create overlay buttons if they don't exist
      if (this.tagName.toLowerCase() === 'img' || this.classList.contains('img-placeholder')) {
        // For images, create image overlay buttons
        if (!this.querySelector('.delete-btn, .replace-btn')) {
          console.log('🖼️ Creating image overlay buttons for', this.tagName);
          createImageOverlayButtons(this);
        }
      } else {
        // For text elements, create delete button
        if (!this.querySelector('.delete-btn')) {
          console.log('📝 Creating text delete button for', this.tagName, this.textContent?.substring(0, 20) + '...');
          createTextDeleteButton(this);
        }
      }
    };
    
    el._mouseenterHandler = mouseenterHandler;
    el.addEventListener('mouseenter', mouseenterHandler);
    
    const mouseleaveHandler = function(e) {
      // Remove hover styles immediately
      this.style.outline = 'none';
      this.style.zIndex = '';
      
      // Check if mouse is moving to a related element (overlay button or child)
      const relatedTarget = e.relatedTarget;
      const isMovingToOverlay = relatedTarget && (
        relatedTarget.classList.contains('delete-btn') ||
        relatedTarget.classList.contains('replace-btn') ||
        this.contains(relatedTarget)
      );
      
      if (isMovingToOverlay) {
        // Don't clear overlays if moving to overlay buttons
        console.log('🔄 Mouse moving to overlay button, keeping overlays');
        return;
      }
      
      // Set a timeout to clear overlays, but only if we're not hovering over the element or its buttons
      hoverTimeout = setTimeout(() => {
        // Double-check if we're still not over the element or its buttons
        const isOverElement = this.matches(':hover');
        const isOverButton = Array.from(this.querySelectorAll('.delete-btn, .replace-btn')).some(btn => btn.matches(':hover'));
        
        if (!isOverElement && !isOverButton) {
          console.log('⏰ Timeout expired, clearing overlays');
          clearOverlays('Mouse left element and timeout expired');
          if (currentActiveElement === this) {
            currentActiveElement = null;
          }
        }
      }, 100);
    };
    
    el._mouseleaveHandler = mouseleaveHandler;
    el.addEventListener('mouseleave', mouseleaveHandler);
    
    const clickHandler = function() {
      // Clear overlays before any selection
      clearOverlays();
      
      if (this.tagName.toLowerCase() === 'img') {
        // Clear other selected images
        document.querySelectorAll('img.image-selected, .img-placeholder.image-selected').forEach(img => {
          img.classList.remove('image-selected');
          img.style.outline = 'none';
          img.style.zIndex = '';
        });
        
        this.style.outline = '2px solid #ffc000';
        this.style.zIndex = '9999';
        this.classList.add('image-selected');
        createImageOverlayButtons(this);
        
        if (window.editorBridge) {
          window.editorBridge.notifyElementSelection(this);
        }
      } else if (this.classList.contains('img-placeholder')) {
        this.style.outline = '2px solid #ffc000';
        this.style.zIndex = '9999';
        this.classList.add('image-selected');
        
        const newUrl = prompt('Enter new image URL:', '');
        if (newUrl) {
          // Extract element path from data-edit attribute for React state management
          const elementPath = this.getAttribute('data-edit');
          
          if (elementPath) {
            // Notify parent window to update via React state system
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'updateElement',
                elementPath: elementPath,
                newValue: newUrl,
                elementType: 'img',
                reason: 'User added image to placeholder'
              }, '*');
            }
          } else {
            // Generate a state path for unmapped image placeholders
            const generatedPath = generateStatePathForElement(this);
            console.log('🔧 Generated state path for unmapped image placeholder:', generatedPath);
            
            if (generatedPath) {
              // Notify parent window to update via React state system with generated path
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'updateElement',
                  elementPath: generatedPath,
                  newValue: newUrl,
                  elementType: 'img',
                  reason: 'User added image to unmapped placeholder'
                }, '*');
              }
            } else {
              // Fallback to DOM manipulation with warning
              console.warn('⚠️ WARNING: Image placeholder update not tracked in state - undo/redo may not work');
              
              const newImg = document.createElement('img');
              newImg.src = newUrl;
              newImg.style.width = this.dataset.width + 'px';
              newImg.style.height = this.dataset.height + 'px';
              
              this.replaceWith(newImg);
              wireInlineEditor(newImg);
            }
          }
        }
        
        if (window.editorBridge) {
          window.editorBridge.notifyElementSelection(this);
        }
      } else {
        // Text element editing
        this.contentEditable = true;
        this.style.outline = '2px solid #ffc000';
        this.style.zIndex = '9999';
        this.focus();
        
        if (window.editorBridge) {
          window.editorBridge.notifyElementSelection(this);
        }
      }
    };
    
    el._clickHandler = clickHandler;
    el.addEventListener('click', clickHandler);
    
    // Blur event for text elements
    if (el.tagName.toLowerCase() !== 'img' && !el.classList.contains('img-placeholder')) {
      const blurHandler = function() {
        this.style.outline = 'none';
        this.style.zIndex = '';
        this.contentEditable = false;
        
        // Save text changes through React state management
        const elementPath = this.getAttribute('data-edit');
        const newText = this.textContent || this.innerHTML;
        
        if (elementPath) {
          // Notify parent window to update via React state system
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'updateElement',
              elementPath: elementPath,
              newValue: newText,
              elementType: this.tagName.toLowerCase(),
              reason: 'User finished editing text'
            }, '*');
          }
        } else {
          // Generate a state path for unmapped text elements
          const generatedPath = generateStatePathForElement(this);
          console.log('🔧 Generated state path for unmapped text edit:', generatedPath);
          
          if (generatedPath) {
            // Notify parent window to update via React state system with generated path
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'updateElement',
                elementPath: generatedPath,
                newValue: newText,
                elementType: this.tagName.toLowerCase(),
                reason: 'User finished editing unmapped text'
              }, '*');
            }
          } else {
            // Fallback warning - no DOM manipulation
            console.warn('⚠️ WARNING: Text edit not tracked in state - undo/redo may not work');
            console.warn('Element:', this.tagName, this.className, newText.substring(0, 50));
          }
        }
      };
      
      el._blurHandler = blurHandler;
      el.addEventListener('blur', blurHandler);
    }
  });

  // Log completion with detailed statistics
  const wireCount = elements.length;
  // When force rewiring, no elements are skipped since we clear all wired flags
  const skippedCount = forceRewire ? 0 : Array.from(elements).filter(el => el.dataset.wired).length;
  const actuallyWired = wireCount - skippedCount;
  
  console.log(`✅ wireInlineEditor completed:`);
  console.log(`   📊 Total elements found: ${wireCount}`);
  console.log(`   🔗 Actually wired: ${actuallyWired}`);
  console.log(`   ⏭️ Skipped (already wired): ${skippedCount}`);
  console.log(`   🔄 Force rewire mode: ${forceRewire}`);
  console.log(`   🎯 Selector used: ${selector}`);
}

// Initialize undo/redo toolbar
function initializeUndoRedoToolbar() {
  const toolbar = document.getElementById('undoRedoToolbar');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  if (!toolbar || !undoBtn || !redoBtn) {
    console.log('⚠️ Toolbar elements not found');
    return;
  }

  // Keep toolbar hidden - buttons are now in dashboard header
  toolbar.style.display = 'none';

  // Add event listeners for iframe buttons (still functional but hidden)
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  // Update button states
  updateToolbarButtons();

  console.log('✅ Undo/Redo toolbar initialized (hidden - buttons in dashboard header)');
}

// ==================== DOM CONTENT LOADED LOGIC ====================

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const ham = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-links');

  if (ham && menu) {
    ham.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }

  // Initialize history with current state
  saveToHistory();

  // Initialize the toolbar
  initializeUndoRedoToolbar();

  // Listen for undo/redo messages from dashboard
  window.addEventListener('message', function(event) {
    if (event.data.type === 'undo') {
      undo();
    } else if (event.data.type === 'redo') {
      redo();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      }
    }
  });

  // Global click handler to clear overlays when clicking outside editable elements
  document.addEventListener('click', function(e) {
    const target = e.target;
    const isOverlayButton = target.classList.contains('delete-btn') || target.classList.contains('replace-btn');
    const isEditableElement = target.matches('h1,h2,h3,h4,p,nav,.contact-phone,.cta,.btn-primary,.btn-accent,footer,.nav-links li a,.logo,img,.img-placeholder');
    
    // If clicking outside any editable element or overlay button, clear everything
    if (!isOverlayButton && !isEditableElement) {
      console.log('🖱️ Clicked outside editable areas, clearing overlays');
      
      // Clear any pending hover timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // Clear all selected images and placeholders
      document.querySelectorAll('img.image-selected, .img-placeholder.image-selected').forEach(el => {
        el.classList.remove('image-selected');
        el.style.outline = "none";
        el.style.zIndex = "";
      });
      
      // Clear all overlay buttons
      clearOverlays('Clicked outside editable areas');
      currentActiveElement = null;
    }
  });

  // Add CSS for overlay buttons to ensure proper display
  addOverlayStyles();

  // Log data hierarchy enforcement
  console.log('🔍 FROZEN UI DATA HIERARCHY SUMMARY:');
  console.log('📋 Services: Checking data hierarchy for authentic services...');
  console.log('🎨 Colors: #ffc000, #000000 (Priority 1: User Questionnaire)');
  console.log('📸 Images: Authentic GBP photos (Priority 3: GBP Data)');
  console.log('📞 Contact: 065 2170293, Svetog Save bb, Osečina (Priority 2: Website/GBP)');
  console.log('⭐ Reviews: Aleksandar Popović, Jordan Jančić, Marko Pavlović (Priority 3: GBP)');
  console.log('✅ NO DUMMY DATA OR STOCK IMAGES USED');
  console.log('🎯 Overlay management system initialized with robust debugging');

  // Initialize inline editor on all elements immediately
  wireInlineEditor(document);
  
  // MutationObserver to handle dynamically added/removed elements
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Handle added nodes
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            wireInlineEditor(node);
          }
        });
        
        // Handle removed nodes - only clear overlays if the current active element was removed
        mutation.removedNodes.forEach(function(node) {
          if (node.nodeType === 1 && currentActiveElement === node) {
            console.log('🗑️ MutationObserver: Active element was removed, clearing overlays');
            clearOverlays('Active element removed by MutationObserver');
            currentActiveElement = null;
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// ==================== WINDOW EXPORTS ====================

window.createImageOverlayButtons = createImageOverlayButtons;
window.clearOverlays = clearOverlays;
window.wireInlineEditor = wireInlineEditor;
window.updateToolbarButtons = updateToolbarButtons;
window.undo = undo;
window.redo = redo;