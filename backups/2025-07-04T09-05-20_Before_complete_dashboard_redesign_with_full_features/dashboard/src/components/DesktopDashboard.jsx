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
        
        // Create toolbar
        function createEditorToolbar() {
          if (toolbar) return;
          
          toolbar = document.createElement('div');
          toolbar.className = 'editor-toolbar';
          toolbar.contentEditable = false;
          
          const commands = [
            { label: '𝐁', action: () => exec('bold') },
            { label: '𝐈', action: () => exec('italic') },
            { label: '𝐔', action: () => exec('underline') },
            { label: 'Color', action: () => {
              const color = prompt('Enter color (hex, rgb, or name):');
              if (color) exec('foreColor', color);
            }},
            { label: '💬', action: () => {
              alert('AI Chat feature - coming soon!');
            }}
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
          
          console.log('✅ Working editor initialized with', editableElements.length, 'editable elements');
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
    if (!chatMessage.trim()) return;
    
    console.log('Sending message:', chatMessage);
    // Here you can add actual chat functionality
    // For now, just clear the input
    setChatMessage("");
  };

  return (
    <div className="dashboard-wireframe">
      {/* Header */}
      <header className="header-wireframe">
        <div className="logo-section">
          <a href="/" className="logo-link">
            <img src="/logo.svg" alt="LocalAI Builder" className="dashboard-logo" />
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

      {/* Main Content */}
      <div className="main-content-wireframe">
        {/* Live Preview Panel */}
        <div className="preview-panel-wireframe">
          <div className="preview-container">
            {previewContent && (
              <iframe
                key={previewContent}
                src={previewContent}
                className="preview-iframe preview-desktop"
                onLoad={handleIframeLoad}
                title="Website Preview"
              />
            )}
          </div>
          
          <button 
            className="view-site-btn" 
            onClick={() => {
              if (previewContent) {
                window.open(previewContent, '_blank');
              }
            }}
          >
            View Site
          </button>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel-wireframe">
          <div className="chat-input-container">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesktopDashboard;