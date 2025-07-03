import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject editor bridge into iframe for inline editing
function injectEditorBridge(iframe) {
  try {
    console.log('🔧 Attempting to inject editor bridge...');
    
    // Check iframe access
    if (!iframe) {
      console.error('❌ No iframe provided');
      return;
    }
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    if (!frameDoc) {
      console.error('❌ Cannot access iframe document - CORS issue?');
      return;
    }
    
    console.log('✅ Successfully accessed iframe document');
    
    // Check if bridge is already injected
    if (frameDoc.querySelector('#editor-bridge-script')) {
      console.log('⚠️ Editor bridge already injected');
      return;
    }
    
    // Load the existing editorBridge.js file instead of inline script
    const script = frameDoc.createElement('script');
    script.id = 'editor-bridge-script';
    script.type = 'module';
    script.src = '/editorBridge.js';
    script.onload = () => {
      console.log('✅ External editorBridge.js loaded successfully');
      // Initialize the bridge after the script loads
      if (frameDoc.defaultView.initEditorBridge) {
        frameDoc.defaultView.initEditorBridge();
      }
    };
    script.onerror = () => {
      console.error('❌ Failed to load external editorBridge.js');
    };
    
    console.log('📄 Appending script to iframe head...');
    frameDoc.head.appendChild(script);
    console.log('✅ Script successfully added to iframe');
    
    // Verify script was added
    const addedScript = frameDoc.querySelector('#editor-bridge-script');
    if (addedScript) {
      console.log('✅ Script element found in iframe DOM');
    } else {
      console.error('❌ Script element not found after adding');
    }
    
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

      // Create short URL for preview
      if (dataToUse && Object.keys(dataToUse).length > 0) {
        try {
          const response = await fetch('/api/cache-preview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToUse),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Created short URL for preview:', result.url);
            setPreviewContent(result.url);
          } else {
            console.log('Failed to create short URL, using default');
            setPreviewContent('/t/v1');
          }
        } catch (error) {
          console.log('Error creating short URL:', error.message);
          setPreviewContent('/t/v1');
        }
      } else {
        setPreviewContent('/t/v1');
      }
    };

    createPreviewUrl();
  }, [bootstrap]);

  const handlePreviewVersion = (version) => {
    // Navigate to different template versions
    const versionMap = {
      "Version 1": "/templates/homepage/v1/index.jsx",
      "Version 2": "/templates/homepage/v2/index.jsx", 
      "Version 3": "/templates/homepage/v3/index.jsx"
    };
    
    const targetUrl = versionMap[version];
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle iframe load to inject editor bridge
  const handleIframeLoad = (iframe) => {
    if (iframe) {
      // Small delay to ensure iframe content is fully loaded
      setTimeout(() => {
        injectEditorBridge(iframe);
      }, 500);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#ffc000"/>
              <path d="M8 12h16v8H8z" fill="white"/>
              <circle cx="12" cy="16" r="2" fill="#ffc000"/>
              <circle cx="20" cy="16" r="2" fill="#ffc000"/>
            </svg>
            <span>GoAISite</span>
          </div>

          <nav className="nav-tabs">
            <div className="pages-dropdown">
              <button 
                className="dropdown-btn"
                onClick={() => setShowPagesDropdown(!showPagesDropdown)}
              >
                Pages ▼
              </button>
              {showPagesDropdown && (
                <div className="dropdown-menu">
                  <a href="/templates/homepage/v1/index.jsx" target="_blank">Homepage</a>
                  <a href="/service/invisalign" target="_blank">Service Page</a>
                  <a href="/templates/contact/v1/index.jsx" target="_blank">Contact</a>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="header-right">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="profile-dropdown">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              Profile ▼
            </button>
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Left Sidebar - Versions */}
        <aside className="versions-sidebar">
          <h3>Templates</h3>
          <div className="version-list">
            {versions.map((version, index) => (
              <div key={version} className="version-card">
                <h4>{version}</h4>
                <div className="version-preview">
                  <div className="preview-placeholder">
                    Template {index + 1}
                  </div>
                </div>
                <button 
                  className="view-btn"
                  onClick={() => handlePreviewVersion(version)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Center - Live Preview */}
        <main className="live-preview">
          <div className="preview-header">
            <h2>Live Preview</h2>
            <div className="preview-controls">
              <button 
                className={previewScreen === "desktop" ? "active" : ""}
                onClick={() => setPreviewScreen("desktop")}
              >
                🖥 Desktop
              </button>
              <button 
                className={previewScreen === "mobile" ? "active" : ""}
                onClick={() => setPreviewScreen("mobile")}
              >
                📱 Mobile
              </button>
            </div>
          </div>
          
          <div className={`preview-frame ${previewScreen}`}>
            {previewContent && (
              <iframe
                src={previewContent}
                onLoad={(e) => handleIframeLoad(e.target)}
                title="Website Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
            )}
          </div>
        </main>

        {/* Right Sidebar - Chat */}
        <aside className="chat-sidebar">
          <UnifiedCommandChatPanel />
        </aside>
      </div>
    </div>
  );
}