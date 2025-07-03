import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject editor bridge into iframe for inline editing
function injectEditorBridge(iframe) {
  try {
    console.log('🔧 Attempting to inject editor bridge...');
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Check if bridge is already injected
    if (frameDoc.querySelector('#editor-bridge-script')) {
      console.log('⚠️ Editor bridge already injected');
      return;
    }
    
    // Wait for iframe to fully load
    const injectScript = () => {
      // Inject editor bridge script directly as text content
      const script = frameDoc.createElement('script');
      script.id = 'editor-bridge-script';
      script.textContent = `
/**
 * INLINE EDITOR BRIDGE
 * Framework-agnostic inline editing system for live preview iframe
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
  style.textContent = \`
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
  \`;
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
  headingDropdown.innerHTML = \`
    <option value="P">Normal</option>
    <option value="H1">H1</option>
    <option value="H2">H2</option>
    <option value="H3">H3</option>
    <option value="H4">H4</option>
  \`;
  headingDropdown.addEventListener('change', (e) => {
    changeHeading(e.target.value);
  });
  toolbar.appendChild(headingDropdown);
  
  // Create font size dropdown
  const fontSizeDropdown = document.createElement('select');
  fontSizeDropdown.innerHTML = \`
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
  \`;
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
          \`<img src="\${e.target.result}" style="max-width: 100%; height: auto;" alt="Uploaded \${type}">\` :
          \`<video src="\${e.target.result}" controls style="max-width: 100%; height: auto;"></video>\`;
        document.execCommand('insertHTML', false, element);
      };
      reader.readAsDataURL(file);
    }
  });
  
  input.click();
}

function openVideoPanel() {
  const panel = document.createElement('div');
  panel.style.cssText = \`
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
  \`;
  
  panel.innerHTML = \`
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
  \`;
  
  document.body.appendChild(panel);
  
  document.getElementById('cancelVideo').onclick = () => document.body.removeChild(panel);
  document.getElementById('insertVideo').onclick = () => {
    const url = document.getElementById('videoUrl').value;
    const file = document.getElementById('videoFile').files[0];
    
    if (url) {
      saveToHistory();
      document.execCommand('insertHTML', false, \`<video src="\${url}" controls style="max-width: 100%; height: auto;"></video>\`);
    } else if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        saveToHistory();
        document.execCommand('insertHTML', false, \`<video src="\${e.target.result}" controls style="max-width: 100%; height: auto;"></video>\`);
      };
      reader.readAsDataURL(file);
    }
    
    document.body.removeChild(panel);
  };
}

function openAIChat() {
  const chatPanel = document.createElement('div');
  chatPanel.style.cssText = \`
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
  \`;
  
  chatPanel.innerHTML = \`
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
  \`;
  
  document.body.appendChild(chatPanel);
  
  document.getElementById('closeChat').onclick = () => document.body.removeChild(chatPanel);
  
  const sendMessage = async () => {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    messages.innerHTML += \`<div style="margin: 5px 0; text-align: right;"><strong>You:</strong> \${message}</div>\`;
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
      messages.innerHTML += \`<div style="margin: 5px 0;"><strong>AI:</strong> \${data.response}</div>\`;
      messages.scrollTop = messages.scrollHeight;
    } catch (error) {
      messages.innerHTML += \`<div style="margin: 5px 0; color: red;"><strong>Error:</strong> Could not connect to AI</div>\`;
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
      `;
      
      frameDoc.head.appendChild(script);
      console.log('✅ Editor bridge injected successfully as inline script');
      
      // Also inject CSS for better styling
      const style = frameDoc.createElement('style');
      style.textContent = `
        .ez-editable-active {
          outline: 2px solid #007cff !important;
          outline-offset: 2px !important;
        }
        .ez-toolbar {
          z-index: 99999 !important;
        }
        .ez-element-delete {
          z-index: 100000 !important;
        }
      `;
      frameDoc.head.appendChild(style);
    };
    
    // Try to inject immediately, or wait for load
    if (frameDoc.readyState === 'complete') {
      injectScript();
    } else {
      iframe.addEventListener('load', injectScript);
    }
    
    // Listen for save messages from the iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'editor-save') {
        console.log('💾 Received edit from iframe:', event.data.data);
        // Here you can save the changes to your backend or state
      }
    });
    
  } catch (error) {
    console.error('❌ Could not inject editor bridge:', error);
  }
}

export default function DesktopDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [selectedTab, setTab] = useState("text");
  const [draftChat, setChat] = useState("");
  const [previewScreen, setPreviewScreen] = useState("desktop");
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [previewContent, setPreviewContent] = useState(() => {
    // Use short URL approach for preview to avoid long URLs
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      // Try to create a short URL for preview
      return null; // Will be set by useEffect
    }
    return '/t/v1';
  });

  /* AUTO-LOAD USER DATA ON MOUNT AND CREATE SHORT URL FOR PREVIEW */
  useEffect(() => {
    const createPreviewUrl = async () => {
      let dataToUse = bootstrap;
      
      // If no bootstrap data, try to load user data
      if (!dataToUse || Object.keys(dataToUse).length === 0) {
        try {
          const response = await fetch('/api/user-data', {
            credentials: 'include'
          });
          if (response.ok) {
            dataToUse = await response.json();
            console.log('Auto-loaded user data for desktop preview');
          }
        } catch (error) {
          console.log('Could not auto-load user data:', error.message);
          setPreviewContent('/t/v1');
          return;
        }
      }
      
      // Create short URL for preview iframe
      if (dataToUse && Object.keys(dataToUse).length > 0) {
        try {
          const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
          
          const response = await fetch('/api/cache-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: shortId, data: dataToUse })
          });
          
          if (response.ok) {
            const shortUrl = `/t/v1/${shortId}`;
            setPreviewContent(shortUrl);
            console.log('Created short URL for preview:', shortUrl);
            return;
          }
        } catch (error) {
          console.error('Error creating short URL for preview:', error);
        }
      }
      
      // Fallback
      setPreviewContent('/t/v1');
    };
    
    createPreviewUrl();
  }, [bootstrap]);

  /* HANDLERS */
  const sendChat = () => { console.log("Chat:", draftChat); setChat(""); };
  const newSite = () => console.log("New Site");
  const saveSite = () => console.log("Save");
  const publish = () => console.log("Publish");

  const openVer = v => {
    let baseUrl = '';
    if (v === "Version 1") {
      baseUrl = '/templates/homepage/v1/index.jsx';
    } else if (v === "Version 2") {
      baseUrl = '/templates/homepage/v2/index.jsx'; 
    } else if (v === "Version 3") {
      baseUrl = '/templates/homepage/v3/index.jsx';
    }
    
    // Add bootstrap data to URL if available
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      const encoded = encodeURIComponent(JSON.stringify(bootstrap));
      baseUrl += `?data=${encoded}`;
    }
    
    window.open(baseUrl, '_blank');
  };
  const handleEditorAction = (action) => {
    console.log('Toolbar action:', action);
  };
  const switchPreviewScreen = () => {
    const screens = ["desktop", "tablet", "mobile"];
    const currentIndex = screens.indexOf(previewScreen);
    const nextIndex = (currentIndex + 1) % screens.length;
    setPreviewScreen(screens[nextIndex]);
    console.log('Preview screen:', screens[nextIndex]);
  };

  const showTemplatePreview = async (templateUrl) => {
    // Generate a short URL with cached data
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      try {
        // Generate short code for the bootstrap data
        const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Cache the data on the server
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: shortId, data: bootstrap })
        });
        
        if (response.ok) {
          const shortUrl = `/t/v1/${shortId}`;
          window.open(shortUrl, '_blank');
          setShowPagesDropdown(false);
          console.log('Opening template with short URL:', shortUrl);
          return;
        }
      } catch (error) {
        console.error('Error creating short URL:', error);
      }
    }
    
    // Fallback: open without data
    window.open('/t/v1/demo', '_blank');
    setShowPagesDropdown(false);
  };

  const handleLogout = async () => {
    try {
      // Use the correct logout endpoint
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/logout';
    }
  };

  // Handle undo/redo actions from iframe
  const handleUndo = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'undo' }, '*');
    }
  };

  const handleRedo = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'redo' }, '*');
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* ---------------- TOP BAR ---------------- */}
      <div className="topBar">
        <div className="group">
          <span className="hamburger">☰</span>
          <a href="/" className="logo-link">
            <img src="/logo.svg" alt="LocalAI Builder" className="dashboard-logo" />
          </a>
          <button className="btn" onClick={newSite}>New Site</button>
          <button className="btn" onClick={saveSite}>Save</button>
          <button className="btn" onClick={handleUndo} title="Undo (Ctrl+Z)">↶</button>
          <button className="btn" onClick={handleRedo} title="Redo (Ctrl+Y)">↷</button>
          <button className="btn" onClick={publish}>Publish</button>
        </div>

        <div className="group">
          <div className="usage">Basic Plan  3 / 10 q's</div>
          <button className="iconBtn">🛎️</button>
          <button className="iconBtn">❔</button>
        </div>

        <div className="group">
          <button className="btn preview-switcher" onClick={switchPreviewScreen}>
            {previewScreen === "desktop" && "🖥️ Desktop"}
            {previewScreen === "tablet" && "📱 Tablet"}
            {previewScreen === "mobile" && "📱 Mobile"}
          </button>
          <button className="btn">Sites ▼</button>
          <div style={{ position: "relative" }}>
            <button 
              className="btn" 
              onClick={() => setShowPagesDropdown(!showPagesDropdown)}
            >
              Pages ▼
            </button>
            {showPagesDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minWidth: "120px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div 
                  onClick={() => showTemplatePreview("/templates/homepage/v1/index.jsx")}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Homepage
                </div>
                <div 
                  onClick={() => showTemplatePreview("/templates/service/v1/index.jsx")}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Service
                </div>
                <div 
                  onClick={() => showTemplatePreview("/templates/contact/v1/index.jsx")}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Contact
                </div>
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button 
              className="btn" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minWidth: "120px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div 
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- GRID ---------------- */}
      <div className="grid">

        {/* Versions + Chat */}
        <div className="panel" style={{ display: "none" }}>
          <h2>Versions</h2>
          <input
            className="search"
            placeholder="Search versions…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <div className="versionsCards">
            {versions
              .filter(v=>v.toLowerCase().includes(search.toLowerCase()))
              .map(v=>(
                <div key={v} className="versionCard" onClick={()=>openVer(v)}>
                  {v}
                </div>
            ))}
          </div>
       
        </div>

        {/* Live Preview */}
        <div className="panel">
          <h2>Live Preview - {previewScreen}</h2>
          <div className={`preview preview-${previewScreen}`}>
            <iframe 
              ref={(iframe) => {
                if (iframe && iframe.src !== "about:blank") {
                  iframe.onload = () => injectEditorBridge(iframe);
                }
              }}
              title="preview" 
              src={previewContent || "about:blank"} 
              style={{
                width: "100%",
                height: "100%",
                border: "none"
              }}
            />
          </div>
          <button 
            className="view-live-btn" 
            onClick={async () => {
              // Generate a short URL with cached data
              if (bootstrap && Object.keys(bootstrap).length > 0) {
                try {
                  const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                  
                  const response = await fetch('/api/cache-preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: shortId, data: bootstrap })
                  });
                  
                  if (response.ok) {
                    window.open(`/t/v1/${shortId}`, '_blank');
                    return;
                  }
                } catch (error) {
                  console.error('Error creating short URL:', error);
                }
              }
              
              // Fallback
              window.open('/t/v1/demo', '_blank');
            }}
          >
            View Live Site
          </button>
        </div>

        {/* Unified Command Chat Panel */}
        <UnifiedCommandChatPanel />
      </div>
    </div>
  );
}