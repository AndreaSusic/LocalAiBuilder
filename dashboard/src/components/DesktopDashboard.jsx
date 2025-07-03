import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject editor bridge into iframe for inline editing
function injectEditorBridge(iframe) {
  try {
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Check if bridge is already injected
    if (frameDoc.querySelector('#editor-bridge-script')) {
      return;
    }
    
    // Inject editor bridge script
    const script = frameDoc.createElement('script');
    script.id = 'editor-bridge-script';
    script.type = 'module';
    script.src = '/editorBridge.js';
    
    script.onload = () => {
      console.log('✅ Editor bridge injected successfully');
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to inject editor bridge:', error);
    };
    
    frameDoc.head.appendChild(script);
    
    // Listen for save messages from the iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'editor-save') {
        console.log('💾 Received edit from iframe:', event.data.data);
        // Here you can save the changes to your backend or state
      }
    });
    
  } catch (error) {
    console.error('❌ Could not inject editor bridge:', error);
  }
}

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
    // Use short URL approach for preview to avoid long URLs
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      // Try to create a short URL for preview
      return null; // Will be set by useEffect
    }
    return '/t/v1';
  });

  /* AUTO-LOAD USER DATA ON MOUNT AND CREATE SHORT URL FOR PREVIEW */
  useEffect(() => {
    const createPreviewUrl = async () => {
      let dataToUse = bootstrap;
      
      // If no bootstrap data, try to load user data
      if (!dataToUse || Object.keys(dataToUse).length === 0) {
        try {
          const response = await fetch('/api/user-data', {
            credentials: 'include'
          });
          if (response.ok) {
            dataToUse = await response.json();
            console.log('Auto-loaded user data for desktop preview');
          }
        } catch (error) {
          console.log('Could not auto-load user data:', error.message);
          setPreviewContent('/t/v1');
          return;
        }
      }
      
      // Create short URL for preview iframe
      if (dataToUse && Object.keys(dataToUse).length > 0) {
        try {
          const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
          
          const response = await fetch('/api/cache-preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: shortId, data: dataToUse })
          });
          
          if (response.ok) {
            const shortUrl = `/t/v1/${shortId}`;
            setPreviewContent(shortUrl);
            console.log('Created short URL for preview:', shortUrl);
            return;
          }
        } catch (error) {
          console.error('Error creating short URL for preview:', error);
        }
      }
      
      // Fallback
      setPreviewContent('/t/v1');
    };
    
    createPreviewUrl();
  }, [bootstrap]);

  /* HANDLERS */
  const sendChat = () => { console.log("Chat:", draftChat); setChat(""); };
  const newSite = () => console.log("New Site");
  const saveSite = () => console.log("Save");
  const publish = () => console.log("Publish");

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

  const showTemplatePreview = async (templateUrl) => {
    // Generate a short URL with cached data
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      try {
        // Generate short code for the bootstrap data
        const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Cache the data on the server
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: shortId, data: bootstrap })
        });
        
        if (response.ok) {
          const shortUrl = `/t/v1/${shortId}`;
          window.open(shortUrl, '_blank');
          setShowPagesDropdown(false);
          console.log('Opening template with short URL:', shortUrl);
          return;
        }
      } catch (error) {
        console.error('Error creating short URL:', error);
      }
    }
    
    // Fallback: open without data
    window.open('/t/v1/demo', '_blank');
    setShowPagesDropdown(false);
  };

  const handleLogout = async () => {
    try {
      // Use the correct logout endpoint
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/logout';
    }
  };

  // Handle undo/redo actions from iframe
  const handleUndo = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'undo' }, '*');
    }
  };

  const handleRedo = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'redo' }, '*');
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
          <button className="btn" onClick={handleUndo} title="Undo (Ctrl+Z)">↶</button>
          <button className="btn" onClick={handleRedo} title="Redo (Ctrl+Y)">↷</button>
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
              ref={(iframe) => {
                if (iframe && iframe.src !== "about:blank") {
                  iframe.onload = () => injectEditorBridge(iframe);
                }
              }}
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
            onClick={async () => {
              // Generate a short URL with cached data
              if (bootstrap && Object.keys(bootstrap).length > 0) {
                try {
                  const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                  
                  const response = await fetch('/api/cache-preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: shortId, data: bootstrap })
                  });
                  
                  if (response.ok) {
                    window.open(`/t/v1/${shortId}`, '_blank');
                    return;
                  }
                } catch (error) {
                  console.error('Error creating short URL:', error);
                }
              }
              
              // Fallback
              window.open('/t/v1/demo', '_blank');
            }}
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