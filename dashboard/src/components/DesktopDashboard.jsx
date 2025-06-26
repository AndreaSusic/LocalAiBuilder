import { useState } from "react";

export default function DesktopDashboard() {
  const [search, setSearch] = useState("");
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [selectedTab, setTab] = useState("text");
  const [draftChat, setChat] = useState("");

  const sendChat = () => {
    console.log("Send chat:", draftChat);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div className="logo">GoAISite</div>
        <div className="headerActions">
          <button className="btn">🔔</button>
          <button className="btn primary">Publish</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        {/* Left Panel: Versions + Chat */}
        <div className="panel">
          <h2>Versions</h2>
          <input
            type="text"
            placeholder="Search versions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="searchInput"
          />
          <div className="versionList">
            {versions.map((v, i) => (
              <div key={i} className="versionItem">
                {v}
              </div>
            ))}
          </div>

          <h2>Chat with AI</h2>
          <div className="chatArea">
            <textarea
              placeholder="Ask AI to modify your site..."
              value={draftChat}
              onChange={(e) => setChat(e.target.value)}
            />
            <button className="btn" onClick={sendChat}>
              Send
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="panel">
          <h2>Live Preview</h2>
          <div className="preview">
            <iframe title="preview" src="about:blank" />
          </div>
          <button
            className="view-live-btn"
            onClick={() => window.open("about:blank", "_blank")}
          >
            View Live Site
          </button>
        </div>

        {/* Editor */}
        <div className="panel editor">
          <h2>Edit Yourself</h2>
          <div className="unsaved">⚠️ Unsaved changes</div>
          <div className="tabs">
            {["text", "media", "components"].map((tab) => (
              <button
                key={tab}
                className={`tabBtn ${selectedTab === tab ? "active" : ""}`}
                onClick={() => setTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="tabContent">
            {selectedTab === "text" && <p>📝 Typography controls…</p>}
            {selectedTab === "media" && <p>🖼️ Media upload / crop…</p>}
            {selectedTab === "components" && <p>📦 Component list…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}