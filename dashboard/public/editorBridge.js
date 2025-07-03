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
  'A🖌️': { action: () => openColorPicker('foreColor'), tooltip: 'Text Color' },
  '🖍️': { action: () => openColorPicker('hiliteColor'), tooltip: 'Highlight Color' },
  '🖼️': { action: () => insertMedia('image'), tooltip: 'Insert Image' },
  '🎥': { action: () => openVideoPanel(), tooltip: 'Insert Video' },
  '💬': { action: () => openAIChat(), tooltip: 'AI Assistant' }
};

function initEditorBridge() {
  console.log('🚀 Editor Bridge initialized');
  
  // Load editor styles
  loadEditorStyles();
  
  // Set up editable elements
  setupEditableElements();
  
  // Set up global listeners
  setupGlobalListeners();
  
  console.log('✅ Editor Bridge ready');
}

function loadEditorStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ez-editable {
      position: relative;
      transition: outline 0.2s ease;
    }
    
    .ez-editable-active {
      outline: 2px solid #007cff !important;
      outline-offset: 2px !important;
    }
    
    .ez-element-delete {
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
      z-index: 100000;
      line-height: 20px;
      text-align: center;
      font-weight: bold;
    }
    
    .ez-element-delete:hover {
      background: #5a6268;
    }
    
    .ez-toolbar {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 99999;
      display: none;
      flex-wrap: wrap;
      gap: 4px;
      max-width: 300px;
    }
    
    .ez-toolbar button,
    .ez-toolbar select {
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 6px 8px;
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ez-toolbar button:hover,
    .ez-toolbar select:hover {
      background: #f0f0f0;
      border-color: #999;
    }
  `;
  document.head.appendChild(style);
}

function setupEditableElements() {
  // Find all text and media elements
  const editableSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'div', 'a', 'button',
    'img', 'video', 'figcaption',
    '.hero-title', '.hero-subtitle', '.section-title',
    '.service-title', '.service-description',
    '.review-text', '.review-author',
    '.contact-info', '.footer-text'
  ];
  
  editableSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Skip if already marked as editable or if it's a structural element
      if (element.classList.contains('ez-editable') || 
          element.closest('.ez-toolbar') ||
          element.closest('.ez-element-delete')) {
        return;
      }
      
      // Skip elements with only child elements and no direct text
      if (element.children.length > 0 && !element.textContent.trim()) {
        return;
      }
      
      element.classList.add('ez-editable');
      addDeleteButton(element);
    });
  });
}

function addDeleteButton(element) {
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'ez-element-delete';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = 'Delete Element';
  
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    saveToHistory();
    element.remove();
  });
  
  element.appendChild(deleteBtn);
  
  // Show/hide delete button on hover
  element.addEventListener('mouseenter', () => {
    deleteBtn.style.display = 'block';
  });
  
  element.addEventListener('mouseleave', () => {
    if (element !== currentEditableElement) {
      deleteBtn.style.display = 'none';
    }
  });
}

function setupGlobalListeners() {
  document.addEventListener('click', handleElementClick);
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', handleOutsideClick);
}

function handleElementClick(e) {
  const element = e.target.closest('.ez-editable');
  if (element) {
    e.preventDefault();
    activateElement(element);
  }
}

function activateElement(element) {
  // Deactivate current element
  deactivateCurrentElement();
  
  // Activate new element
  currentEditableElement = element;
  element.classList.add('ez-editable-active');
  element.contentEditable = true;
  
  // Show delete button
  const deleteBtn = element.querySelector('.ez-element-delete');
  if (deleteBtn) {
    deleteBtn.style.display = 'block';
  }
  
  // Show toolbar
  showToolbar(element);
  
  // Focus element
  element.focus();
}

function deactivateCurrentElement() {
  if (currentEditableElement) {
    currentEditableElement.classList.remove('ez-editable-active');
    currentEditableElement.contentEditable = false;
    
    // Hide delete button
    const deleteBtn = currentEditableElement.querySelector('.ez-element-delete');
    if (deleteBtn) {
      deleteBtn.style.display = 'none';
    }
    
    currentEditableElement = null;
  }
  
  hideToolbar();
}

function showToolbar(element) {
  if (!toolbar) {
    createToolbar();
  }
  
  // Position toolbar above element
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  toolbar.style.display = 'flex';
  toolbar.style.top = (rect.top + scrollTop - toolbar.offsetHeight - 10) + 'px';
  toolbar.style.left = (rect.left + scrollLeft) + 'px';
  
  // Ensure toolbar stays within viewport
  const toolbarRect = toolbar.getBoundingClientRect();
  if (toolbarRect.right > window.innerWidth) {
    toolbar.style.left = (window.innerWidth - toolbarRect.width - 10) + 'px';
  }
  if (toolbarRect.top < 0) {
    toolbar.style.top = (rect.bottom + scrollTop + 10) + 'px';
  }
}

function createToolbar() {
  toolbar = document.createElement('div');
  toolbar.className = 'ez-toolbar';
  
  // Create toolbar buttons
  Object.entries(COMMANDS).forEach(([label, config]) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.title = config.tooltip;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      saveToHistory();
      config.action();
    });
    toolbar.appendChild(button);
  });
  
  // Create heading dropdown
  const headingDropdown = document.createElement('select');
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
    if (currentEditableElement) {
      currentEditableElement.style.fontSize = e.target.value;
    }
  });
  toolbar.appendChild(fontSizeDropdown);
  
  document.body.appendChild(toolbar);
}

function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

function handleKeydown(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'z':
        if (e.shiftKey) {
          e.preventDefault();
          redoAction();
        } else {
          e.preventDefault();
          undoAction();
        }
        break;
      case 'y':
        e.preventDefault();
        redoAction();
        break;
    }
  }
  
  if (e.key === 'Escape') {
    deactivateCurrentElement();
  }
}

function handleOutsideClick(e) {
  if (!e.target.closest('.ez-editable') && !e.target.closest('.ez-toolbar')) {
    deactivateCurrentElement();
  }
}

function saveToHistory() {
  if (currentEditableElement) {
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
}

function undoAction() {
  if (undoHistory.length > 0) {
    const currentState = {
      element: currentEditableElement,
      content: currentEditableElement ? currentEditableElement.innerHTML : '',
      timestamp: Date.now()
    };
    
    redoHistory.push(currentState);
    
    const previousState = undoHistory.pop();
    if (previousState && previousState.element) {
      previousState.element.innerHTML = previousState.content;
    }
  }
}

function redoAction() {
  if (redoHistory.length > 0) {
    const currentState = {
      element: currentEditableElement,
      content: currentEditableElement ? currentEditableElement.innerHTML : '',
      timestamp: Date.now()
    };
    
    undoHistory.push(currentState);
    
    const nextState = redoHistory.pop();
    if (nextState && nextState.element) {
      nextState.element.innerHTML = nextState.content;
    }
  }
}

function changeHeading(headingType) {
  if (!currentEditableElement) return;
  
  saveToHistory();
  
  if (headingType === 'P') {
    const p = document.createElement('p');
    p.innerHTML = currentEditableElement.innerHTML;
    p.className = currentEditableElement.className;
    currentEditableElement.parentNode.replaceChild(p, currentEditableElement);
    activateElement(p);
  } else {
    const heading = document.createElement(headingType.toLowerCase());
    heading.innerHTML = currentEditableElement.innerHTML;
    heading.className = currentEditableElement.className;
    currentEditableElement.parentNode.replaceChild(heading, currentEditableElement);
    activateElement(heading);
  }
}

function openColorPicker(command) {
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.style.position = 'absolute';
  colorInput.style.left = '-9999px';
  
  colorInput.addEventListener('change', (e) => {
    saveToHistory();
    document.execCommand(command, false, e.target.value);
    document.body.removeChild(colorInput);
  });
  
  document.body.appendChild(colorInput);
  colorInput.click();
}

function insertMedia(type) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'image' ? 'image/*' : 'video/*';
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        saveToHistory();
        const element = type === 'image' ? 
          `<img src="${e.target.result}" style="max-width: 100%; height: auto;" alt="Uploaded ${type}">` :
          `<video src="${e.target.result}" controls style="max-width: 100%; height: auto;"></video>`;
        document.execCommand('insertHTML', false, element);
      };
      reader.readAsDataURL(file);
    }
  });
  
  input.click();
}

function openVideoPanel() {
  const panel = document.createElement('div');
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
    z-index: 100001;
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
      document.execCommand('insertHTML', false, `<video src="${url}" controls style="max-width: 100%; height: auto;"></video>`);
    } else if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        saveToHistory();
        document.execCommand('insertHTML', false, `<video src="${e.target.result}" controls style="max-width: 100%; height: auto;"></video>`);
      };
      reader.readAsDataURL(file);
    }
    
    document.body.removeChild(panel);
  };
}

function openAIChat() {
  const chatPanel = document.createElement('div');
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
    z-index: 100002;
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

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditorBridge);
} else {
  initEditorBridge();
}

// Export for debugging
window.editorBridge = {
  activate: activateElement,
  deactivate: deactivateCurrentElement,
  toolbar: () => toolbar,
  current: () => currentEditableElement
};