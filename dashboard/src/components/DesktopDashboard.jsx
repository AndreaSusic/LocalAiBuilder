import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

export default function DesktopDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [selectedTab, setTab] = useState("text");
  const [draftChat, setChat] = useState("");
  const [previewScreen, setPreviewScreen] = useState("desktop");

  /* HANDLERS */
  const sendChat = () => { console.log("Chat:", draftChat); setChat(""); };
  const newSite = () => console.log("New Site");
  const saveSite = () => console.log("Save");
  const publish = () => console.log("Publish");
  const openVer = v => {
    if (v === "Version 1") {
      navigate('/templates');
    } else {
      console.log("Open", v);
    }
  };
  const handleEditorAction = (action) => {
    console.log('Toolbar action:', action);
  };
  const switchPreviewScreen = () => {
    const screens = ["desktop", "tablet", "mobile"];
    const currentIndex = screens.indexOf(previewScreen);
    const nextIndex = (currentIndex + 1) % screens.length;
    setPreviewScreen(screens[nextIndex]);
    console.log('Preview screen:', screens[nextIndex]);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* ---------------- TOP BAR ---------------- */}
      <div className="topBar">
        <div className="group">
          <span className="hamburger">☰</span>
          <a href="/" className="logo-link">
            <img src="/logo.svg" alt="LocalAI Builder" className="dashboard-logo" />
          </a>
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
          <button className="btn preview-switcher" onClick={switchPreviewScreen}>
            {previewScreen === "desktop" && "🖥️ Desktop"}
            {previewScreen === "tablet" && "📱 Tablet"}
            {previewScreen === "mobile" && "📱 Mobile"}
          </button>
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
       
        </div>

        {/* Live Preview */}
        <div className="panel">
          <h2>Live Preview - {previewScreen}</h2>
          <div className={`preview preview-${previewScreen}`}>
            <iframe title="preview" src="about:blank" />
          </div>
          <button 
            className="view-live-btn" 
            onClick={() => window.open("about:blank", "_blank")}
          >
            View Live Site
          </button>
        </div>

        {/* Unified Command Chat Panel */}
        <UnifiedCommandChatPanel />
      </div>
    </div>
  );
}