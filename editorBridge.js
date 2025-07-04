/**
 * Framework-agnostic inline editor bridge
 * Based on the working implementation that turns every text/media node 
 * into an editable zone with floating toolbar
 */

console.log('🚀 Mobile Editor bridge injected successfully');

let activeElement = null;
let toolbar = null;
let isEditing = false;

// Command definitions
const COMMANDS = {
  '𝐁': () => exec('bold'),
  '𝐈': () => exec('italic'),
  '𝐔': () => exec('underline'),
  'List': () => exec('insertUnorderedList'),
  '8px': () => exec('fontSize', '1'),
  'A🖌️': () => pickColor('foreColor'),
  '🖍️': () => pickColor('hiliteColor'),
  '🖼️': () => insertMedia('image'),
  '🎥': () => insertMedia('video'),
  '↔️↕️': () => toggleResizeBox(),
  '📐': () => openSpacingPanel(),
  'H₁': () => exec('formatBlock', 'H1'),
  '¶': () => exec('formatBlock', 'P'),
  '🔲': () => insertComponent('card'),
  '📋': () => pastePlain(),
  '</>': () => toggleCodeView(),
  '🔘': () => insertComponent('button'),
  '💬': () => openAIChat()
};

// Execute document commands
function exec(command, value = null) {
  document.execCommand(command, false, value);
  saveChanges();
}

// Initialize the editor system
function initEditor() {
  console.log('🎨 Initializing inline editor system...');
  
  // Remove any existing editor elements
  cleanup();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEditor);
  } else {
    setupEditor();
  }
}

// Setup the editor after DOM is ready
function setupEditor() {
  console.log('📝 Setting up editor...');
  
  // Mark all text elements as editable
  const count = markEditableElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Create toolbar
  createToolbar();
  
  console.log(`✅ Editor setup complete - ${count} elements marked as editable`);
  
  // Debug: Test if we can find elements
  setTimeout(() => {
    const editableElements = document.querySelectorAll('[data-editable="true"]');
    console.log(`🔍 Debug: Found ${editableElements.length} editable elements after setup`);
    
    if (editableElements.length > 0) {
      console.log('🎯 First editable element:', editableElements[0].tagName, editableElements[0].textContent.substring(0, 50));
    }
  }, 1000);
}

// Mark elements as editable
function markEditableElements() {
  console.log('🏷️ Marking editable elements...');
  
  // First, let's see what elements exist
  const allElements = document.querySelectorAll('*');
  console.log(`🔍 Total DOM elements found: ${allElements.length}`);
  
  // Target text elements
  const textSelectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'div', 'a', 'button',
    'td', 'th', 'li', 'blockquote'
  ];
  
  let count = 0;
  let skippedCount = 0;
  
  textSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`🔍 Found ${elements.length} ${selector} elements`);
    
    elements.forEach((el, index) => {
      // Debug each element
      console.log(`Checking ${selector}[${index}]:`, {
        hasDataEditable: el.hasAttribute('data-editable'),
        tagName: el.tagName,
        textContent: el.textContent?.substring(0, 30),
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight,
        hasText: !!el.textContent?.trim()
      });
      
      // Skip if already marked or is a script/style element
      if (el.hasAttribute('data-editable') || 
          el.tagName.toLowerCase() === 'script' || 
          el.tagName.toLowerCase() === 'style') {
        skippedCount++;
        return;
      }
      
      // Skip if element is empty or only whitespace
      if (!el.textContent || !el.textContent.trim()) {
        skippedCount++;
        return;
      }
      
      // Skip if element is too small (but be more lenient)
      if (el.offsetWidth < 10 || el.offsetHeight < 5) {
        skippedCount++;
        return;
      }
      
      // Mark as editable
      el.setAttribute('data-editable', 'true');
      console.log(`✅ Marked as editable: ${el.tagName} - "${el.textContent.substring(0, 30)}"`);
      count++;
    });
  });
  
  console.log(`✅ Made ${count} elements editable, skipped ${skippedCount} elements`);
  return count;
}

// Setup event listeners
function setupEventListeners() {
  // Click handler for editable elements
  document.addEventListener('click', handleClick);
  
  // Blur handler to deactivate editing
  document.addEventListener('blur', handleBlur, true);
  
  // Keydown handler for shortcuts and enter
  document.addEventListener('keydown', handleKeydown);
  
  // Input handler for auto-save
  document.addEventListener('input', handleInput);
  
  // Click outside to deactivate
  document.addEventListener('click', handleOutsideClick);
}

// Handle click on editable elements
function handleClick(e) {
  const element = e.target;
  
  // Check if clicked element is editable
  if (element.hasAttribute('data-editable')) {
    e.preventDefault();
    e.stopPropagation();
    activateElement(element);
  }
}

// Activate element for editing
function activateElement(element) {
  console.log('🎯 Activating element:', element.tagName, element.textContent.substring(0, 50));
  
  // Deactivate current element first
  if (activeElement) {
    deactivateElement(activeElement);
  }
  
  // Set new active element
  activeElement = element;
  isEditing = true;
  
  // Make contenteditable
  element.contentEditable = true;
  element.focus();
  
  // Add visual feedback
  element.style.outline = '2px solid #ffc000';
  element.style.outlineOffset = '2px';
  
  // Position and show toolbar
  showToolbar(element);
}

// Deactivate element
function deactivateElement(element) {
  if (!element) return;
  
  element.contentEditable = false;
  element.style.outline = '';
  element.style.outlineOffset = '';
  
  hideToolbar();
  
  activeElement = null;
  isEditing = false;
}

// Create floating toolbar
function createToolbar() {
  if (toolbar) return;
  
  toolbar = document.createElement('div');
  toolbar.className = 'ez-toolbar';
  toolbar.contentEditable = false;
  toolbar.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #aaa;
    border-radius: 6px;
    padding: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    z-index: 10000;
    display: none;
    flex-wrap: wrap;
    gap: 2px;
    min-width: 300px;
  `;
  
  // Create toolbar buttons
  Object.entries(COMMANDS).forEach(([label, command]) => {
    const btn = document.createElement('button');
    btn.className = 'ez-btn';
    btn.textContent = label;
    btn.contentEditable = false;
    btn.style.cssText = `
      font: 14px/1 sans-serif;
      padding: 4px 6px;
      cursor: pointer;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: white;
      min-width: 30px;
    `;
    
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      command();
    });
    
    btn.addEventListener('mouseover', () => {
      btn.style.background = '#f0f0f0';
    });
    
    btn.addEventListener('mouseout', () => {
      btn.style.background = 'white';
    });
    
    toolbar.appendChild(btn);
  });
  
  document.body.appendChild(toolbar);
}

// Show toolbar above element
function showToolbar(element) {
  if (!toolbar) return;
  
  const rect = element.getBoundingClientRect();
  const toolbarHeight = 40;
  
  // Position above element
  let top = rect.top + window.scrollY - toolbarHeight - 10;
  let left = rect.left + window.scrollX;
  
  // Ensure toolbar stays within viewport
  if (top < 0) {
    top = rect.bottom + window.scrollY + 10;
  }
  
  if (left + toolbar.offsetWidth > window.innerWidth) {
    left = window.innerWidth - toolbar.offsetWidth - 10;
  }
  
  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${left}px`;
  toolbar.style.display = 'flex';
}

// Hide toolbar
function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

// Handle blur events
function handleBlur(e) {
  // Don't deactivate if blur is to toolbar
  if (e.relatedTarget && e.relatedTarget.closest('.ez-toolbar')) {
    return;
  }
  
  // Small delay to allow toolbar clicks
  setTimeout(() => {
    if (activeElement && !document.activeElement.closest('.ez-toolbar')) {
      deactivateElement(activeElement);
    }
  }, 100);
}

// Handle keydown events
function handleKeydown(e) {
  if (!isEditing) return;
  
  // Handle Enter key
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    exec('insertParagraph');
  }
  
  // Handle keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault();
        exec('bold');
        break;
      case 'i':
        e.preventDefault();
        exec('italic');
        break;
      case 'u':
        e.preventDefault();
        exec('underline');
        break;
    }
  }
}

// Handle input events for auto-save
function handleInput(e) {
  if (e.target.hasAttribute('data-editable')) {
    saveChanges();
  }
}

// Handle outside clicks
function handleOutsideClick(e) {
  if (!activeElement) return;
  
  // Don't deactivate if clicking on toolbar
  if (e.target.closest('.ez-toolbar')) return;
  
  // Don't deactivate if clicking on active element
  if (e.target === activeElement || activeElement.contains(e.target)) return;
  
  deactivateElement(activeElement);
}

// Save changes (bridge to parent)
function saveChanges() {
  if (!activeElement) return;
  
  // Post message to parent frame for auto-save
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'editor-change',
      element: activeElement.tagName,
      content: activeElement.innerHTML,
      timestamp: Date.now()
    }, '*');
  }
}

// Command implementations
function pickColor(command) {
  const color = prompt('Enter color (hex, rgb, or name):');
  if (color) {
    exec(command, color);
  }
}

function insertMedia(type) {
  const url = prompt(`Enter ${type} URL:`);
  if (url) {
    const tag = type === 'image' ? 'img' : 'video';
    const html = `<${tag} src="${url}" style="max-width: 100%; height: auto;" />`;
    exec('insertHTML', html);
  }
}

function toggleResizeBox() {
  if (activeElement) {
    const hasResize = activeElement.style.resize;
    activeElement.style.resize = hasResize ? '' : 'both';
    activeElement.style.overflow = hasResize ? '' : 'hidden';
  }
}

function openSpacingPanel() {
  if (!activeElement) return;
  
  const margin = prompt('Enter margin (e.g., 10px, 1em):');
  if (margin) {
    activeElement.style.margin = margin;
  }
}

function insertComponent(type) {
  let html = '';
  
  switch (type) {
    case 'card':
      html = '<div style="border: 1px solid #ddd; padding: 1rem; border-radius: 4px; margin: 1rem 0;"><h3>Card Title</h3><p>Card content goes here...</p></div>';
      break;
    case 'button':
      html = '<button style="background: #007cff; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">Click me</button>';
      break;
  }
  
  if (html) {
    exec('insertHTML', html);
  }
}

function pastePlain() {
  navigator.clipboard.readText().then(text => {
    exec('insertText', text);
  });
}

function toggleCodeView() {
  if (activeElement) {
    const isCode = activeElement.style.fontFamily === 'monospace';
    activeElement.style.fontFamily = isCode ? '' : 'monospace';
    activeElement.style.background = isCode ? '' : '#f5f5f5';
    activeElement.style.padding = isCode ? '' : '0.5rem';
  }
}

function openAIChat() {
  console.log('🤖 Opening AI chat...');
  
  // Create chat modal
  const modal = document.createElement('div');
  modal.contentEditable = false;
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    width: 400px;
    height: 500px;
    display: flex;
    flex-direction: column;
  `;
  
  modal.innerHTML = `
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
  
  document.body.appendChild(modal);
  
  // Event handlers
  document.getElementById('closeChat').onclick = () => document.body.removeChild(modal);
  
  const sendMessage = async () => {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userDiv = document.createElement('div');
    userDiv.style.cssText = 'margin: 5px 0; text-align: right; padding: 8px; background: #f0f0f0; border-radius: 8px;';
    userDiv.innerHTML = `<strong>You:</strong> ${message}`;
    messages.appendChild(userDiv);
    input.value = '';
    
    // Create AI response placeholder
    const aiDiv = document.createElement('div');
    aiDiv.style.cssText = 'margin: 5px 0; padding: 8px; background: #e8f4f8; border-radius: 8px;';
    aiDiv.innerHTML = '<strong>AI:</strong> <span class="ai-response"></span>';
    messages.appendChild(aiDiv);
    
    const aiResponse = aiDiv.querySelector('.ai-response');
    messages.scrollTop = messages.scrollHeight;
    
    try {
      const contextMessage = activeElement ? 
        `Help me edit this content: "${activeElement.textContent.substring(0, 100)}..." User request: ${message}` : 
        message;
      
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextMessage })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            if (data.trim()) {
              aiResponse.textContent += data;
              messages.scrollTop = messages.scrollHeight;
            }
          }
        }
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      aiResponse.innerHTML = '<span style="color: red;">Error: Could not connect to AI</span>';
    }
  };
  
  document.getElementById('sendChat').onclick = sendMessage;
  document.getElementById('chatInput').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
  
  // Focus input
  document.getElementById('chatInput').focus();
}

// Cleanup function
function cleanup() {
  if (toolbar) {
    toolbar.remove();
    toolbar = null;
  }
  
  if (activeElement) {
    deactivateElement(activeElement);
  }
  
  // Remove existing event listeners
  document.removeEventListener('click', handleClick);
  document.removeEventListener('blur', handleBlur, true);
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('input', handleInput);
}

// Load external CSS for better styling
const cssLink = document.createElement('link');
cssLink.rel = 'stylesheet';
cssLink.href = '/editorToolbar.css';
document.head.appendChild(cssLink);

// Add additional inline styles as fallback
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
  
  .ez-toolbar {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .ez-btn:hover {
    background: #f0f0f0 !important;
  }
`;
document.head.appendChild(style);

// Initialize the editor
initEditor();

// Export for debugging
window.editorBridge = {
  activeElement: () => activeElement,
  toolbar: () => toolbar,
  activate: activateElement,
  deactivate: () => deactivateElement(activeElement),
  commands: COMMANDS
};