import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

export default function DesktopDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [selectedTab, setTab] = useState("text");
  const [draftChat, setChat] = useState("");
  const [previewScreen, setPreviewScreen] = useState("desktop");
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [previewContent, setPreviewContent] = useState(() => {
    // If bootstrap data exists, encode it for the template URL
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      const encoded = encodeURIComponent(JSON.stringify(bootstrap));
      return `/templates/homepage/v1/index.jsx?data=${encoded}`;
    }
    return '/templates/homepage/v1/index.jsx';
  });

  /* AUTO-LOAD USER DATA ON MOUNT */
  useEffect(() => {
    // Only auto-load if no bootstrap data was provided
    if (!bootstrap || Object.keys(bootstrap).length === 0) {
      const loadUserData = async () => {
        try {
          const response = await fetch('/api/user-data', {
            credentials: 'include'
          });
          if (response.ok) {
            const userData = await response.json();
            const encoded = encodeURIComponent(JSON.stringify(userData));
            const userDataUrl = `/templates/homepage/v1/index.jsx?data=${encoded}`;
            setPreviewContent(userDataUrl);
            console.log('Auto-loaded user data for desktop preview');
          }
        } catch (error) {
          console.log('Could not auto-load user data:', error.message);
        }
      };
      
      loadUserData();
    }
  }, [bootstrap]);

  /* HANDLERS */
  const sendChat = () => { console.log("Chat:", draftChat); setChat(""); };
  const newSite = () => console.log("New Site");
  const saveSite = () => console.log("Save");
  const publish = () => console.log("Publish");
  const loadTestData = async () => {
    try {
      const response = await fetch('/api/test-data');
      if (response.ok) {
        const testData = await response.json();
        const encoded = encodeURIComponent(JSON.stringify(testData));
        const testUrl = `/templates/homepage/v1/index.jsx?data=${encoded}`;
        setPreviewContent(testUrl);
        console.log('Loaded test data for preview');
      }
    } catch (error) {
      console.error('Failed to load test data:', error);
    }
  };
  const openVer = v => {
    let baseUrl = '';
    if (v === "Version 1") {
      baseUrl = '/templates/homepage/v1/index.jsx';
    } else if (v === "Version 2") {
      baseUrl = '/templates/homepage/v2/index.jsx'; 
    } else if (v === "Version 3") {
      baseUrl = '/templates/homepage/v3/index.jsx';
    }
    
    // Add bootstrap data to URL if available
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      const encoded = encodeURIComponent(JSON.stringify(bootstrap));
      baseUrl += `?data=${encoded}`;
    }
    
    window.open(baseUrl, '_blank');
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

  const showTemplatePreview = (templateUrl) => {
    let fullUrl = templateUrl;
    // Add bootstrap data to URL if available
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      const encoded = encodeURIComponent(JSON.stringify(bootstrap));
      fullUrl += `?data=${encoded}`;
    }
    setPreviewContent(fullUrl);
    setShowPagesDropdown(false);
    console.log('Showing template preview:', fullUrl);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', { method: 'GET' });
      if (response.ok) {
        window.location.href = '/';
      } else {
        // Fallback to direct redirect
        window.location.href = '/logout';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/logout';
    }
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
          <button className="btn" onClick={loadTestData} style={{background: '#ff6b6b', color: 'white'}}>Load Test Data</button>
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
                right: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minWidth: "120px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div 
                  onClick={() => showTemplatePreview("/templates/homepage/v1/index.jsx")}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Homepage
                </div>
                <div 
                  onClick={() => showTemplatePreview("/templates/service/v1/index.jsx")}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Service
                </div>
                <div 
                  onClick={() => showTemplatePreview("/templates/contact/v1/index.jsx")}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Contact
                </div>
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button 
              className="btn" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minWidth: "120px",
                zIndex: 1000,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <div 
                  onClick={handleLogout}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#333",
                    cursor: "pointer"
                  }}
                  onMouseOver={e => e.target.style.background = "#f5f5f5"}
                  onMouseOut={e => e.target.style.background = "white"}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- GRID ---------------- */}
      <div className="grid">

        {/* Versions + Chat */}
        <div className="panel" style={{ display: "none" }}>
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
            <iframe 
              title="preview" 
              src={previewContent || "about:blank"} 
              style={{
                width: "100%",
                height: "100%",
                border: "none"
              }}
            />
          </div>
          <button 
            className="view-live-btn" 
            onClick={() => window.open(previewContent || "about:blank", "_blank")}
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