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

// Toolbar commands mapping
const COMMANDS = {
  '𝐁': () => document.execCommand('bold'),
  '𝑰': () => document.execCommand('italic'),
  '𝑼': () => document.execCommand('underline'),
  'List': () => document.execCommand('insertUnorderedList'),
  '8px': () => document.execCommand('fontSize', false, '1'),
  'A🖌️': () => openColorPicker('foreColor'),
  '🖍️': () => openColorPicker('hiliteColor'),
  '🖼️': () => insertMedia('image'),
  '🎥': () => openVideoPanel(),
  '↔️↕️': () => toggleResizeBox(),
  '📐': () => openSpacingPanel(),
  'H₁': () => changeHeading('H1'),
  'H₂': () => changeHeading('H2'),
  'H₃': () => changeHeading('H3'),
  'H₄': () => changeHeading('H4'),
  '¶': () => changeHeading('P'),
  '🔲': () => insertComponent('card'),
  '📋': () => pastePlain(),
  '</>': () => toggleCodeView(),
  '🔘': () => insertComponent('button'),
  '↶': () => undoAction(),
  '↷': () => redoAction(),
  '✕': () => deleteElement(),
  '💬': () => openAIChat()
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
    const toolbarData = createToolbar();
    toolbar = toolbarData.toolbar;
    deleteBtn = toolbarData.deleteBtn;
    document.body.appendChild(toolbar);
  }
  
  // Position toolbar above element
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  toolbar.style.top = (rect.top + scrollTop - toolbar.offsetHeight - 10) + 'px';
  toolbar.style.left = (rect.left + scrollLeft) + 'px';
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
      COMMANDS[command]();
    });
    
    toolbar.appendChild(button);
  });
  
  return { toolbar, deleteBtn };
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
    'H₂': 'Heading 2',
    'H₃': 'Heading 3',
    'H₄': 'Heading 4',
    '¶': 'Paragraph',
    '🔲': 'Insert Card',
    '📋': 'Paste Plain',
    '</>': 'Code View',
    '🔘': 'Insert Button',
    '↶': 'Undo',
    '↷': 'Redo',
    '✕': 'Delete Element',
    '💬': 'AI Assistant'
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
  if (undoHistory.length === 0) return;
  
  const currentState = {
    element: currentEditableElement,
    content: currentEditableElement.innerHTML,
    timestamp: Date.now()
  };
  
  redoHistory.push(currentState);
  
  const previousState = undoHistory.pop();
  if (previousState && previousState.element) {
    previousState.element.innerHTML = previousState.content;
  }
}

// Redo last undone action
function redoAction() {
  if (redoHistory.length === 0) return;
  
  const currentState = {
    element: currentEditableElement,
    content: currentEditableElement.innerHTML,
    timestamp: Date.now()
  };
  
  undoHistory.push(currentState);
  
  const nextState = redoHistory.pop();
  if (nextState && nextState.element) {
    nextState.element.innerHTML = nextState.content;
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
function openAIChat() {
  const chatPanel = document.createElement('div');
  chatPanel.className = 'ez-ai-chat-panel';
  chatPanel.style.cssText = `
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