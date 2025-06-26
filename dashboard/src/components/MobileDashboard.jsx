import { useState } from "react";

export default function MobileDashboard() {
  const [search, setSearch] = useState("");
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [selectedTab, setTab] = useState("chat");
  const [draftChat, setChat] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sendChat = () => {
    console.log("Send chat:", draftChat);
  };

  return (
    <div className="mobile-dashboard">
      {/* Sticky Top Bar */}
      <div className="mobile-header">
        <button 
          className="hamburger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
        <div className="mobile-logo">GoAISite</div>
        <div className="mobile-actions">
          <button className="mobile-btn">🔔</button>
          <button className="mobile-btn primary">Publish</button>
          <button 
            className="mobile-btn"
            onClick={() => window.open("about:blank", "_blank")}
          >
            View Preview
          </button>
        </div>
      </div>

      {/* Versions Panel (toggleable) */}
      {isMenuOpen && (
        <div className="mobile-versions-panel">
          <h3>Versions</h3>
          <input
            type="text"
            placeholder="Search versions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mobile-search-input"
          />
          <div className="mobile-version-list">
            {versions.map((v, i) => (
              <div key={i} className="mobile-version-item">
                {v}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed Chat / Editor Panel */}
      <div className="mobile-content">
        <div className="mobile-tabs">
          <button
            className={`mobile-tab-btn ${selectedTab === "chat" ? "active" : ""}`}
            onClick={() => setTab("chat")}
          >
            Chat
          </button>
          <button
            className={`mobile-tab-btn ${selectedTab === "editor" ? "active" : ""}`}
            onClick={() => setTab("editor")}
          >
            Editor
          </button>
        </div>

        <div className="mobile-tab-content">
          {selectedTab === "chat" && (
            <div className="mobile-chat-area">
              <h3>Chat with AI</h3>
              <textarea
                placeholder="Ask AI to modify your site..."
                value={draftChat}
                onChange={(e) => setChat(e.target.value)}
                className="mobile-chat-input"
              />
              <button className="mobile-send-btn" onClick={sendChat}>
                Send
              </button>
            </div>
          )}

          {selectedTab === "editor" && (
            <div className="mobile-editor-area">
              <h3>Edit Yourself</h3>
              <div className="mobile-unsaved">⚠️ Unsaved changes</div>
              <div className="mobile-editor-tabs">
                {["text", "media", "components"].map((tab) => (
                  <button key={tab} className="mobile-editor-tab-btn">
                    {tab}
                  </button>
                ))}
              </div>
              <div className="mobile-editor-content">
                <p>📝 Editor controls for mobile...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}