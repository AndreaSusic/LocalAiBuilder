import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";
import EditorPanel from "./EditorPanel";

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
    // Listen for messages from preview iframe
    const handleMessage = (event) => {
      if (event.data.type === 'openAIChat') {
        setActiveTab('ai');
        setTimeout(() => {
          const chatInput = document.querySelector('.chat-input');
          if (chatInput) {
            chatInput.focus();
            chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else if (event.data.type === 'requestAuthStatus') {
        event.source.postMessage({
          type: 'authStatusResponse',
          isAuthenticated: !!user
        }, '*');
        console.log('Auth status sent to iframe:', !!user);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user]);

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    console.log('iframe loaded:', iframe.src);
    
    // Simple editor injection
    setTimeout(() => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const script = iframeDoc.createElement('script');
          script.textContent = `
            console.log('Editor bridge loaded');
            
            // Add universal editing styles with delete buttons
            const style = document.createElement('style');
            style.textContent = \`
              .edit-hover:hover {
                outline: 2px dashed #ff4444 !important;
                outline-offset: 2px !important;
                position: relative !important;
              }
              .edit-active {
                outline: 2px solid #ffc000 !important;
                outline-offset: 2px !important;
                position: relative !important;
              }
              .delete-btn {
                position: absolute !important;
                top: -8px !important;
                right: -8px !important;
                width: 20px !important;
                height: 20px !important;
                background: #ff4444 !important;
                color: white !important;
                border: none !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                font-size: 12px !important;
                line-height: 1 !important;
                z-index: 9999 !important;
                display: none !important;
              }
              .edit-hover:hover .delete-btn,
              .edit-active .delete-btn {
                display: block !important;
              }
              .delete-btn:hover {
                background: #cc0000 !important;
              }
            \`;
            document.head.appendChild(style);
            
            // Make ALL elements editable and deletable (including menus, buttons, images)
            document.querySelectorAll('*').forEach(el => {
              // Skip script, style, html, head, body tags
              if (['SCRIPT', 'STYLE', 'HTML', 'HEAD', 'BODY'].includes(el.tagName)) return;
              
              // Add hover class and delete button to ALL visible elements
              if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                el.classList.add('edit-hover');
                
                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '×';
                deleteBtn.className = 'delete-btn';
                deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  if (confirm('Delete this element?')) {
                    el.remove();
                    // Send delete command to parent dashboard
                    parent.postMessage({
                      type: 'elementDeleted',
                      element: el.tagName,
                      content: el.textContent?.substring(0, 50) || 'element'
                    }, '*');
                  }
                };
                el.appendChild(deleteBtn);
                
                // Add click to edit functionality
                el.addEventListener('click', (e) => {
                  e.stopPropagation();
                  
                  // Remove active from all elements
                  document.querySelectorAll('.edit-active').forEach(active => {
                    active.classList.remove('edit-active');
                    active.contentEditable = false;
                  });
                  
                  // Activate this element
                  el.classList.add('edit-active');
                  
                  // Make editable if it's a text element
                  if (['H1','H2','H3','H4','H5','H6','P','SPAN','DIV','A','LI','BUTTON'].includes(el.tagName)) {
                    el.contentEditable = true;
                    el.focus();
                    
                    // Send message to parent for editor panel connection
                    parent.postMessage({
                      type: 'elementSelected',
                      tagName: el.tagName,
                      content: el.textContent
                    }, '*');
                  }
                });
              }
            });
            
            // Click outside to deactivate
            document.addEventListener('click', (e) => {
              if (!e.target.closest('.edit-hover')) {
                document.querySelectorAll('.edit-active').forEach(active => {
                  active.classList.remove('edit-active');
                  active.contentEditable = false;
                });
              }
            });
            
            // Listen for formatting commands from parent dashboard
            window.addEventListener('message', (event) => {
              if (event.data.type === 'execCommand') {
                const activeEl = document.querySelector('.edit-active');
                if (activeEl) {
                  document.execCommand(event.data.command, false, event.data.value);
                }
              }
            });
          `;
          iframeDoc.head.appendChild(script);
        }
      } catch (error) {
        console.log('Could not inject editor (cross-origin):', error.message);
      }
    }, 1000);
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
          console.log('Created short URL for preview:', window.location.origin + shortUrl);
          setPreviewContent(window.location.origin + shortUrl);
          return;
        }
      } catch (error) {
        console.error('Error creating short URL:', error);
      }
    }
    
    setPreviewContent('/t/v1/demo');
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isProcessing) return;
    
    const userMessage = chatMessage.trim();
    setChatMessage("");
    setIsProcessing(true);
    
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory.slice(-10)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                aiResponse += data.content;
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  if (newHistory[newHistory.length - 1].role === 'assistant') {
                    newHistory[newHistory.length - 1].content = aiResponse;
                  }
                  return newHistory;
                });
              }
            } catch (e) {
              console.warn('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    showTemplatePreview();
    
    const checkAuth = async () => {
      try {
        // Dashboard users get auto-authentication for editing features
        setUser({ 
          name: 'Dashboard User', 
          email: 'dashboard@localai.dev',
          isDashboardUser: true 
        });
        console.log('✅ Dashboard user auto-authenticated for editing');
      } catch (error) {
        console.error('Auth setup failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [bootstrap]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-wireframe">
      {/* Header */}
      <div className="header-wireframe">
        <div className="logo-section">
          <button className="btn-wireframe" onClick={() => navigate('/new')}>
            New Site
          </button>
          <button className="btn-wireframe" onClick={() => console.log('Save clicked')}>
            Save
          </button>
        </div>

        <div className="header-center">
          <span>Credits: ∞</span>
          <button className="btn-outline">Pages ▼</button>
        </div>

        <div className="header-switches">
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="dropdown-styled"
          >
            <option value="EN">EN</option>
            <option value="SR">SR</option>
          </select>
          
          <select 
            value={currentDevice} 
            onChange={(e) => setCurrentDevice(e.target.value)}
            className="dropdown-styled"
          >
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
          </select>

          <button className="btn-wireframe" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Grid - using 3fr 1fr as in CSS */}
      <div className="main-content-wireframe">
        {/* Left Side: Preview */}
        <div className="preview-panel-wireframe">
          <div className="preview-container">
            {previewContent && (
              <iframe
                className="preview-iframe"
                src={previewContent}
                onLoad={handleIframeLoad}
              />
            )}
          </div>
          <button className="view-site-btn" onClick={() => window.open(previewContent, '_blank')}>
            View Site
          </button>
        </div>

        {/* Right Side: Editor Panel */}
        <div className="right-panel-wireframe">
          {/* Tab Navigation - completely removed as requested */}
          
          <div className="tab-content">
            {activeTab === 'text' && (
              <EditorPanel />
            )}
            {activeTab === 'media' && (
              <div className="panel-section">
                <h4>Media Tools</h4>
                <div className="tool-buttons">
                  <button className="tool-btn">📷 Upload Image</button>
                  <button className="tool-btn">🎥 Upload Video</button>
                  <button className="tool-btn">🔧 Resize Media</button>
                </div>
              </div>
            )}
            {activeTab === 'components' && (
              <div className="panel-section">
                <h4>Add Sections</h4>
                <div className="component-buttons">
                  <button className="component-btn" style={{background: '#ffc000', color: 'white'}}>+ Hero Section</button>
                  <button className="component-btn" style={{background: '#ffc000', color: 'white'}}>+ Services</button>
                  <button className="component-btn" style={{background: '#ffc000', color: 'white'}}>+ About Us</button>
                  <button className="component-btn" style={{background: '#ffc000', color: 'white'}}>+ Contact</button>
                </div>
              </div>
            )}
            {activeTab === 'ai' && (
              <UnifiedCommandChatPanel
                chatHistory={chatHistory}
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                handleSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            )}
          </div>

          {/* Sticky Command Input at Bottom */}
          <div className="sticky-command-input">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type command or question..."
              className="command-input-field"
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !chatMessage.trim()}
              className="command-send-button"
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