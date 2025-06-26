import { useState } from "react";
import { EditorToolbar } from "./EditorToolbar";

export default function MobileDashboard() {
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [selectedTab, setTab] = useState("chat");
  const [draftChat, setChat] = useState("");

  const sendChat = () => {
    console.log("Send chat:", draftChat);
    setChat("");
  };

  const handleEditorAction = (action) => {
    console.log('Toolbar action:', action);
  };

  return (
    <div className="mobile-dashboard-wireframe">
      {/* Sticky Top Bar */}
      <header className="mobile-header-wireframe">
        <button className="hamburger-wireframe">☰</button>
        <button className="icon-btn-wireframe">🔔</button>
        <button className="small-btn-wireframe">Publish</button>
        <button 
          className="small-btn-wireframe"
          onClick={() => window.open("about:blank", "_blank")}
        >
          View Preview
        </button>
      </header>

      {/* Scrollable main content */}
      <div className="container-wireframe">
        {/* Versions Panel */}
        <div className="panel-wireframe versions-wireframe">
          <h2>Versions</h2>
          <ul>
            {versions.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>

        {/* Chat / Editor Panel with Tabs */}
        <div className="panel-wireframe">
          <h2>Chat / Editor</h2>
          <div className="tabs-wireframe">
            <button 
              className={selectedTab === "chat" ? "active" : ""}
              onClick={() => setTab("chat")}
            >
              Chat
            </button>
            <button 
              className={selectedTab === "editor" ? "active" : ""}
              onClick={() => setTab("editor")}
            >
              Editor
            </button>
          </div>
          <div className="tab-content-wireframe">
            <div className={`chat-wireframe ${selectedTab === "chat" ? "active" : ""}`}>
              <textarea 
                placeholder="Type your message…"
                value={draftChat}
                onChange={(e) => setChat(e.target.value)}
              />
              <button onClick={sendChat}>Send ➤</button>
            </div>
            <div className={`editor-wireframe ${selectedTab === "editor" ? "active" : ""}`}>
              <p><strong>Editor Controls</strong></p>
              <EditorToolbar onAction={handleEditorAction} />
              <p>– Text formatting<br/>
                 – Image & Video tools<br/>
                 – Component list…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}