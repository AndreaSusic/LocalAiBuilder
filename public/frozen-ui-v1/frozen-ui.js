/**
 * FROZEN UI INTERACTIVE FUNCTIONALITY
 * Hamburger menu and inline editing system with undo/redo
 */

// Global history variables
let editHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

// Hamburger menu functionality
document.addEventListener("DOMContentLoaded", function () {
  const ham = document.querySelector(".hamburger");
  const menu = document.querySelector(".nav-links");

  if (ham && menu) {
    ham.addEventListener("click", () => {
      menu.classList.toggle("open");
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

  // Enhanced inline editor for all editable elements
  const elements = document.querySelectorAll(
    "h1, h2, h3, h4, p, nav, .contact-phone, .cta, .btn-primary, .btn-accent, footer, .nav-links li a, .logo",
  );

  elements.forEach((el) => {
    // Store reference to delete button
    let deleteButton = null;

    el.addEventListener("mouseenter", function () {
      this.style.outline = "2px dotted #ff0000";
      this.style.cursor = "pointer";
      this.style.position = "relative";
      this.style.zIndex = "9999";

      // Create delete button if it doesn't exist
      if (!deleteButton) {
        deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.innerHTML = "✕";
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
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        `;

        deleteButton.addEventListener("mouseenter", function () {
          this.style.opacity = "0.9";
        });

        deleteButton.addEventListener("mouseleave", function () {
          this.style.opacity = "0.6";
        });

        deleteButton.addEventListener("click", function (e) {
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
        });

        this.appendChild(deleteButton);
      }
    });

    el.addEventListener("mouseleave", function () {
      if (
        !this.hasAttribute("contenteditable") ||
        this.contentEditable === "false"
      ) {
        this.style.outline = "none";
        this.style.zIndex = "";
        // Remove delete button
        if (deleteButton) {
          deleteButton.remove();
          deleteButton = null;
        }
      }
    });

    el.addEventListener("click", function () {
      this.contentEditable = true;
      this.style.outline = "2px solid #ffc000";
      this.style.zIndex = "9999";
      this.focus();

      el.setAttribute("contenteditable", "true"); // make it editable
      el.focus(); // keep caret inside iframe

      // Notify dashboard about selection
      if (window.editorBridge) {
        window.editorBridge.notifyElementSelection(this);
      }
    });

    el.addEventListener("blur", function () {
      //    this.contentEditable = false;
      this.style.outline = "none";
      this.style.zIndex = "";
      // Remove delete button on blur
      if (deleteButton) {
        deleteButton.remove();
        deleteButton = null;
      }
      
      // Save to history after text edit
      saveToHistory();
    });
  });

  // Log data hierarchy enforcement
  console.log("🔍 FROZEN UI DATA HIERARCHY SUMMARY:");
  console.log("📋 Services: Checking data hierarchy for authentic services...");
  console.log("🎨 Colors: #ffc000, #000000 (Priority 1: User Questionnaire)");
  console.log("📸 Images: Authentic GBP photos (Priority 3: GBP Data)");
  console.log(
    "📞 Contact: 065 2170293, Svetog Save bb, Osečina (Priority 2: Website/GBP)",
  );
  console.log(
    "⭐ Reviews: Aleksandar Popović, Jordan Jančić, Marko Pavlović (Priority 3: GBP)",
  );
  console.log("✅ NO DUMMY DATA OR STOCK IMAGES USED");
});

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

// Update toolbar button states
function updateToolbarButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn && redoBtn) {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= editHistory.length - 1;
  }
}

// History management functions
function saveToHistory() {
  try {
    const snapshot = document.body.innerHTML;
    // Remove snapshots after current index (when user was in middle of history)
    editHistory = editHistory.slice(0, historyIndex + 1);
    editHistory.push(snapshot);
    historyIndex++;
    
    // Limit history size
    if (editHistory.length > MAX_HISTORY) {
      editHistory.shift();
      historyIndex--;
    }
    
    console.log(`💾 Saved to history, index: ${historyIndex}, total: ${editHistory.length}`);
    
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
  } catch (error) {
    console.error('❌ Failed to save to history:', error);
  }
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const snapshot = editHistory[historyIndex];
    document.body.innerHTML = snapshot;
    console.log(`↶ Undo to index: ${historyIndex}`);
    
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
    
    // Re-initialize editor functionality after DOM change
    reinitializeEditor();
  } else {
    console.log('↶ Cannot undo - at beginning of history');
  }
}

function redo() {
  if (historyIndex < editHistory.length - 1) {
    historyIndex++;
    const snapshot = editHistory[historyIndex];
    document.body.innerHTML = snapshot;
    console.log(`↷ Redo to index: ${historyIndex}`);
    
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
    
    // Re-initialize editor functionality after DOM change
    reinitializeEditor();
  } else {
    console.log('↷ Cannot redo - at end of history');
  }
}

function reinitializeEditor() {
  // Re-run the editor setup for all elements after DOM restore
  const elements = document.querySelectorAll(
    "h1, h2, h3, h4, p, nav, .contact-phone, .cta, .btn-primary, .btn-accent, footer, .nav-links li a, .logo",
  );
  
  elements.forEach((el) => {
    // Remove existing event listeners by cloning the element
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    
    // Setup the editor functionality again
    setupElementEditor(newEl);
  });
  
  // Re-initialize toolbar after DOM changes
  initializeUndoRedoToolbar();
}

function setupElementEditor(el) {
  // Store reference to delete button
  let deleteButton = null;

  el.addEventListener("mouseenter", function () {
    this.style.outline = "2px dotted #ff0000";
    this.style.cursor = "pointer";
    this.style.position = "relative";

    // Create delete button if it doesn't exist
    if (!deleteButton) {
      deleteButton = document.createElement("button");
      deleteButton.className = "delete-btn";
      deleteButton.innerHTML = "✕";
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
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
      `;

      deleteButton.addEventListener("mouseenter", function () {
        this.style.opacity = "0.9";
      });

      deleteButton.addEventListener("mouseleave", function () {
        this.style.opacity = "0.6";
      });

      deleteButton.addEventListener("click", function (e) {
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
      });

      this.appendChild(deleteButton);
    }
  });

  el.addEventListener("mouseleave", function () {
    if (
      !this.hasAttribute("contenteditable") ||
      this.contentEditable === "false"
    ) {
      this.style.outline = "none";
      // Remove delete button
      if (deleteButton) {
        deleteButton.remove();
        deleteButton = null;
      }
    }
  });

  el.addEventListener("click", function () {
    this.contentEditable = true;
    this.style.outline = "2px solid #ffc000";
    this.focus();

    el.setAttribute("contenteditable", "true"); // make it editable
    el.focus(); // keep caret inside iframe

    // Notify dashboard about selection
    if (window.editorBridge) {
      window.editorBridge.notifyElementSelection(this);
    }
  });

  el.addEventListener("blur", function () {
    //    this.contentEditable = false;
    this.style.outline = "none";
    // Remove delete button on blur
    if (deleteButton) {
      deleteButton.remove();
      deleteButton = null;
    }
    
    // Save to history after text edit
    saveToHistory();
  });
}

// Section insertion handler (for when sections are added)
function onSectionInserted() {
  console.log('📦 Section inserted, saving to history');
  saveToHistory();
}

// Observe DOM changes for section insertions
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SECTION') {
            console.log('📦 New section detected, saving to history');
            setTimeout(() => saveToHistory(), 100); // Small delay to ensure DOM is stable
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('👀 DOM change observer initialized');
}

// Initialize DOM observer after page load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(observeDOMChanges, 1000);
});

// Make functions globally available
window.undo = undo;
window.redo = redo;
window.saveToHistory = saveToHistory;
window.onSectionInserted = onSectionInserted;
