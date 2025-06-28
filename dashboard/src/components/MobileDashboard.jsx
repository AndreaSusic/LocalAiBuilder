import { useState } from "react";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

export default function MobileDashboard() {
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);

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
            onClick={() => setShowVersions(!showVersions)}
          >
            Versions ▼
          </button>
          {showVersions && (
            <div className="versions-dropdown">
              {versions.map((v, i) => (
                <div key={i} className="version-item" onClick={() => {
                  if (v === "Version 1") {
                    window.location.href = '/templates/homepage-1';
                  } else {
                    console.log("Selected version:", v);
                  }
                  setShowVersions(false);
                }}>
                  {v}
                </div>
              ))}
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