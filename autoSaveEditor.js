/**
 * AUTO-SAVE INLINE EDITOR SYSTEM
 * Profile-based automatic persistence of all page edits
 * Connects to backend API for user-specific storage
 */

console.log('🚀 Auto-save editor bridge starting...');

let activeElement = null;
let toolbar = null;
let currentPageId = null;
let saveTimeout = null;
let isAuthenticated = false;

// Initialize the auto-save editor
function initAutoSaveEditor() {
  console.log('💾 Initializing auto-save inline editor...');
  
  // Get current page ID from URL or generate one
  currentPageId = getCurrentPageId();
  
  // Check authentication status
  checkAuthStatus();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoSaveEditor);
  } else {
    setupAutoSaveEditor();
  }
}

function getCurrentPageId() {
  // Extract page ID from current URL
  const path = window.location.pathname;
  if (path.includes('/t/v1/')) {
    return path.split('/t/v1/')[1] || 'homepage-v1';
  }
  return 'homepage-v1';
}

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/me');
    isAuthenticated = response.ok;
    console.log('🔐 User authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
  } catch (error) {
    console.log('⚠️ Could not check auth status:', error.message);
    isAuthenticated = false;
  }
}

function setupAutoSaveEditor() {
  console.log('📝 Setting up auto-save editor...');
  
  // Add styles
  addEditorStyles();
  
  // Mark elements as editable
  markEditableElements();
  
  // Load existing edits from server
  if (isAuthenticated) {
    loadExistingEdits();
  }
  
  // Setup event listeners
  setupAutoSaveEventListeners();
  
  // Create toolbar
  createAutoSaveToolbar();
  
  console.log('✅ Auto-save editor setup complete');
}

function addEditorStyles() {
  const style = document.createElement('style');
  style.textContent = `
    [data-editable="true"]:hover {
      outline: 2px dotted #ff0000 !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
    }
    
    [data-editable="true"][contenteditable="true"] {
      outline: 2px solid #ffc000 !important;
      outline-offset: 2px !important;
    }
    
    .auto-save-toolbar {
      position: fixed !important;
      background: white !important;
      border: 2px solid #333 !important;
      border-radius: 8px !important;
      padding: 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
      z-index: 99999 !important;
      display: none !important;
      flex-wrap: wrap !important;
      gap: 4px !important;
      min-width: 350px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    
    .auto-save-btn {
      font: 14px/1 sans-serif !important;
      padding: 8px 12px !important;
      cursor: pointer !important;
      border: 1px solid #333 !important;
      border-radius: 4px !important;
      background: #f8f8f8 !important;
      min-width: 40px !important;
      color: #333 !important;
      font-weight: 500 !important;
    }
    
    .auto-save-btn:hover {
      background: #e8e8e8 !important;
      border-color: #000 !important;
    }
    
    .auto-save-status {
      position: fixed !important;
      top: 10px !important;
      right: 10px !important;
      background: #4CAF50 !important;
      color: white !important;
      padding: 8px 16px !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      z-index: 99998 !important;
      display: none !important;
    }
    
    .auto-save-status.saving {
      background: #ff9800 !important;
    }
    
    .auto-save-status.saved {
      background: #4CAF50 !important;
    }
    
    .auto-save-status.error {
      background: #f44336 !important;
    }
  `;
  document.head.appendChild(style);
}

function markEditableElements() {
  // Mark text elements as editable
  const textSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'div[class*="text"]', 
    '.hero-title', '.hero-subtitle', '.section-title',
    '[class*="title"]', '[class*="heading"]',
    '.about-text', '.service-description', '.review-text'
  ];
  
  textSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      if (element.textContent.trim() && !element.querySelector('input, button, a')) {
        element.setAttribute('data-editable', 'true');
        element.setAttribute('data-edit-type', 'text');
        element.setAttribute('data-element-id', generateElementId(element));
      }
    });
  });
  
  // Mark image elements as editable
  document.querySelectorAll('img').forEach(element => {
    element.setAttribute('data-editable', 'true');
    element.setAttribute('data-edit-type', 'image');
    element.setAttribute('data-element-id', generateElementId(element));
  });
  
  console.log('🎯 Marked', document.querySelectorAll('[data-editable="true"]').length, 'elements as editable');
}

function generateElementId(element) {
  // Generate a stable ID for the element based on its position and content
  const tagName = element.tagName.toLowerCase();
  const className = element.className.replace(/\s+/g, '-') || 'no-class';
  const textContent = element.textContent.trim().substring(0, 20).replace(/\s+/g, '-') || 'no-text';
  const index = Array.from(document.querySelectorAll(tagName)).indexOf(element);
  
  return `${tagName}-${className}-${textContent}-${index}`.toLowerCase();
}

async function loadExistingEdits() {
  if (!isAuthenticated) return;
  
  try {
    console.log('📥 Loading existing edits for page:', currentPageId);
    const response = await fetch(`/api/get-page-edits/${currentPageId}`);
    
    if (response.ok) {
      const data = await response.json();
      const edits = data.edits || {};
      
      console.log('📥 Found', Object.keys(edits).length, 'existing edits');
      
      // Apply existing edits to elements
      Object.keys(edits).forEach(elementId => {
        const element = document.querySelector(`[data-element-id="${elementId}"]`);
        if (element && edits[elementId].editedContent) {
          const editedContent = edits[elementId].editedContent;
          
          if (edits[elementId].editType === 'text') {
            element.textContent = editedContent.text || editedContent;
          } else if (edits[elementId].editType === 'image') {
            element.src = editedContent.src || editedContent;
          }
          
          // Add visual indicator that this element has been edited
          element.style.border = '1px solid #4CAF50';
          element.title = `Last edited: ${new Date(edits[elementId].lastModified).toLocaleString()}`;
        }
      });
    }
  } catch (error) {
    console.error('❌ Error loading existing edits:', error);
  }
}

function setupAutoSaveEventListeners() {
  // Click to activate element
  document.addEventListener('click', handleElementClick);
  
  // Click outside to deactivate
  document.addEventListener('click', handleOutsideClick);
  
  // Text input changes
  document.addEventListener('input', handleTextInput);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleElementClick(e) {
  const editableElement = e.target.closest('[data-editable="true"]');
  if (editableElement) {
    e.preventDefault();
    activateElement(editableElement);
  }
}

function handleOutsideClick(e) {
  if (activeElement && !e.target.closest('.auto-save-toolbar') && !e.target.closest('[data-editable="true"]')) {
    deactivateElement();
  }
}

function handleTextInput(e) {
  if (e.target.hasAttribute('data-editable')) {
    scheduleAutoSave(e.target);
  }
}

function handleKeyboardShortcuts(e) {
  if (!activeElement) return;
  
  // Ctrl/Cmd + B for bold
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    toggleFormat('bold');
  }
  
  // Ctrl/Cmd + I for italic
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    toggleFormat('italic');
  }
  
  // Ctrl/Cmd + U for underline
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault();
    toggleFormat('underline');
  }
  
  // Escape to deactivate
  if (e.key === 'Escape') {
    deactivateElement();
  }
}

function activateElement(element) {
  console.log('🎯 Activating element:', element.getAttribute('data-element-id'));
  
  // Deactivate previous element
  if (activeElement) {
    deactivateElement();
  }
  
  activeElement = element;
  
  // Make element editable
  if (element.getAttribute('data-edit-type') === 'text') {
    element.contentEditable = true;
    element.focus();
  }
  
  // Show toolbar
  showAutoSaveToolbar(element);
}

function deactivateElement() {
  if (!activeElement) return;
  
  console.log('📤 Deactivating element');
  
  // Make element non-editable
  activeElement.contentEditable = false;
  activeElement.blur();
  
  // Save final changes
  scheduleAutoSave(activeElement);
  
  // Hide toolbar
  hideAutoSaveToolbar();
  
  activeElement = null;
}

function createAutoSaveToolbar() {
  toolbar = document.createElement('div');
  toolbar.className = 'auto-save-toolbar';
  toolbar.innerHTML = `
    <button class="auto-save-btn" onclick="toggleFormat('bold')" title="Bold (Ctrl+B)"><b>B</b></button>
    <button class="auto-save-btn" onclick="toggleFormat('italic')" title="Italic (Ctrl+I)"><i>I</i></button>
    <button class="auto-save-btn" onclick="toggleFormat('underline')" title="Underline (Ctrl+U)"><u>U</u></button>
    <button class="auto-save-btn" onclick="toggleFormat('createLink')" title="Add Link">🔗</button>
    <button class="auto-save-btn" onclick="changeImage()" title="Change Image">🖼️</button>
    <button class="auto-save-btn" onclick="openColorPicker()" title="Text Color">🎨</button>
    <button class="auto-save-btn" onclick="openAIAssist()" title="AI Assistant">🤖</button>
    <button class="auto-save-btn" onclick="deleteElement()" title="Delete Element">🗑️</button>
  `;
  document.body.appendChild(toolbar);
  
  // Create auto-save status indicator
  const statusIndicator = document.createElement('div');
  statusIndicator.className = 'auto-save-status';
  statusIndicator.id = 'auto-save-status';
  document.body.appendChild(statusIndicator);
}

function showAutoSaveToolbar(element) {
  if (!toolbar) return;
  
  const rect = element.getBoundingClientRect();
  toolbar.style.display = 'flex';
  toolbar.style.left = `${Math.max(10, rect.left)}px`;
  toolbar.style.top = `${Math.max(10, rect.bottom + 10)}px`;
}

function hideAutoSaveToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

function toggleFormat(command) {
  if (!activeElement) return;
  
  try {
    document.execCommand(command, false, null);
    scheduleAutoSave(activeElement);
  } catch (error) {
    console.error('❌ Format command failed:', command, error);
  }
}

function scheduleAutoSave(element) {
  if (!isAuthenticated) {
    console.log('⚠️ Auto-save skipped - user not authenticated');
    return;
  }
  
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Schedule auto-save in 1 second
  saveTimeout = setTimeout(() => {
    autoSaveElement(element);
  }, 1000);
  
  showSaveStatus('saving');
}

async function autoSaveElement(element) {
  if (!isAuthenticated) return;
  
  const elementId = element.getAttribute('data-element-id');
  const editType = element.getAttribute('data-edit-type');
  
  let originalContent = null;
  let editedContent = null;
  
  if (editType === 'text') {
    originalContent = { text: element.getAttribute('data-original-text') || '' };
    editedContent = { text: element.textContent.trim() };
    
    // Store original content for comparison
    if (!element.hasAttribute('data-original-text')) {
      element.setAttribute('data-original-text', editedContent.text);
      originalContent.text = editedContent.text;
    }
  } else if (editType === 'image') {
    originalContent = { src: element.getAttribute('data-original-src') || element.src };
    editedContent = { src: element.src };
    
    if (!element.hasAttribute('data-original-src')) {
      element.setAttribute('data-original-src', element.src);
    }
  }
  
  try {
    console.log('💾 Auto-saving element:', elementId);
    
    const response = await fetch('/api/save-page-edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageId: currentPageId,
        elementId: elementId,
        editType: editType,
        originalContent: originalContent,
        editedContent: editedContent
      })
    });
    
    if (response.ok) {
      console.log('✅ Auto-save successful');
      showSaveStatus('saved');
      
      // Add visual indicator
      element.style.border = '1px solid #4CAF50';
      element.title = `Auto-saved: ${new Date().toLocaleString()}`;
    } else {
      throw new Error('Save failed');
    }
  } catch (error) {
    console.error('❌ Auto-save error:', error);
    showSaveStatus('error');
  }
}

function showSaveStatus(status) {
  const statusElement = document.getElementById('auto-save-status');
  if (!statusElement) return;
  
  statusElement.className = `auto-save-status ${status}`;
  
  switch (status) {
    case 'saving':
      statusElement.textContent = 'Saving...';
      break;
    case 'saved':
      statusElement.textContent = 'Saved ✓';
      break;
    case 'error':
      statusElement.textContent = 'Save failed ✗';
      break;
  }
  
  statusElement.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// Toolbar functions (global scope for onclick handlers)
window.toggleFormat = toggleFormat;

window.changeImage = function() {
  if (!activeElement || activeElement.getAttribute('data-edit-type') !== 'image') return;
  
  const newSrc = prompt('Enter new image URL:');
  if (newSrc) {
    activeElement.src = newSrc;
    scheduleAutoSave(activeElement);
  }
};

window.openColorPicker = function() {
  if (!activeElement) return;
  
  const color = prompt('Enter color (hex, rgb, or name):');
  if (color) {
    activeElement.style.color = color;
    scheduleAutoSave(activeElement);
  }
};

window.openAIAssist = function() {
  if (!activeElement) return;
  
  const prompt = window.prompt('What would you like to change about this content?');
  if (prompt) {
    // TODO: Integrate with AI chat API
    console.log('🤖 AI assistance requested:', prompt);
    alert('AI assistance will be available in the next update!');
  }
};

window.deleteElement = function() {
  if (!activeElement) return;
  
  if (confirm('Are you sure you want to delete this element?')) {
    const elementId = activeElement.getAttribute('data-element-id');
    
    // Remove from page
    activeElement.remove();
    
    // Delete from database if authenticated
    if (isAuthenticated) {
      fetch(`/api/delete-page-edit/${currentPageId}/${elementId}`, {
        method: 'DELETE'
      }).then(response => {
        if (response.ok) {
          console.log('✅ Element deleted from database');
          showSaveStatus('saved');
        }
      }).catch(error => {
        console.error('❌ Error deleting from database:', error);
      });
    }
    
    activeElement = null;
    hideAutoSaveToolbar();
  }
};

// Initialize when script loads
initAutoSaveEditor();

console.log('✅ Auto-save editor bridge loaded');