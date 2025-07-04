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
      position: absolute !important;
      background: white !important;
      border: 1px solid #aaa !important;
      border-radius: 6px !important;
      padding: 4px !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
      z-index: 10000 !important;
      display: none !important;
      flex-wrap: wrap !important;
      gap: 2px !important;
      min-width: 300px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    
    .ez-btn {
      font: 14px/1 sans-serif !important;
      padding: 4px 6px !important;
      cursor: pointer !important;
      border: 1px solid #ddd !important;
      border-radius: 3px !important;
      background: white !important;
      min-width: 30px !important;
      margin: 0 !important;
    }
    
    .ez-btn:hover {
      background: #f0f0f0 !important;
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
      
      // Skip if too small or is a container
      if (el.offsetWidth < 10 || el.offsetHeight < 5 || el.children.length > 0) {
        return;
      }
      
      el.setAttribute('data-editable', 'true');
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
  
  // Show toolbar
  showToolbar(element);
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
  if (!toolbar) return;
  
  const rect = element.getBoundingClientRect();
  toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
  toolbar.style.left = `${rect.left + window.scrollX}px`;
  toolbar.style.display = 'flex';
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