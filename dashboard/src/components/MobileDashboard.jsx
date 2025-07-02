import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

export default function MobileDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [previewContent, setPreviewContent] = useState(() => {
    // If bootstrap data exists, use short URL format
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      const encoded = encodeURIComponent(JSON.stringify(bootstrap));
      return `/t/v1?data=${encoded}`;
    }
    return '/t/v1';
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
            const userDataUrl = `/t/v1?data=${encoded}`;
            setPreviewContent(userDataUrl);
            console.log('Auto-loaded user data for mobile preview');
          }
        } catch (error) {
          console.log('Could not auto-load user data:', error.message);
          // Load demo data as fallback
          const demoUrl = `/t/v1`;
          setPreviewContent(demoUrl);
          console.log('Loaded demo template as fallback');
        }
      };
      
      loadUserData();
    }
  }, [bootstrap]);

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



  return (
    <div className="mobile-dashboard-wireframe">
      {/* Sticky Top Bar */}
      <header className="mobile-header-wireframe">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start'}}>
          <a href="/" className="mobile-logo-link">
            <img src="/logo.svg" alt="LocalAI Builder" className="mobile-dashboard-logo" />
          </a>
          <button className="icon-btn-wireframe">🔔</button>
          <button className="small-btn-wireframe">Publish</button>
          <button className="small-btn-wireframe" onClick={handleLogout}>Logout</button>
        </div>
        <div className="dropdown-wrapper">
          <button 
            className="small-btn-wireframe"
            onClick={() => setShowPagesDropdown(!showPagesDropdown)}
          >
            Pages ▼
          </button>
          {showPagesDropdown && (
            <div className="versions-dropdown">
              <div className="version-item" onClick={() => {
                showTemplatePreview('/templates/homepage/v1/index.jsx');
              }}>
                Homepage
              </div>
              <div className="version-item" onClick={() => {
                showTemplatePreview('/templates/service/v1/index.jsx');
              }}>
                Service
              </div>
              <div className="version-item" onClick={() => {
                showTemplatePreview('/templates/contact/v1/index.jsx');
              }}>
                Contact
              </div>
            </div>
          )}
        </div>

      </header>

      {/* Scrollable main content */}
      <div className="container-wireframe">
        {/* Live Preview */}
        <div className="panel-wireframe">
          <h2>Live Preview</h2>
          <div className="preview-mobile">
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
            className="view-live-btn-mobile" 
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
        <div className="panel-wireframe">
          <UnifiedCommandChatPanel />
        </div>
      </div>
    </div>
  );
}