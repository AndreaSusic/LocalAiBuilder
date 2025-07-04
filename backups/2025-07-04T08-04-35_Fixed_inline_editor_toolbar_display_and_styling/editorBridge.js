/**
 * Framework-agnostic inline editor bridge
 * Based on working implementation from the provided prompt
 */

console.log('🚀 Editor bridge starting...');

let activeElement = null;
let toolbar = null;

// Simple command execution
function exec(command, value = null) {
  try {
    document.execCommand(command, false, value);
  } catch (error) {
    console.error('Command execution failed:', command, error);
  }
}

// Initialize the editor
function initEditor() {
  console.log('🎨 Initializing inline editor...');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEditor);
  } else {
    setupEditor();
  }
}

function setupEditor() {
  console.log('📝 Setting up editor...');
  
  // Add styles
  addStyles();
  
  // Mark elements as editable
  markEditableElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Create toolbar
  createToolbar();
  
  console.log('✅ Editor setup complete');
}

function addStyles() {
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
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .ez-btn {
      font: 14px/1 sans-serif !important;
      padding: 8px 12px !important;
      cursor: pointer !important;
      border: 1px solid #333 !important;
      border-radius: 4px !important;
      background: #f8f8f8 !important;
      min-width: 40px !important;
      margin: 0 !important;
      color: #333 !important;
      font-weight: 500 !important;
    }
    
    .ez-btn:hover {
      background: #e8e8e8 !important;
      border-color: #000 !important;
    }
  `;
  document.head.appendChild(style);
}

function markEditableElements() {
  const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'a', 'button', 'li', 'td', 'th', 'blockquote'];
  let count = 0;
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Skip if already marked or empty
      if (el.hasAttribute('data-editable') || !el.textContent?.trim()) {
        return;
      }
      
      // Skip if too small but allow elements with children for now
      if (el.offsetWidth < 10 || el.offsetHeight < 5) {
        return;
      }
      
      // Skip only if it has many children (likely a container)
      if (el.children.length > 3) {
        return;
      }
      
      el.setAttribute('data-editable', 'true');
      console.log(`Marked editable: ${el.tagName} - "${el.textContent.substring(0, 30)}"`);
      count++;
    });
  });
  
  console.log(`✅ Made ${count} elements editable`);
}

function setupEventListeners() {
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeydown, true);
}

function handleClick(e) {
  const element = e.target;
  
  if (element.hasAttribute('data-editable')) {
    e.preventDefault();
    e.stopPropagation();
    activateElement(element);
  } else if (!element.closest('.ez-toolbar')) {
    deactivateElement();
  }
}

function activateElement(element) {
  console.log('🎯 Activating element:', element.tagName);
  
  // Deactivate current element
  if (activeElement) {
    deactivateElement();
  }
  
  // Set new active element
  activeElement = element;
  element.contentEditable = true;
  element.focus();
  
  // Show toolbar with delay to ensure positioning
  setTimeout(() => {
    showToolbar(element);
  }, 10);
}

function deactivateElement() {
  if (activeElement) {
    activeElement.contentEditable = false;
    activeElement = null;
  }
  hideToolbar();
}

function createToolbar() {
  if (toolbar) return;
  
  toolbar = document.createElement('div');
  toolbar.className = 'ez-toolbar';
  toolbar.contentEditable = false;
  
  const commands = [
    { label: '𝐁', action: () => exec('bold') },
    { label: '𝐈', action: () => exec('italic') },
    { label: '𝐔', action: () => exec('underline') },
    { label: 'List', action: () => exec('insertUnorderedList') },
    { label: 'Color', action: () => pickColor() },
    { label: '💬', action: () => openAIChat() }
  ];
  
  commands.forEach(cmd => {
    const btn = document.createElement('button');
    btn.className = 'ez-btn';
    btn.textContent = cmd.label;
    btn.contentEditable = false;
    
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cmd.action();
    });
    
    toolbar.appendChild(btn);
  });
  
  document.body.appendChild(toolbar);
}

function showToolbar(element) {
  if (!toolbar) {
    console.error('❌ Toolbar not found!');
    return;
  }
  
  const rect = element.getBoundingClientRect();
  const top = rect.top + window.scrollY - 60;
  const left = rect.left + window.scrollX;
  
  console.log(`📍 Showing toolbar at top: ${top}, left: ${left}`);
  
  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${left}px`;
  toolbar.style.display = 'flex';
  toolbar.style.visibility = 'visible';
  toolbar.style.opacity = '1';
  
  console.log('✅ Toolbar should now be visible');
}

function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

function handleKeydown(e) {
  if (!activeElement) return;
  
  if (e.key === 'Escape') {
    deactivateElement();
  }
}

function pickColor() {
  const color = prompt('Enter color (hex, rgb, or name):');
  if (color) {
    exec('foreColor', color);
  }
}

function openAIChat() {
  console.log('🤖 Opening AI chat...');
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: white; border: 1px solid #ccc; border-radius: 8px;
    padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001; width: 400px; height: 500px;
    display: flex; flex-direction: column;
  `;
  
  modal.innerHTML = `
    <h3>AI Assistant</h3>
    <div id="chatMessages" style="flex: 1; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin: 10px 0; border-radius: 4px;">
      <div style="color: #666;">Ask me to help you edit this content...</div>
    </div>
    <div style="display: flex; gap: 10px;">
      <input type="text" id="chatInput" placeholder="Type your message..." style="flex: 1; padding: 8px;">
      <button id="sendChat" style="padding: 8px 16px;">Send</button>
    </div>
    <button id="closeChat" style="margin-top: 10px;">Close</button>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('closeChat').onclick = () => document.body.removeChild(modal);
  document.getElementById('sendChat').onclick = sendMessage;
  document.getElementById('chatInput').onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
  
  function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    messages.innerHTML += `<div style="margin: 5px 0; text-align: right;"><strong>You:</strong> ${message}</div>`;
    input.value = '';
    
    // Simple response
    messages.innerHTML += `<div style="margin: 5px 0;"><strong>AI:</strong> I can help you format this text. Try using the toolbar buttons for bold, italic, or color changes.</div>`;
    messages.scrollTop = messages.scrollHeight;
  }
}

// Initialize when script loads
initEditor();

console.log('✅ Editor bridge loaded successfully');