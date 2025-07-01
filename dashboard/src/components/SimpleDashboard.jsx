import { useState } from "react";

export default function SimpleDashboard() {
  const [previewContent, setPreviewContent] = useState('/templates/homepage/v1/index.jsx');
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [previewScreen, setPreviewScreen] = useState("desktop");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: 'Hi! I can help you customize your website. What would you like to change?' }
  ]);

  const showTemplatePreview = (templateUrl) => {
    setPreviewContent(templateUrl);
    setShowPagesDropdown(false);
  };

  const switchPreviewScreen = () => {
    const screens = ["desktop", "tablet", "mobile"];
    const currentIndex = screens.indexOf(previewScreen);
    const nextIndex = (currentIndex + 1) % screens.length;
    setPreviewScreen(screens[nextIndex]);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      { type: 'user', text: chatInput },
      { type: 'ai', text: 'I understand. Let me help you with that change.' }
    ]);
    setChatInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Bar */}
      <div className="topBar">
        <div className="group">
          <span className="hamburger">☰</span>
          <a href="/" className="logo-link">
            <img src="/api/logo.svg" alt="LocalAI Builder" className="dashboard-logo" />
          </a>
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
                left: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: "120px",
                zIndex: 1000
              }}>
                <div 
                  onClick={() => showTemplatePreview("/templates/homepage/v1/index.jsx")}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  Homepage
                </div>
                <div 
                  onClick={() => showTemplatePreview("/templates/service/v1/index.jsx")}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  Service
                </div>
                <div 
                  onClick={() => showTemplatePreview("/templates/contact/v1/index.jsx")}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Contact
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="group">
          <div className="preview-switcher">
            <span>Preview:</span>
            <button className="iconBtn" onClick={switchPreviewScreen}>
              {previewScreen === "desktop" ? "🖥️" : previewScreen === "tablet" ? "📱" : "📱"}
            </button>
          </div>
          <span className="usage">✨ 47 left</span>
          <button className="btn">Profile ▼</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Panel - Hidden for now */}
        <div className="leftPanel" style={{ display: "none" }}>
          <div className="panelHeader">Versions</div>
        </div>

        {/* Center Panel - Live Preview */}
        <div className="centerPanel">
          <div className="panelHeader">Live Preview - {previewScreen}</div>
          <div className="preview">
            <iframe 
              title="preview" 
              src={previewContent} 
              className="previewFrame"
            />
          </div>
          <div style={{ padding: "12px", borderTop: "1px solid #e9ecef" }}>
            <button 
              className="btn"
              onClick={() => window.open(previewContent, "_blank")}
            >
              View Live Site
            </button>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="rightPanel">
          <div className="panelHeader">Chat Assistant</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px" }}>
            {/* Chat Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              marginBottom: "12px",
              border: "1px solid #e9ecef",
              borderRadius: "6px",
              padding: "12px"
            }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  marginBottom: "12px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: msg.type === 'user' ? '#007bff' : '#f8f9fa',
                  color: msg.type === 'user' ? 'white' : '#333',
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {msg.text}
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask me to change something..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px"
                }}
              />
              <button onClick={sendChatMessage} className="btn">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}