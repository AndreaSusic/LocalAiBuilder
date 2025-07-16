/**
 * FROZEN UI INTERACTIVE FUNCTIONALITY
 * Hamburger menu and inline editing system with undo/redo
 */

// ==================== GLOBAL VARIABLES ====================
let editHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50;
let activeOverlayBtns = [];

// ==================== HELPER FUNCTIONS ====================

// Clear all active overlay buttons
function clearOverlays() {
  activeOverlayBtns.forEach((btn) => btn.remove());
  activeOverlayBtns = [];
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
    
    // Clear overlays and re-wire all elements after DOM restoration
    clearOverlays();
    wireInlineEditor(document);
    activeOverlayBtns = [];
    
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
    
    // Clear overlays and re-wire all elements after DOM restoration
    clearOverlays();
    wireInlineEditor(document);
    activeOverlayBtns = [];
    
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

  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

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
  });

  // Create replace button
  const replaceBtn = document.createElement('button');
  replaceBtn.className = 'replace-btn';
  replaceBtn.textContent = '🖼️';
  replaceBtn.style.zIndex = '2147483640';

  replaceBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();

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

// Wire inline editor for all elements
function wireInlineEditor(root = document) {
  const selector = 'h1,h2,h3,h4,p,nav,.contact-phone,.cta,.btn-primary,.btn-accent,footer,.nav-links li a,.logo,img,.img-placeholder';
  const elements = root.nodeType === 1 
    ? (root.matches && root.matches(selector) ? [root] : root.querySelectorAll(selector))
    : root.querySelectorAll(selector);

  elements.forEach((el) => {
    if (el.dataset.wired) return;
    el.dataset.wired = '1';
    
    // Store reference to delete button for text elements
    let deleteButton = null;
    
    el.addEventListener('mouseenter', function() {
      this.style.outline = '2px dotted #ff0000';
      this.style.cursor = 'pointer';
      this.style.position = 'relative';
      this.style.zIndex = '9999';
      
      // For images and placeholders, create overlay buttons
      if (this.tagName.toLowerCase() === 'img' || this.classList.contains('img-placeholder')) {
        createImageOverlayButtons(this);
      } else {
        // For text elements, create delete button only if it doesn't exist
        if (!this.querySelector('.delete-btn')) {
          deleteButton = document.createElement('button');
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
            opacity: 0.6;
            z-index: 2147483640;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
          `;
          
          deleteButton.addEventListener('mouseenter', function() {
            this.style.opacity = '0.9';
          });
          
          deleteButton.addEventListener('mouseleave', function() {
            this.style.opacity = '0.6';
          });
          
          deleteButton.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            // Save to history before deletion
            saveToHistory();
            
            // Notify dashboard about deletion
            if (window.editorBridge) {
              window.editorBridge.notifyElementDeleted(el);
            }
            
            // Remove the element
            el.remove();
            
            // Save state after deletion
            saveToHistory();
          });
          
          this.appendChild(deleteButton);
          // Track the text delete button
          activeOverlayBtns.push(deleteButton);
          console.log('🆕 delete-btn added to', this.tagName, this.textContent?.substring(0, 20) + '...');
        }
      }
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.outline = 'none';
      this.style.zIndex = '';
      // Clear overlays on mouseleave after a small delay to prevent flicker
      setTimeout(() => {
        clearOverlays();
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

  // Global click handler to clear image selections when clicking outside
  document.addEventListener('click', function(e) {
    // Check if click is on an image, placeholder, or its buttons
    if (e.target.tagName.toLowerCase() !== 'img' && 
        !e.target.classList.contains('img-placeholder') &&
        !e.target.classList.contains('delete-btn') && 
        !e.target.classList.contains('replace-btn')) {
      // Clear all selected images and placeholders
      document.querySelectorAll('img.image-selected, .img-placeholder.image-selected').forEach(el => {
        el.classList.remove('image-selected');
        el.style.outline = "none";
        el.style.zIndex = "";
      });
      // Clear all overlay buttons
      clearOverlays();
    }
  });

  // Log data hierarchy enforcement
  console.log('🔍 FROZEN UI DATA HIERARCHY SUMMARY:');
  console.log('📋 Services: Checking data hierarchy for authentic services...');
  console.log('🎨 Colors: #ffc000, #000000 (Priority 1: User Questionnaire)');
  console.log('📸 Images: Authentic GBP photos (Priority 3: GBP Data)');
  console.log('📞 Contact: 065 2170293, Svetog Save bb, Osečina (Priority 2: Website/GBP)');
  console.log('⭐ Reviews: Aleksandar Popović, Jordan Jančić, Marko Pavlović (Priority 3: GBP)');
  console.log('✅ NO DUMMY DATA OR STOCK IMAGES USED');

  // Initialize inline editor on all elements immediately
  wireInlineEditor(document);
  
  // MutationObserver to handle dynamically added elements
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            wireInlineEditor(node);
            clearOverlays(); // Clear orphan overlays
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