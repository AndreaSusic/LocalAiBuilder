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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
      } else if (event.data.type === 'elementSelected') {
        console.log('Element selected in iframe:', event.data);
      } else if (event.data.type === 'elementDeleted') {
        console.log('Element deleted in iframe:', event.data);
      } else if (event.data.type === 'historyUpdate') {
        setCanUndo(event.data.canUndo);
        setCanRedo(event.data.canRedo);
        console.log('History updated:', event.data);
      } else if (event.data.type === 'reactUndo') {
        console.log('📨 Received reactUndo request from iframe');
        // Forward to template component that has the React state management
        const iframe = document.querySelector('.preview-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'processReactUndo' }, '*');
        }
      } else if (event.data.type === 'reactRedo') {
        console.log('📨 Received reactRedo request from iframe');
        // Forward to template component that has the React state management
        const iframe = document.querySelector('.preview-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'processReactRedo' }, '*');
        }
      } else if (event.data.type === 'undoRedoStateChanged') {
        console.log('📨 Received undo/redo state change from iframe');
        setCanUndo(event.data.canUndo);
        setCanRedo(event.data.canRedo);
      }
    };

    // Keyboard shortcuts for undo/redo
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [user, canUndo, canRedo]);

  // Function to send commands to iframe
  const sendCmd = (cmd, value = null) => {
    const iframe = document.querySelector('.preview-iframe');
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      type: 'editor-cmd',
      cmd: cmd,
      value: value
    }, '*');
  };

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    console.log('iframe loaded:', iframe.src);
    
    // DISABLED: Preventing duplicate editor systems - Using WorkingInlineEditor.jsx from TemplatePreview instead
    console.log('✅ DesktopDashboard: WorkingInlineEditor will handle delete buttons');
  };


  const handleLogout = async () => {
    try {
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/logout';
    }
  };

  const handleUndo = () => {
    console.log('[dashboard] Undo click handler invoked');
    
    // Step 2: Iframe lookup
    const byClass = !!document.querySelector('.preview-iframe');
    const byId    = !!document.getElementById('previewIframe');
    const byTag   = document.getElementsByTagName('iframe').length > 0;
    console.log('[dashboard] iframe selectors match →', { byClass, byId, byTag });
    
    // Find iframe element
    const iframeEl = document.querySelector('.preview-iframe') || 
                     document.getElementById('previewIframe') || 
                     document.querySelector('iframe');
    
    if (iframeEl && iframeEl.contentWindow) {
      // Step 3: postMessage call
      console.log('[dashboard] posting undo to iframe:', iframeEl, { type: 'dashboardUndo' });
      iframeEl.contentWindow.postMessage({ type: 'dashboardUndo' }, '*');
    } else {
      console.log('[dashboard] ERROR: No iframe found for undo');
    }
  };

  const handleRedo = () => {
    console.log('🔄 Dashboard Redo button clicked');
    const iframe = document.querySelector('.preview-iframe') || document.getElementById('previewIframe');
    if (iframe && iframe.contentWindow) {
      console.log('[dashboard] posting to iframe:', { type: 'dashboardRedo' });
      // Send redo message directly to the iframe for React state management
      iframe.contentWindow.postMessage({ type: 'dashboardRedo' }, '*');
    } else {
      console.log('[dashboard] ERROR: No iframe found for redo');
    }
  };

  const showTemplatePreview = async (templateUrl) => {
    // Always show /app content in the iframe
    console.log('Setting preview content to /app');
    setPreviewContent('/app');
  };

  // Initialize preview content on mount
  useEffect(() => {
    if (!previewContent) {
      showTemplatePreview('/app');
    }
  }, []);

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
    console.log('[dashboard] useEffect running - bootstrap:', !!bootstrap);
    console.log('[dashboard] Current route:', window.location.pathname);
    
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
    
    // Mount-time sanity log - increased timeout to ensure DOM is ready
    setTimeout(() => {
      console.log('[dashboard] Debugging timeout executing on route:', window.location.pathname);
      const undoBtn = document.getElementById('dbg-undo');
      console.log(
        '[dashboard] Undo button element at mount:',
        undoBtn
      );
      
      if (undoBtn) {
        // Direct DOM listener (temporary)
        const raw = () => console.log('[dashboard] native click bubbled!');
        undoBtn.addEventListener('click', raw);
        console.log('[dashboard] DOM listener attached to undo button');
      } else {
        console.log('[dashboard] ERROR: Undo button not found in DOM');
        console.log('[dashboard] Available buttons:', document.querySelectorAll('button').length);
      }
    }, 500);
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

  console.log('[dashboard] previewSrc going to iframe:', previewContent);

  return (
    <div className="dashboard-preview-wrapper">
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
          <button 
            id="dbg-undo"
            className="btn-wireframe undoBtn" 
            onClick={() => {
              console.log('[dashboard] Undo button clicked - calling handleUndo');
              console.log('[dashboard] Current canUndo state:', canUndo);
              handleUndo();
            }} 
            disabled={false} 
            data-tip="Undo"
            style={{display: 'inline-block', visibility: 'visible', opacity: canUndo ? 1 : 0.5}}
          >
            ↶ Undo ({canUndo ? 'enabled' : 'disabled'})
          </button>
          <button 
            className="btn-wireframe" 
            onClick={handleRedo} 
            disabled={!canRedo} 
            data-tip="Redo"
            style={{display: 'inline-block', visibility: 'visible'}}
          >
            ↷ Redo
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

          {user && user.isDashboardUser ? (
            <button className="btn-wireframe" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <a href="/auth/google" className="btn-wireframe">
              Login
            </a>
          )}
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
    </div>
  );
}

export default DesktopDashboard;