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
      // Inject editor bridge script
      const script = frameDoc.createElement('script');
      script.id = 'editor-bridge-script';
      script.textContent = `
/**
 * INLINE EDITOR BRIDGE - Mobile Version
 */
let currentEditableElement = null;
let toolbar = null;
let undoHistory = [];
let redoHistory = [];

const COMMANDS = {
  '𝐁': { action: () => document.execCommand('bold'), tooltip: 'Bold' },
  '𝑰': { action: () => document.execCommand('italic'), tooltip: 'Italic' },
  '𝑼': { action: () => document.execCommand('underline'), tooltip: 'Underline' },
  'List': { action: () => document.execCommand('insertUnorderedList'), tooltip: 'Bullet List' },
  'A🖌️': { action: () => openColorPicker('foreColor'), tooltip: 'Text Color' },
  '🖼️': { action: () => insertMedia('image'), tooltip: 'Insert Image' },
  '💬': { action: () => openAIChat(), tooltip: 'AI Assistant' }
};

function initEditorBridge() {
  console.log('🚀 Mobile Editor Bridge initialized');
  loadEditorStyles();
  setupEditableElements();
  setupGlobalListeners();
  console.log('✅ Mobile Editor Bridge ready');
}

function loadEditorStyles() {
  const style = document.createElement('style');
  style.textContent = \`
    .ez-editable { position: relative; transition: outline 0.2s ease; }
    .ez-editable-active { outline: 2px solid #007cff !important; outline-offset: 2px !important; }
    .ez-element-delete {
      position: absolute; top: -8px; right: -8px; width: 20px; height: 20px;
      background: #6c757d; color: white; border: none; border-radius: 50%;
      font-size: 12px; cursor: pointer; display: none; z-index: 100000;
      line-height: 20px; text-align: center; font-weight: bold;
    }
    .ez-element-delete:hover { background: #5a6268; }
    .ez-toolbar {
      position: absolute; background: white; border: 1px solid #ccc;
      border-radius: 6px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 99999; display: none; flex-wrap: wrap; gap: 4px; max-width: 250px;
    }
    .ez-toolbar button, .ez-toolbar select {
      background: white; border: 1px solid #ccc; border-radius: 4px;
      padding: 4px 6px; cursor: pointer; font-size: 11px; min-width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
    }
    .ez-toolbar button:hover, .ez-toolbar select:hover { background: #f0f0f0; border-color: #999; }
  \`;
  document.head.appendChild(style);
}

function setupEditableElements() {
  const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'div', 'a', 'button', 'img'];
  editableSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (!element.classList.contains('ez-editable') && 
          !element.closest('.ez-toolbar') &&
          element.textContent.trim()) {
        element.classList.add('ez-editable');
        addDeleteButton(element);
      }
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
}

function handleElementClick(e) {
  const element = e.target.closest('.ez-editable');
  if (element) {
    e.preventDefault();
    activateElement(element);
  }
}

function activateElement(element) {
  deactivateCurrentElement();
  currentEditableElement = element;
  element.classList.add('ez-editable-active');
  element.contentEditable = true;
  
  const deleteBtn = element.querySelector('.ez-element-delete');
  if (deleteBtn) deleteBtn.style.display = 'block';
  
  showToolbar(element);
  element.focus();
}

function deactivateCurrentElement() {
  if (currentEditableElement) {
    currentEditableElement.classList.remove('ez-editable-active');
    currentEditableElement.contentEditable = false;
    const deleteBtn = currentEditableElement.querySelector('.ez-element-delete');
    if (deleteBtn) deleteBtn.style.display = 'none';
    currentEditableElement = null;
  }
  hideToolbar();
}

function showToolbar(element) {
  if (!toolbar) createToolbar();
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  toolbar.style.display = 'flex';
  toolbar.style.top = (rect.top + scrollTop - toolbar.offsetHeight - 10) + 'px';
  toolbar.style.left = (rect.left + scrollLeft) + 'px';
}

function createToolbar() {
  toolbar = document.createElement('div');
  toolbar.className = 'ez-toolbar';
  
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
  
  const fontSizeDropdown = document.createElement('select');
  fontSizeDropdown.innerHTML = \`<option value="12px">12px</option><option value="16px">16px</option><option value="20px">20px</option><option value="24px">24px</option>\`;
  fontSizeDropdown.addEventListener('change', (e) => {
    if (currentEditableElement) currentEditableElement.style.fontSize = e.target.value;
  });
  toolbar.appendChild(fontSizeDropdown);
  
  document.body.appendChild(toolbar);
}

function hideToolbar() {
  if (toolbar) toolbar.style.display = 'none';
}

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    e.shiftKey ? redoAction() : undoAction();
  }
  if (e.key === 'Escape') deactivateCurrentElement();
}

function saveToHistory() {
  if (currentEditableElement) {
    undoHistory.push({
      element: currentEditableElement,
      content: currentEditableElement.innerHTML,
      timestamp: Date.now()
    });
    if (undoHistory.length > 20) undoHistory.shift();
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
  input.accept = 'image/*';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        saveToHistory();
        document.execCommand('insertHTML', false, \`<img src="\${e.target.result}" style="max-width: 100%; height: auto;" alt="Uploaded image">\`);
      };
      reader.readAsDataURL(file);
    }
  });
  input.click();
}

function openAIChat() {
  const chatPanel = document.createElement('div');
  chatPanel.style.cssText = \`
    position: fixed; top: 20px; left: 20px; right: 20px; bottom: 20px;
    background: white; border: 1px solid #ccc; border-radius: 8px; padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100002;
    display: flex; flex-direction: column;
  \`;
  
  chatPanel.innerHTML = \`
    <h3>AI Assistant</h3>
    <div id="chatMessages" style="flex: 1; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin: 10px 0; border-radius: 4px;">
      <div style="color: #666; font-style: italic;">Ask me to help you edit this content...</div>
    </div>
    <div style="display: flex; gap: 8px;">
      <input type="text" id="chatInput" placeholder="Type your message..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      <button id="sendChat" style="padding: 8px 12px; background: #007cff; color: white; border: none; border-radius: 4px;">Send</button>
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
      
      script.onload = () => {
        console.log('✅ Editor bridge injected successfully');
        // Force initialization
        if (frameDoc.defaultView && frameDoc.defaultView.initEditorBridge) {
          frameDoc.defaultView.initEditorBridge();
        }
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to inject editor bridge:', error);
      };
      
      frameDoc.head.appendChild(script);
      
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

export default function MobileDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
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
            console.log('Auto-loaded user data for mobile preview');
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
            console.log('Created short URL for mobile preview:', shortUrl);
            return;
          }
        } catch (error) {
          console.error('Error creating short URL for mobile preview:', error);
        }
      }
      
      // Fallback
      setPreviewContent('/t/v1');
    };
    
    createPreviewUrl();
  }, [bootstrap]);

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



  return (
    <div className="mobile-dashboard-wireframe">
      {/* Sticky Top Bar */}
      <header className="mobile-header-wireframe">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start'}}>
          <a href="/" className="mobile-logo-link">
            <img src="/logo.svg" alt="LocalAI Builder" className="mobile-dashboard-logo" />
          </a>
          <button className="icon-btn-wireframe">🔔</button>
          <button className="small-btn-wireframe">Publish</button>
          <button className="small-btn-wireframe" onClick={handleLogout}>Logout</button>
        </div>
        <div className="dropdown-wrapper">
          <button 
            className="small-btn-wireframe"
            onClick={() => setShowPagesDropdown(!showPagesDropdown)}
          >
            Pages ▼
          </button>
          {showPagesDropdown && (
            <div className="versions-dropdown">
              <div className="version-item" onClick={() => {
                showTemplatePreview('/templates/homepage/v1/index.jsx');
              }}>
                Homepage
              </div>
              <div className="version-item" onClick={() => {
                showTemplatePreview('/templates/service/v1/index.jsx');
              }}>
                Service
              </div>
              <div className="version-item" onClick={() => {
                showTemplatePreview('/templates/contact/v1/index.jsx');
              }}>
                Contact
              </div>
            </div>
          )}
        </div>

      </header>

      {/* Scrollable main content */}
      <div className="container-wireframe">
        {/* Live Preview */}
        <div className="panel-wireframe">
          <h2>Live Preview</h2>
          <div className="preview-mobile">
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
            className="view-live-btn-mobile" 
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
        <div className="panel-wireframe">
          <UnifiedCommandChatPanel />
        </div>
      </div>
    </div>
  );
}