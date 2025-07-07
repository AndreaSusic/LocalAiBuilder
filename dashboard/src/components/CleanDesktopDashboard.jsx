import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";
import EditorPanel from "./EditorPanel";
import { injectFixedInlineEditor } from "./FixedInlineEditor";

// Clean inline editor injection
function injectCleanEditor(iframe) {
  try {
    console.log('🔧 Injecting clean inline editor...');
    
    setTimeout(() => {
      injectFixedInlineEditor(iframe);
      console.log('✅ Clean inline editor injected');
    }, 1000);
  } catch (error) {
    console.error('❌ Error injecting clean editor:', error);
  }
}

function CleanDesktopDashboard({ bootstrap }) {
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
        console.log('🔐 Sent auth status to iframe:', !!user);
      } else if (event.data.type === 'toolbarUpdate') {
        console.log('🔗 Toolbar update from iframe:', event.data.activeElement);
      } else if (event.data.type === 'historyUpdate') {
        console.log('📚 History update:', event.data);
      } else if (event.data.type === 'AI_CHAT_REQUEST') {
        setActiveTab('ai');
        setTimeout(() => {
          const chatInput = document.querySelector('.chat-input');
          if (chatInput) {
            chatInput.value = event.data.message || '';
            chatInput.focus();
          }
        }, 100);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [bootstrap]);

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    if (iframe && previewContent) {
      setTimeout(() => {
        injectCleanEditor(iframe);
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
          console.log('Created short URL for desktop preview:', window.location.origin + shortUrl);
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
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gridTemplateRows: '60px 1fr',
      height: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid #e0e0e0',
        background: '#ffffff'
      }}>
        {/* Left side buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-wireframe" onClick={() => navigate('/new')}>
            New Site
          </button>
          <button className="btn-wireframe" onClick={() => console.log('Save clicked')}>
            Save
          </button>
          {/* Undo/Redo buttons removed as requested */}
        </div>

        {/* Language and Device Switchers */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff'
            }}
          >
            <option value="EN">EN</option>
            <option value="SR">SR</option>
          </select>
          
          <select 
            value={currentDevice} 
            onChange={(e) => setCurrentDevice(e.target.value)}
            style={{
              padding: '5px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff'
            }}
          >
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-wireframe" onClick={() => showTemplatePreview()}>
              Visit Site
            </button>
            <button className="btn-wireframe" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
        padding: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
          Live Preview
        </h3>
        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {previewContent && (
            <iframe
              className="preview-iframe"
              src={previewContent}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              onLoad={handleIframeLoad}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Editor and Chat */}
      <div style={{
        borderLeft: '1px solid #e0e0e0',
        background: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button 
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} 
            onClick={() => setActiveTab('text')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'text' ? '#ffc000' : '#f5f5f5',
              color: activeTab === 'text' ? '#ffffff' : '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Text
          </button>
          <button 
            className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} 
            onClick={() => setActiveTab('media')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'media' ? '#ffc000' : '#f5f5f5',
              color: activeTab === 'media' ? '#ffffff' : '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Media
          </button>
          <button 
            className={`tab-btn ${activeTab === 'components' ? 'active' : ''}`} 
            onClick={() => setActiveTab('components')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'components' ? '#ffc000' : '#f5f5f5',
              color: activeTab === 'components' ? '#ffffff' : '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Components
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ai')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'ai' ? '#ffc000' : '#f5f5f5',
              color: activeTab === 'ai' ? '#ffffff' : '#666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            AI
          </button>
        </div>
        
        <div style={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
          {activeTab === 'text' && (
            <EditorPanel />
          )}
          {activeTab === 'media' && (
            <div style={{ padding: '20px' }}>
              <h4>Media Tools</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>
                  🖼️ Upload Image
                </button>
                <button style={{ padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>
                  🎥 Upload Video
                </button>
                <button style={{ padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>
                  ↔️↕️ Resize Media
                </button>
              </div>
            </div>
          )}
          {activeTab === 'components' && (
            <div style={{ padding: '20px' }}>
              <h4>Add Sections</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button style={{ 
                  padding: '12px', 
                  background: '#ffc000', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  + Hero Section
                </button>
                <button style={{ 
                  padding: '12px', 
                  background: '#ffc000', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  + Services
                </button>
                <button style={{ 
                  padding: '12px', 
                  background: '#ffc000', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  + About Us
                </button>
                <button style={{ 
                  padding: '12px', 
                  background: '#ffc000', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  + Contact
                </button>
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
      </div>

      <style jsx>{`
        .btn-wireframe {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #333;
          color: #333;
          cursor: pointer;
          font-size: 14px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .btn-wireframe:hover {
          background: #333;
          color: #ffffff;
        }
        
        .tab-btn:hover {
          background: #e0e0e0 !important;
        }
        
        .tab-btn.active:hover {
          background: #ffc000 !important;
        }
      `}</style>
    </div>
  );
}

export default CleanDesktopDashboard;