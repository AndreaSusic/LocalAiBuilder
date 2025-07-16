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

// History management functions
function saveToHistory() {
  try {
    const snapshot = document.body.cloneNode(true).outerHTML;
    // Remove snapshots after current index (when user was in middle of history)
    editHistory = editHistory.slice(0, historyIndex + 1);
    editHistory.push(snapshot);
    
    // Limit history size
    if (editHistory.length > MAX_HISTORY) {
      editHistory.shift();
    } else {
      historyIndex++;
    }
    
    updateToolbarButtons();
    
    // Notify dashboard about history state
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'historyUpdate',
        canUndo: historyIndex > 0,
        canRedo: historyIndex < editHistory.length - 1
      }, '*');
    }
    
    console.log(`💾 Saved to history: ${historyIndex}/${editHistory.length - 1}`);
  } catch (error) {
    console.error('❌ Failed to save to history:', error);
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

// Undo function
function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const snapshot = editHistory[historyIndex];
    document.documentElement.innerHTML = 
      '<head>' + document.head.innerHTML + '</head>' + snapshot;
    console.log(`↶ Undo to index: ${historyIndex}`);
    
    // Reset all state variables
    clearOverlays('Undo operation');
    activeOverlayBtns = [];
    currentActiveElement = null;
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    
    // Re-add overlay styles CSS (gets lost during DOM restoration)
    addOverlayStyles();
    
    // Re-wire all elements after DOM restoration
    console.log('🔄 Re-wiring all elements after undo...');
    wireInlineEditor(document);
    console.log('✅ All elements re-wired after undo');
    
    // Update toolbar buttons
    updateToolbarButtons();
    
    // Notify dashboard about history state
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'historyUpdate',
        canUndo: historyIndex > 0,
        canRedo: historyIndex < editHistory.length - 1
      }, '*');
    }
  } else {
    console.log('↶ Cannot undo - at beginning of history');
  }
}

// Redo function
function redo() {
  if (historyIndex < editHistory.length - 1) {
    historyIndex++;
    const snapshot = editHistory[historyIndex];
    document.documentElement.innerHTML = 
      '<head>' + document.head.innerHTML + '</head>' + snapshot;
    console.log(`↷ Redo to index: ${historyIndex}`);
    
    // Reset all state variables
    clearOverlays('Redo operation');
    activeOverlayBtns = [];
    currentActiveElement = null;
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    
    // Re-add overlay styles CSS (gets lost during DOM restoration)
    addOverlayStyles();
    
    // Re-wire all elements after DOM restoration
    console.log('🔄 Re-wiring all elements after redo...');
    wireInlineEditor(document);
    console.log('✅ All elements re-wired after redo');
    
    // Update toolbar buttons
    updateToolbarButtons();
    
    // Notify dashboard about history state
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'historyUpdate',
        canUndo: historyIndex > 0,
        canRedo: historyIndex < editHistory.length - 1
      }, '*');
    }
  } else {
    console.log('↷ Cannot redo - at end of history');
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

    // Save current state before deletion
    saveToHistory();

    // Create placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'img-placeholder';
    placeholder.dataset.width = imageElement.offsetWidth || 200;
    placeholder.dataset.height = imageElement.offsetHeight || 150;
    placeholder.innerHTML = '<span>Click to add image</span>';
    placeholder.style.width = placeholder.dataset.width + 'px';
    placeholder.style.height = placeholder.dataset.height + 'px';

    // Replace image with placeholder
    imageElement.replaceWith(placeholder);

    // Re-wire the placeholder
    wireInlineEditor(placeholder);

    // Save state after change
    saveToHistory();

    // Notify dashboard about deletion
    if (window.editorBridge) {
      window.editorBridge.notifyElementDeleted(imageElement);
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

    // Save current state before potential change
    saveToHistory();

    // Prompt for new image URL
    const newUrl = prompt('Enter new image URL:', imageElement.src);
    if (newUrl && newUrl !== imageElement.src) {
      imageElement.src = newUrl;
      // Save state after change
      saveToHistory();
    }
  });

  // Append buttons to parent
  parent.appendChild(deleteBtn);
  parent.appendChild(replaceBtn);
  
  // Track active overlay buttons
  activeOverlayBtns.push(deleteBtn, replaceBtn);
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
    
    // Save to history before deletion
    saveToHistory();
    
    // Notify dashboard about deletion
    if (window.editorBridge) {
      window.editorBridge.notifyElementDeleted(element);
    }
    
    // Remove the element
    element.remove();
    
    // Save state after deletion
    saveToHistory();
    
    // Clear active element reference
    currentActiveElement = null;
    clearOverlays('Element deleted');
  });
  
  element.appendChild(deleteButton);
  activeOverlayBtns.push(deleteButton);
  console.log('✨ Text delete button created and added to', element.tagName);
}

// Wire inline editor for all elements with robust overlay management
function wireInlineEditor(root = document) {
  const selector = 'h1,h2,h3,h4,p,nav,.contact-phone,.cta,.btn-primary,.btn-accent,footer,.nav-links li a,.logo,img,.img-placeholder';
  const elements = root.nodeType === 1 
    ? (root.matches && root.matches(selector) ? [root] : root.querySelectorAll(selector))
    : root.querySelectorAll(selector);

  elements.forEach((el) => {
    if (el.dataset.wired) return;
    el.dataset.wired = '1';
    
    el.addEventListener('mouseenter', function(e) {
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
    });
    
    el.addEventListener('mouseleave', function(e) {
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
    });
    
    el.addEventListener('click', function() {
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
        
        saveToHistory();
        
        const newUrl = prompt('Enter new image URL:', '');
        if (newUrl) {
          const newImg = document.createElement('img');
          newImg.src = newUrl;
          newImg.style.width = this.dataset.width + 'px';
          newImg.style.height = this.dataset.height + 'px';
          
          this.replaceWith(newImg);
          saveToHistory();
          wireInlineEditor(newImg);
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
    });
    
    // Blur event for text elements
    if (el.tagName.toLowerCase() !== 'img' && !el.classList.contains('img-placeholder')) {
      el.addEventListener('blur', function() {
        this.style.outline = 'none';
        this.style.zIndex = '';
        saveToHistory();
      });
    }
  });
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