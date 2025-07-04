import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject the working inline editor
function injectWorkingEditor(iframe) {
  try {
    console.log('🔧 Injecting working inline editor...');
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!frameDoc) {
      console.error('❌ Cannot access iframe document');
      return;
    }
    
    // Remove any existing editor scripts
    const existingScripts = frameDoc.querySelectorAll('[id*="editor"], [id*="bridge"]');
    existingScripts.forEach(script => script.remove());
    
    // Wait for React content to fully load
    setTimeout(() => {
      // Inject the working editor script directly
      const script = frameDoc.createElement('script');
      script.id = 'working-editor-script';
      script.textContent = `
        console.log('🚀 Working inline editor starting...');
        
        let activeElement = null;
        let toolbar = null;
        
        // Simple command execution
        function exec(command, value = null) {
          try {
            document.execCommand(command, false, value);
            console.log('✅ Executed command:', command);
          } catch (error) {
            console.error('Command execution failed:', command, error);
          }
        }
        
        // Add editor styles
        function addEditorStyles() {
          if (document.getElementById('editor-styles')) return;
          
          const style = document.createElement('style');
          style.id = 'editor-styles';
          style.textContent = \`
            [data-editable="true"]:hover {
              outline: 2px dotted #ff0000 !important;
              outline-offset: 2px !important;
              cursor: pointer !important;
            }
            
            [data-editable="true"][contenteditable="true"] {
              outline: 2px solid #ffc000 !important;
              outline-offset: 2px !important;
            }
            
            .editor-toolbar {
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
              min-width: 300px !important;
              font-family: sans-serif !important;
            }
            
            .editor-btn {
              font: 14px/1 sans-serif !important;
              padding: 6px 10px !important;
              cursor: pointer !important;
              border: 1px solid #333 !important;
              border-radius: 4px !important;
              background: #f8f8f8 !important;
              color: #333 !important;
              font-weight: 500 !important;
            }
            
            .editor-btn:hover {
              background: #e8e8e8 !important;
              border-color: #000 !important;
            }
          \`;
          document.head.appendChild(style);
        }
        
        // Color picker functions
        function pickColor(command) {
          const color = prompt('Enter color (hex, rgb, or name):');
          if (color) {
            exec(command, color);
          }
        }
        
        // Media insertion functions
        function insertMedia(type) {
          if (type === 'image') {
            const url = prompt('Enter image URL:');
            if (url) {
              exec('insertImage', url);
            }
          } else if (type === 'video') {
            const url = prompt('Enter video URL:');
            if (url) {
              const video = \`<video controls src="\${url}" style="max-width:100%"></video>\`;
              exec('insertHTML', video);
            }
          }
        }
        
        // Component insertion functions
        function insertComponent(type) {
          if (type === 'card') {
            const html = '<div style="border:1px solid #ddd;padding:20px;margin:10px;border-radius:8px;"><h3>Card Title</h3><p>Card content goes here...</p></div>';
            exec('insertHTML', html);
          } else if (type === 'button') {
            const text = prompt('Button text:', 'Click me');
            const html = \`<button style="background:#ffc000;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;">\${text}</button>\`;
            exec('insertHTML', html);
          }
        }
        
        // Toggle functions
        function toggleResizeBox() {
          // Add resize handles to selected element
          if (activeElement) {
            activeElement.style.resize = activeElement.style.resize === 'both' ? 'none' : 'both';
            activeElement.style.overflow = 'auto';
          }
        }
        
        function openSpacingPanel() {
          const margin = prompt('Enter margin (e.g., 10px, 1em):', '10px');
          const padding = prompt('Enter padding (e.g., 10px, 1em):', '10px');
          if (activeElement) {
            if (margin) activeElement.style.margin = margin;
            if (padding) activeElement.style.padding = padding;
          }
        }
        
        function pastePlain() {
          exec('insertText', '');
          document.execCommand('paste');
        }
        
        function toggleCodeView() {
          if (activeElement) {
            const isCode = activeElement.dataset.codeView === 'true';
            if (isCode) {
              activeElement.innerHTML = activeElement.textContent;
              activeElement.dataset.codeView = 'false';
            } else {
              activeElement.textContent = activeElement.innerHTML;
              activeElement.dataset.codeView = 'true';
            }
          }
        }
        
        // Create comprehensive toolbar
        function createEditorToolbar() {
          if (toolbar) return;
          
          toolbar = document.createElement('div');
          toolbar.className = 'editor-toolbar';
          toolbar.contentEditable = false;
          
          const commands = [
            { label: '𝐁', action: () => exec('bold') },
            { label: '𝑰', action: () => exec('italic') },
            { label: '𝑼', action: () => exec('underline') },
            { label: 'List', action: () => exec('insertUnorderedList') },
            { label: '8px', action: () => exec('fontSize', 1) },
            { label: 'A🖌️', action: () => pickColor('foreColor') },
            { label: '🖍️', action: () => pickColor('hiliteColor') },
            { label: '🖼️', action: () => insertMedia('image') },
            { label: '🎥', action: () => insertMedia('video') },
            { label: '↔️↕️', action: () => toggleResizeBox() },
            { label: '📐', action: () => openSpacingPanel() },
            { label: 'H₁', action: () => exec('formatBlock','H1') },
            { label: '¶', action: () => exec('formatBlock','P') },
            { label: '🔲', action: () => insertComponent('card') },
            { label: '📋', action: () => pastePlain() },
            { label: '</>', action: () => toggleCodeView() },
            { label: '🔘', action: () => insertComponent('button') }
          ];
          
          commands.forEach(cmd => {
            const btn = document.createElement('button');
            btn.className = 'editor-btn';
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
          console.log('✅ Toolbar created');
        }
        
        // Show toolbar
        function showEditorToolbar(element) {
          if (!toolbar) return;
          
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY - 60;
          const left = rect.left + window.scrollX;
          
          toolbar.style.top = top + 'px';
          toolbar.style.left = left + 'px';
          toolbar.style.display = 'flex';
          
          console.log('✅ Toolbar shown at', top, left);
        }
        
        // Hide toolbar
        function hideEditorToolbar() {
          if (toolbar) {
            toolbar.style.display = 'none';
          }
        }
        
        // Activate element for editing
        function activateElement(element) {
          console.log('🎯 Activating element:', element.tagName, element.textContent.substring(0, 30));
          
          if (activeElement) {
            activeElement.contentEditable = false;
            activeElement = null;
          }
          
          activeElement = element;
          element.contentEditable = true;
          element.focus();
          
          setTimeout(() => showEditorToolbar(element), 10);
        }
        
        // Setup click handlers
        function setupClickHandlers() {
          document.addEventListener('click', function(e) {
            const element = e.target;
            
            if (element.hasAttribute('data-edit') || element.hasAttribute('data-editable')) {
              e.preventDefault();
              e.stopPropagation();
              activateElement(element);
            } else if (!element.closest('.editor-toolbar')) {
              if (activeElement) {
                activeElement.contentEditable = false;
                activeElement = null;
              }
              hideEditorToolbar();
            }
          }, true);
          
          console.log('✅ Click handlers setup');
        }
        
        // Listen for content change messages from AI chat
        window.addEventListener('message', function(event) {
          if (event.data.type === 'contentChange') {
            const { action, selector, newContent } = event.data;
            
            if (action === 'updateText') {
              const element = document.querySelector(selector);
              if (element) {
                element.textContent = newContent;
                console.log('✅ Content updated via AI:', selector, newContent);
                
                // Add visual feedback
                element.style.background = '#ffc000';
                element.style.transition = 'background 0.3s';
                setTimeout(() => {
                  element.style.background = '';
                }, 1000);
              }
            }
          }
        });
        
        // Initialize editor
        function initWorkingEditor() {
          addEditorStyles();
          createEditorToolbar();
          setupClickHandlers();
          
          // Make existing data-edit elements clickable
          const editableElements = document.querySelectorAll('[data-edit]');
          editableElements.forEach(el => {
            el.setAttribute('data-editable', 'true');
          });
          
          // Also make h1, h2, h3 elements clickable for AI modifications
          const headings = document.querySelectorAll('h1, h2, h3, p, span, div[class*="title"], div[class*="heading"]');
          headings.forEach(el => {
            if (!el.hasAttribute('data-editable')) {
              el.setAttribute('data-editable', 'true');
              el.style.cursor = 'text';
            }
          });
          
          console.log('✅ Working editor initialized with', editableElements.length, 'data-edit elements and', headings.length, 'heading elements');
        }
        
        // Start when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initWorkingEditor);
        } else {
          initWorkingEditor();
        }
      `;
      frameDoc.head.appendChild(script);
      
      console.log('✅ Working editor script injected');
    }, 2000);
  } catch (error) {
    console.error('❌ Error injecting working editor:', error);
  }
}

function DesktopDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [previewContent, setPreviewContent] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [currentDevice, setCurrentDevice] = useState("Desktop");
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('text');

  useEffect(() => {
    const createPreviewUrl = async () => {
      try {
        // Generate a unique ID for the preview
        const id = Math.random().toString(36).substr(2, 9);
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, data: bootstrap || {} })
        });
        const result = await response.json();
        const shortUrl = `/t/v1/${id}`;
        setPreviewContent(shortUrl);
        console.log('Created short URL for desktop preview:', shortUrl);
      } catch (error) {
        console.error('Failed to create preview URL:', error);
        setPreviewContent('/t/v1');
      }
    };

    createPreviewUrl();
  }, [bootstrap]);

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    if (iframe && previewContent) {
      // Inject simple editor after iframe loads
      setTimeout(() => {
        injectWorkingEditor(iframe);
      }, 500);
    }
  };

  const handleLogout = async () => {
    try {
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/logout';
    }
  };

  const showTemplatePreview = async (templateUrl) => {
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      try {
        const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: shortId, data: bootstrap })
        });
        
        if (response.ok) {
          const shortUrl = `/t/v1/${shortId}`;
          window.open(shortUrl, '_blank');
          return;
        }
      } catch (error) {
        console.error('Error creating short URL:', error);
      }
    }
    
    window.open('/t/v1/demo', '_blank');
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isProcessing) return;
    
    const userMessage = chatMessage.trim();
    setChatMessage("");
    setIsProcessing(true);
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      
      // Add AI response to chat history
      setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="dashboard-wireframe">
      {/* Header */}
      <header className="header-wireframe">
        <div className="logo-section">
          <a href="/" className="logo-link">
            <img src="https://840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv.picard.replit.dev/assets/logo-transparent.png" alt="LocalAI Builder" className="dashboard-logo" />
          </a>
        </div>
        
        {/* Main Action Buttons */}
        <div className="header-center">
          <button className="btn-wireframe" onClick={() => window.open('/', '_blank')}>
            + New Site
          </button>
          <button className="btn-wireframe" onClick={() => console.log('Save clicked')}>
            Save
          </button>
          <button className="btn-wireframe" onClick={() => window.postMessage({type: 'undo'}, '*')}>
            ↶ Undo
          </button>
          <button className="btn-wireframe" onClick={() => window.postMessage({type: 'redo'}, '*')}>
            ↷ Redo
          </button>
        </div>

        {/* Language and Device Switchers */}
        <div className="header-switches">
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="language-select"
          >
            <option value="EN">EN</option>
            <option value="SR">SR</option>
          </select>
          
          <select 
            value={currentDevice} 
            onChange={(e) => setCurrentDevice(e.target.value)}
            className="device-select"
          >
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
          </select>
        </div>

        {/* Right Side Actions */}
        <div className="header-actions">
          <div className="credits-info">
            <span className="credits-label">Credits remaining: <strong>25</strong></span>
          </div>
          
          <div className="pages-dropdown">
            <button className="btn-wireframe" onClick={() => console.log('Pages clicked')}>
              Pages ▼
            </button>
          </div>

          <button className="btn-wireframe">🔔</button>

          <button className="btn-wireframe" onClick={() => console.log('Publish clicked')}>
            Publish
          </button>

          <button className="btn-wireframe" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Live Preview Panel */}
        <div className="preview-panel-wireframe">
          <div className="preview-container">
            {previewContent && (
              <iframe
                key={previewContent}
                src={previewContent}
                className={`preview-iframe preview-${currentDevice.toLowerCase()}`}
                onLoad={handleIframeLoad}
                title="Website Preview"
              />
            )}
          </div>
          
          {/* Sticky button at bottom of preview panel */}
          <div className="preview-panel-footer">
            <button 
              className="view-live-btn-mobile" 
              onClick={() => {
                if (previewContent) {
                  window.open(previewContent, '_blank');
                }
              }}
            >
              View Live Site
            </button>
          </div>
        </div>

        {/* Right Panel - Editor and Chat */}
        <div className="right-panel-wireframe">
          <div className="editor-panel">
            <div className="editor-tabs">
              <button 
                className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} 
                onClick={() => setActiveTab('text')}
              >
                Text
              </button>
              <button 
                className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} 
                onClick={() => setActiveTab('media')}
              >
                Media
              </button>
              <button 
                className={`tab-btn ${activeTab === 'components' ? 'active' : ''}`} 
                onClick={() => setActiveTab('components')}
              >
                Components
              </button>
            </div>
            <div className="editor-content">
              {activeTab === 'text' && (
                <div className="editor-commands">
                  <div className="command-group">
                    <button className="editor-cmd-btn" title="Bold">𝐁</button>
                    <button className="editor-cmd-btn" title="Italic">𝑰</button>
                    <button className="editor-cmd-btn" title="Underline">𝑼</button>
                    <button className="editor-cmd-btn" title="List">List</button>
                    <button className="editor-cmd-btn" title="Font Size">8px</button>
                    <button className="editor-cmd-btn" title="Text Color">A🖌️</button>
                    <button className="editor-cmd-btn" title="Highlight">🖍️</button>
                    <button className="editor-cmd-btn" title="Heading">H₁</button>
                    <button className="editor-cmd-btn" title="Paragraph">¶</button>
                    <button className="editor-cmd-btn" title="Paste Plain">📋</button>
                    <button className="editor-cmd-btn" title="Code View">{'</>'}</button>
                  </div>
                </div>
              )}
              {activeTab === 'media' && (
                <div className="editor-commands">
                  <div className="command-group">
                    <button className="editor-cmd-btn" title="Image">🖼️</button>
                    <button className="editor-cmd-btn" title="Video">🎥</button>
                    <button className="editor-cmd-btn" title="Resize">↔️↕️</button>
                    <button className="editor-cmd-btn" title="Spacing">📐</button>
                  </div>
                </div>
              )}
              {activeTab === 'components' && (
                <div className="editor-commands">
                  <div className="command-group">
                    <button className="editor-cmd-btn" title="Card">🔲</button>
                    <button className="editor-cmd-btn" title="Button">🔘</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Panel in Right Column */}
          <div className="chat-panel-section">
            <h3>AI Assistant</h3>
            <div className="chat-history">
              {chatHistory.map((message, index) => (
                <div key={index} className={`chat-bubble ${message.role}`}>
                  <div className="bubble-content">
                    {message.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="chat-bubble ai">
                  <div className="bubble-content">
                    <span className="typing-indicator">●●●</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-container">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message to AI..."
                className="chat-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                disabled={isProcessing}
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isProcessing}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesktopDashboard;