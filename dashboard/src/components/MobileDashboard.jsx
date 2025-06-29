import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

export default function MobileDashboard() {
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);

  return (
    <div className="mobile-dashboard-wireframe">
      {/* Sticky Top Bar */}
      <header className="mobile-header-wireframe">
        <button className="hamburger-wireframe">☰</button>
        <button className="icon-btn-wireframe">🔔</button>
        <button className="small-btn-wireframe">Publish</button>
        <a href="/" className="mobile-logo-link">
          <img src="/logo.svg" alt="LocalAI Builder" className="mobile-dashboard-logo" />
        </a>
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
                window.open('/templates/homepage/v1/index.jsx', '_blank');
                setShowPagesDropdown(false);
              }}>
                Homepage
              </div>
              <div className="version-item" onClick={() => {
                window.open('/templates/service/v1/index.jsx', '_blank');
                setShowPagesDropdown(false);
              }}>
                Service
              </div>
              <div className="version-item" onClick={() => {
                setShowPagesDropdown(false);
              }}>
                Contact
              </div>
            </div>
          )}
        </div>
        <button 
          className="small-btn-wireframe"
          onClick={() => window.open("about:blank", "_blank")}
        >
          View Preview
        </button>
      </header>

      {/* Scrollable main content */}
      <div className="container-wireframe">
        {/* Live Preview */}
        <div className="panel-wireframe">
          <h2>Live Preview</h2>
          <div className="preview-mobile">
            <iframe title="preview" src="about:blank" />
          </div>
          <button 
            className="view-live-btn-mobile" 
            onClick={() => window.open("about:blank", "_blank")}
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