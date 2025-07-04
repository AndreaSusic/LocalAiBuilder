/**
 * INLINE EDITOR BRIDGE
 * Framework-agnostic inline editing system for live preview iframe
 * Turns every text and media node into editable zones with floating toolbar
 */

// Global state
let currentEditableElement = null;
let toolbar = null;
let deleteBtn = null;
let isToolbarActive = false;

// History for undo/redo functionality
let undoHistory = [];
let redoHistory = [];
let historyLimit = 20;

// Toolbar commands mapping with tooltips
const COMMANDS = {
  '𝐁': { action: () => document.execCommand('bold'), tooltip: 'Bold' },
  '𝑰': { action: () => document.execCommand('italic'), tooltip: 'Italic' },
  '𝑼': { action: () => document.execCommand('underline'), tooltip: 'Underline' },
  'List': { action: () => document.execCommand('insertUnorderedList'), tooltip: 'Bullet List' },
  '8px': { action: () => showFontSizeMenu(), tooltip: 'Font Size' },
  '12px': { action: () => document.execCommand('fontSize', false, '2'), tooltip: '12px' },
  '14px': { action: () => document.execCommand('fontSize', false, '3'), tooltip: '14px' },
  '16px': { action: () => document.execCommand('fontSize', false, '4'), tooltip: '16px' },
  '18px': { action: () => document.execCommand('fontSize', false, '5'), tooltip: '18px' },
  '24px': { action: () => document.execCommand('fontSize', false, '6'), tooltip: '24px' },
  '32px': { action: () => document.execCommand('fontSize', false, '7'), tooltip: '32px' },
  'A🖌️': { action: () => openColorPicker('foreColor'), tooltip: 'Text Color' },
  '🖍️': { action: () => openColorPicker('hiliteColor'), tooltip: 'Highlight Color' },
  '🖼️': { action: () => insertMedia('image'), tooltip: 'Insert Image' },
  '🎥': { action: () => openVideoPanel(), tooltip: 'Insert Video' },
  '↔️↕️': { action: () => toggleResizeBox(), tooltip: 'Resize Element' },
  '📐': { action: () => openSpacingPanel(), tooltip: 'Spacing' },
  'H₁': { action: () => changeHeading('H1'), tooltip: 'Heading 1' },
  'H₂': { action: () => changeHeading('H2'), tooltip: 'Heading 2' },
  'H₃': { action: () => changeHeading('H3'), tooltip: 'Heading 3' },
  'H₄': { action: () => changeHeading('H4'), tooltip: 'Heading 4' },
  '¶': { action: () => changeHeading('P'), tooltip: 'Paragraph' },
  '🔲': { action: () => insertComponent('card'), tooltip: 'Insert Card' },
  '📋': { action: () => pastePlain(), tooltip: 'Paste Plain Text' },
  '</>': { action: () => toggleCodeView(), tooltip: 'Code View' },
  '🔘': { action: () => insertComponent('button'), tooltip: 'Insert Button' },
  '↶': { action: () => undoAction(), tooltip: 'Undo' },
  '↷': { action: () => redoAction(), tooltip: 'Redo' },
  '✕': { action: () => deleteElement(), tooltip: 'Delete Element' },
  '💬': { action: () => openAIChat(), tooltip: 'AI Assistant' }
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
  console.log('🏷️ Setting up comprehensive editable elements...');
  
  // Listen for undo/redo messages from parent window
  window.addEventListener('message', (event) => {
    if (event.data.type === 'undo') {
      undoAction();
    } else if (event.data.type === 'redo') {
      redoAction();
    }
  });
  
  // First try to find elements with data-edit attributes from React components
  const editableElements = document.querySelectorAll('[data-edit]');
  console.log(`Found ${editableElements.length} elements with data-edit attributes`);
  
  // Test specific elements
  const testElement = document.querySelector('.editable-test');
  const heroTitle = document.querySelector('[data-edit="heroTitle"]');
  console.log('Found test element:', !!testElement);
  console.log('Found heroTitle element:', !!heroTitle);
  
  if (heroTitle) {
    console.log('🎯 HERO TITLE FOUND:', heroTitle.textContent, 'Tag:', heroTitle.tagName);
  }
  
  // Use data-edit elements if found, otherwise fall back to general elements
  const allElements = editableElements.length > 0 ? 
    editableElements : 
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, figcaption, blockquote, a, button, img, video');
  
  allElements.forEach(element => {
    // Skip if element is already marked as non-editable or is part of navigation/toolbar
    if (element.closest('[contenteditable="false"]') || 
        element.closest('.ez-toolbar') || 

        element.closest('script') ||
        element.closest('style')) {
      return;
    }
    
    // Mark as editable
    element.setAttribute('data-editable', 'true');
    element.style.cursor = 'pointer';
    element.style.position = element.style.position || 'relative';
    
    // Add delete button for every element
    addDeleteButton(element);
    
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
  
  console.log(`✅ Made ${allElements.length} elements editable with delete buttons`);
}

// Add delete button to element
function addDeleteButton(element) {
  // Skip if already has delete button
  if (element.querySelector('.ez-element-delete')) return;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'ez-element-delete';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = 'Delete Element';
  deleteBtn.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: none;
    z-index: 10001;
    line-height: 20px;
    text-align: center;
    font-weight: bold;
  `;
  
  deleteBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveToHistory();
    element.remove();
  };
  
  element.appendChild(deleteBtn);
  
  // Show delete button on hover
  element.addEventListener('mouseenter', () => {
    deleteBtn.style.display = 'block';
  });
  
  element.addEventListener('mouseleave', () => {
    deleteBtn.style.display = 'none';
  });
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
    const toolbarData = createToolbar();
    toolbar = toolbarData.toolbar;
    deleteBtn = toolbarData.deleteBtn;
    document.body.appendChild(toolbar);
  }
  
  // Position toolbar above element, ensuring it stays within viewport
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Calculate optimal position
  let top = rect.top + scrollTop - toolbar.offsetHeight - 10;
  let left = rect.left + scrollLeft;
  
  // Ensure toolbar stays within viewport bounds
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const toolbarWidth = toolbar.offsetWidth || 400;
  const toolbarHeight = toolbar.offsetHeight || 40;
  
  // Adjust horizontal position if toolbar would go off-screen
  if (left + toolbarWidth > viewportWidth) {
    left = viewportWidth - toolbarWidth - 10;
  }
  if (left < 10) {
    left = 10;
  }
  
  // Adjust vertical position if toolbar would go off-screen
  if (top < scrollTop + 10) {
    top = rect.bottom + scrollTop + 10; // Position below element instead
  }
  
  toolbar.style.top = top + 'px';
  toolbar.style.left = left + 'px';
  toolbar.style.display = 'flex';
  
  // Position delete button in top-right corner of element
  if (deleteBtn) {
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = (rect.top + scrollTop - 10) + 'px';
    deleteBtn.style.right = (window.innerWidth - rect.right - scrollLeft + 5) + 'px';
    deleteBtn.style.display = 'block';
    deleteBtn.style.zIndex = '10001';
    document.body.appendChild(deleteBtn);
  }
  
  // Ensure toolbar is visible
  toolbar.style.zIndex = '10000';
}

// Create enhanced toolbar with delete button positioned in top-right
function createToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'ez-toolbar';
  toolbar.contentEditable = 'false';
  
  // Create delete button in top-right corner of element
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'ez-delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = 'Delete Element';
  deleteBtn.contentEditable = 'false';
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteElement();
  });
  
  // Create heading dropdown
  const headingDropdown = document.createElement('select');
  headingDropdown.className = 'ez-heading-dropdown';
  headingDropdown.innerHTML = `
    <option value="P">Normal</option>
    <option value="H1">H1</option>
    <option value="H2">H2</option>
    <option value="H3">H3</option>
    <option value="H4">H4</option>
  `;
  headingDropdown.addEventListener('change', (e) => {
    changeHeading(e.target.value);
  });
  toolbar.appendChild(headingDropdown);
  
  // Create font size dropdown
  const fontSizeDropdown = document.createElement('select');
  fontSizeDropdown.className = 'ez-fontsize-dropdown';
  fontSizeDropdown.innerHTML = `
    <option value="8px">8px</option>
    <option value="10px">10px</option>
    <option value="12px">12px</option>
    <option value="14px">14px</option>
    <option value="16px">16px</option>
    <option value="18px">18px</option>
    <option value="20px">20px</option>
    <option value="24px">24px</option>
    <option value="28px">28px</option>
    <option value="32px">32px</option>
  `;
  fontSizeDropdown.addEventListener('change', (e) => {
    saveToHistory();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = e.target.value;
      try {
        range.surroundContents(span);
      } catch (error) {
        span.innerHTML = range.extractContents();
        range.insertNode(span);
      }
    } else if (currentEditableElement) {
      currentEditableElement.style.fontSize = e.target.value;
    }
  });
  toolbar.appendChild(fontSizeDropdown);
  
  // Create main command buttons
  Object.keys(COMMANDS).forEach(command => {
    // Skip commands that have special UI
    if (['✕', 'H₁', 'H₂', 'H₃', 'H₄', '¶'].includes(command)) return;
    
    const button = document.createElement('button');
    button.className = 'ez-btn';
    button.textContent = command;
    button.title = getCommandTitle(command);
    button.contentEditable = 'false';
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      saveToHistory();
      if (typeof COMMANDS[command] === 'function') {
        COMMANDS[command]();
      } else if (COMMANDS[command].action) {
        COMMANDS[command].action();
      }
    });
    
    toolbar.appendChild(button);
  });
  
  return { toolbar, deleteBtn };
}

// Get command title for tooltip
function getCommandTitle(command) {
  if (COMMANDS[command] && COMMANDS[command].tooltip) {
    return COMMANDS[command].tooltip;
  }
  return command;
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
        if (COMMANDS['𝐁'].action) COMMANDS['𝐁'].action();
        break;
      case 'i':
        e.preventDefault();
        if (COMMANDS['𝑰'].action) COMMANDS['𝑰'].action();
        break;
      case 'u':
        e.preventDefault();
        if (COMMANDS['𝑼'].action) COMMANDS['𝑼'].action();
        break;
      case 'z':
        e.preventDefault();
        undoAction();
        break;
      case 'y':
        e.preventDefault();
        redoAction();
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

// Note: hideToolbar function is defined later with full functionality

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
  
  // Refresh element editability after changes to ensure toolbar reappears
  setTimeout(() => {
    if (element && element.parentNode) {
      element.setAttribute('data-editable', 'true');
      element.style.cursor = 'pointer';
      
      // Re-add delete button if missing
      if (!element.querySelector('.ez-element-delete')) {
        addDeleteButton(element);
      }
    }
  }, 100);
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

// Save current state to history for undo/redo
function saveToHistory() {
  if (!currentEditableElement) return;
  
  const state = {
    element: currentEditableElement,
    content: currentEditableElement.innerHTML,
    timestamp: Date.now()
  };
  
  undoHistory.push(state);
  if (undoHistory.length > historyLimit) {
    undoHistory.shift();
  }
  
  // Clear redo history when new action is performed
  redoHistory = [];
}

// Undo last action
function undoAction() {
  if (undoHistory.length === 0) {
    console.log('📝 No actions to undo');
    return;
  }
  
  const previousState = undoHistory.pop();
  if (previousState && previousState.element && previousState.element.parentNode) {
    // Save current state for redo
    if (currentEditableElement && currentEditableElement.parentNode) {
      const currentState = {
        element: currentEditableElement,
        content: currentEditableElement.innerHTML,
        timestamp: Date.now()
      };
      redoHistory.push(currentState);
    }
    
    // Restore previous state
    previousState.element.innerHTML = previousState.content;
    console.log('↶ Undid action');
  }
}

// Redo last undone action
function redoAction() {
  if (redoHistory.length === 0) {
    console.log('📝 No actions to redo');
    return;
  }
  
  const nextState = redoHistory.pop();
  if (nextState && nextState.element && nextState.element.parentNode) {
    // Save current state for undo
    if (currentEditableElement && currentEditableElement.parentNode) {
      const currentState = {
        element: currentEditableElement,
        content: currentEditableElement.innerHTML,
        timestamp: Date.now()
      };
      undoHistory.push(currentState);
    }
    
    // Restore next state
    nextState.element.innerHTML = nextState.content;
    console.log('↷ Redid action');
  }
}

// Delete current element
function deleteElement() {
  if (!currentEditableElement) return;
  
  const parent = currentEditableElement.parentNode;
  if (parent) {
    saveToHistory();
    currentEditableElement.remove();
    hideToolbar();
    currentEditableElement = null;
  }
}

// Change heading type
function changeHeading(headingType) {
  if (!currentEditableElement) return;
  
  saveToHistory();
  document.execCommand('formatBlock', false, headingType);
}

// Open color picker
function openColorPicker(command) {
  // Create color picker input
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.style.position = 'absolute';
  colorInput.style.visibility = 'hidden';
  
  colorInput.addEventListener('change', (e) => {
    saveToHistory();
    document.execCommand(command, false, e.target.value);
    document.body.removeChild(colorInput);
  });
  
  document.body.appendChild(colorInput);
  colorInput.click();
}

// Open video panel with URL input and upload option
function openVideoPanel() {
  const panel = document.createElement('div');
  panel.className = 'ez-video-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10002;
    min-width: 300px;
  `;
  
  panel.innerHTML = `
    <h3>Insert Video</h3>
    <div style="margin-bottom: 15px;">
      <label>Video URL:</label>
      <input type="url" id="videoUrl" placeholder="https://..." style="width: 100%; padding: 8px; margin-top: 5px;">
    </div>
    <div style="margin-bottom: 15px;">
      <label>Or upload video file:</label>
      <input type="file" id="videoFile" accept="video/*" style="width: 100%; padding: 8px; margin-top: 5px;">
    </div>
    <div style="text-align: right;">
      <button id="cancelVideo" style="margin-right: 10px; padding: 8px 16px;">Cancel</button>
      <button id="insertVideo" style="padding: 8px 16px; background: #007cff; color: white; border: none; border-radius: 4px;">Insert</button>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  document.getElementById('cancelVideo').onclick = () => document.body.removeChild(panel);
  document.getElementById('insertVideo').onclick = () => {
    const url = document.getElementById('videoUrl').value;
    const file = document.getElementById('videoFile').files[0];
    
    if (url) {
      saveToHistory();
      document.execCommand('insertHTML', false, 
        `<video src="${url}" controls style="max-width: 100%; height: auto;">`);
    } else if (file) {
      const videoUrl = URL.createObjectURL(file);
      saveToHistory();
      document.execCommand('insertHTML', false, 
        `<video src="${videoUrl}" controls style="max-width: 100%; height: auto;">`);
    }
    
    document.body.removeChild(panel);
  };
}

// Open AI chat interface
// Show font size menu
function showFontSizeMenu() {
  const menu = document.createElement('div');
  menu.className = 'ez-font-size-menu';
  menu.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 10001;
    min-width: 80px;
  `;
  
  const sizes = ['8px', '12px', '14px', '16px', '18px', '24px', '32px'];
  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
  
  sizes.forEach((size, index) => {
    const button = document.createElement('button');
    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: ${size};
    `;
    button.textContent = size;
    button.onmouseover = () => button.style.backgroundColor = '#f0f0f0';
    button.onmouseout = () => button.style.backgroundColor = '';
    button.onclick = () => {
      saveToHistory();
      document.execCommand('fontSize', false, fontSizes[index]);
      document.body.removeChild(menu);
    };
    menu.appendChild(button);
  });
  
  // Position menu relative to toolbar
  if (toolbar) {
    const rect = toolbar.getBoundingClientRect();
    menu.style.top = (rect.bottom + 5) + 'px';
    menu.style.left = rect.left + 'px';
  }
  
  document.body.appendChild(menu);
  
  // Close menu when clicking outside
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      document.body.removeChild(menu);
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 100);
}

function openAIChat() {
  const chatPanel = document.createElement('div');
  chatPanel.className = 'ez-ai-chat-panel';
  chatPanel.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10002;
    width: 400px;
    height: 500px;
    display: flex;
    flex-direction: column;
  `;
  
  chatPanel.innerHTML = `
    <h3>AI Assistant</h3>
    <div id="chatMessages" style="flex: 1; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin: 10px 0; border-radius: 4px;">
      <div style="color: #666; font-style: italic;">Ask me to help you edit this content...</div>
    </div>
    <div style="display: flex; gap: 10px;">
      <input type="text" id="chatInput" placeholder="Type your message..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      <button id="sendChat" style="padding: 8px 16px; background: #007cff; color: white; border: none; border-radius: 4px;">Send</button>
    </div>
    <div style="text-align: right; margin-top: 10px;">
      <button id="closeChat" style="padding: 8px 16px;">Close</button>
    </div>
  `;
  
  document.body.appendChild(chatPanel);
  
  document.getElementById('closeChat').onclick = () => document.body.removeChild(chatPanel);
  
  const sendMessage = async () => {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    messages.innerHTML += `<div style="margin: 5px 0; text-align: right;"><strong>You:</strong> ${message}</div>`;
    input.value = '';
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          context: currentEditableElement ? currentEditableElement.textContent : ''
        })
      });
      
      const data = await response.json();
      messages.innerHTML += `<div style="margin: 5px 0;"><strong>AI:</strong> ${data.response}</div>`;
      messages.scrollTop = messages.scrollHeight;
    } catch (error) {
      messages.innerHTML += `<div style="margin: 5px 0; color: red;"><strong>Error:</strong> Could not connect to AI</div>`;
    }
  };
  
  document.getElementById('sendChat').onclick = sendMessage;
  document.getElementById('chatInput').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

// Hide toolbar and delete button
function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
  if (deleteBtn && deleteBtn.parentNode) {
    deleteBtn.parentNode.removeChild(deleteBtn);
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