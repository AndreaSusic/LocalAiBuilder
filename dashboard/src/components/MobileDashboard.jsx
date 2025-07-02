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
            const userDataUrl = `/templates/homepage/v1/index.jsx?data=${encoded}`;
            setPreviewContent(userDataUrl);
            console.log('Auto-loaded user data for mobile preview');
          }
        } catch (error) {
          console.log('Could not auto-load user data:', error.message);
          // Load demo data as fallback
          const demoUrl = `/templates/homepage/v1/index.jsx`;
          setPreviewContent(demoUrl);
          console.log('Loaded demo template as fallback');
        }
      };
      
      loadUserData();
    }
  }, [bootstrap]);

  const showTemplatePreview = (templateUrl) => {
    let fullUrl = templateUrl;
    // Add bootstrap data to URL if available
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      const encoded = encodeURIComponent(JSON.stringify(bootstrap));
      fullUrl += `?data=${encoded}`;
    }
    setPreviewContent(fullUrl);
    setShowPagesDropdown(false);
    console.log('Showing mobile template preview:', fullUrl);
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
            onClick={() => window.open(previewContent || "about:blank", "_blank")}
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