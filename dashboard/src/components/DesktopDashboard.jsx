import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject editor bridge into iframe for inline editing
function injectEditorBridge(iframe) {
  try {
    console.log('🔧 Attempting to inject editor bridge...');
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Check if bridge is already injected
    if (frameDoc.querySelector('#editor-bridge-script')) {
      console.log('⚠️ Editor bridge already injected');
      return;
    }
    
    // Inject simplified editor bridge script
    const script = frameDoc.createElement('script');
    script.id = 'editor-bridge-script';
    script.innerHTML = `
      console.log('✅ Editor bridge script injected successfully');
      
      try {
        // Simple editor bridge functionality
        console.log('🔧 Initializing NEW UPDATED inline editor bridge v2.0...');
        
        // Find all text elements immediately (no waiting)
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, figcaption, blockquote, a, button');
        console.log('🔍 Found', elements.length, 'potential editable elements');
        
        let editableCount = 0;
        
        elements.forEach((element, index) => {
          // Very simple filtering
          if (element.closest('script') || element.closest('style')) {
            return;
          }
          
          console.log('✅ Making element editable:', element.tagName, element.textContent?.substring(0, 30));
          
          // Add editable functionality
          element.style.cursor = 'pointer';
          element.setAttribute('data-editable', 'true');
          editableCount++;
          
          // Click to edit
          element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Element clicked for editing:', element.tagName);
            
            // Make editable
            element.contentEditable = 'true';
            element.focus();
            element.style.outline = '2px solid #007cff';
            element.style.backgroundColor = 'rgba(0, 124, 255, 0.05)';
          });
          
          // Hover effects
          element.addEventListener('mouseenter', function() {
            if (element.contentEditable !== 'true') {
              element.style.outline = '2px dashed #007cff';
            }
          });
          
          element.addEventListener('mouseleave', function() {
            if (element.contentEditable !== 'true') {
              element.style.outline = 'none';
            }
          });
          
          // Stop editing on blur
          element.addEventListener('blur', function() {
            element.contentEditable = 'false';
            element.style.outline = 'none';
            element.style.backgroundColor = '';
            console.log('💾 Element editing stopped:', element.tagName);
          });
        });
        
        console.log('✅ Made', editableCount, 'elements editable');
        
      } catch (error) {
        console.error('❌ Editor bridge error:', error);
      }
    `;
    
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