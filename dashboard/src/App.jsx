import {useState} from "react";
import "./App.css";

/* ------------------------------------------------------------------ */
export default function App(){
  /* STATE */
  const [search,setSearch]   = useState("");
  const [versions]           = useState(["Version 1","Version 2","Version 3"]);
  const [selectedTab,setTab] = useState("text");
  const [draftChat,setChat]  = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /* HANDLERS */
  const sendChat   = () => { console.log("Chat:", draftChat); setChat(""); };
  const newSite    = () => console.log("New Site");
  const saveSite   = () => console.log("Save");
  const publish    = () => console.log("Publish");
  const openVer    = v  => console.log("Open",v);

  /* UI */
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* ---------------- TOP BAR ---------------- */}
      <div className="topBar">
        <div className="group">
          <span className="hamburger">☰</span>
          <strong>Logo</strong>
          <button className="btn" onClick={newSite}>New Site</button>
          <button className="btn" onClick={saveSite}>Save</button>
          <button className="btn" onClick={publish}>Publish</button>
        </div>

        <div className="group">
          <div className="usage">Basic Plan  3 / 10 q's</div>
          <button className="iconBtn">🛎️</button>
          <button className="iconBtn">❔</button>
        </div>

        <div className="group">
          <button className="btn">Sites ▼</button>
          <button className="btn">Pages ▼</button>
          <button className="btn">Profile ▼</button>
        </div>
      </div>

      {/* ---------------- GRID ---------------- */}
      <div className="grid">

        {/* Versions + Chat */}
        <div className="panel">
          <h2>Versions</h2>
          <input
            className="search"
            placeholder="Search versions…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <div className="versionsCards">
            {versions
              .filter(v=>v.toLowerCase().includes(search.toLowerCase()))
              .map(v=>(
                <div key={v} className="versionCard" onClick={()=>openVer(v)}>
                  {v}
                </div>
            ))}
          </div>
          <div className="chatBox">
            <textarea
              placeholder="Chat with AI…"
              value={draftChat}
              onChange={e=>setChat(e.target.value)}
            />
            <button className="btn" onClick={sendChat}>Send</button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="panel">
          <h2>Live Preview</h2>
          <div className="preview">
            <iframe title="preview" src="about:blank" />
          </div>
          <button className="btn" onClick={()=>console.log("View live")}>
            View Live Site
          </button>
        </div>

        {/* Editor */}
        <div className="panel">
          <h2>Edit Yourself</h2>
          <div className="unsaved">You have unsaved changes</div>

          <div className="tabs">
            <button className="tabBtn" onClick={()=>setTab("text")}>Text Editor</button>
            <button className="tabBtn" onClick={()=>setTab("media")}>Image & Video</button>
            <button className="tabBtn" onClick={()=>setTab("components")}>Components</button>
          </div>

          <div className="tabContent">
            {selectedTab==="text"       && <p>📝 Typography controls…</p>}
            {selectedTab==="media"      && <p>🖼️ Media upload / crop…</p>}
            {selectedTab==="components" && <p>📦 Component list…</p>}
          </div>
        </div>
      </div>

      {/* --- MOBILE FULL-SCREEN PREVIEW OVERLAY --- */}
      <button
        className="mobile-preview-btn"
        onClick={() => setIsPreviewOpen(true)}
      >
        View Preview
      </button>

      {isPreviewOpen && (
        <div className="preview-overlay">
          <button
            className="close-btn"
            onClick={() => setIsPreviewOpen(false)}
          >
            ×
          </button>
          <iframe
            src="about:blank"
            title="Full Preview"
            className="overlay-iframe"
          />
        </div>
      )}
    </div>
  );
}