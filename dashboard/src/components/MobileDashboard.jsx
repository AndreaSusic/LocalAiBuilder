import { useState } from "react";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

export default function MobileDashboard() {
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);

  return (
    <div className="mobile-dashboard-wireframe">
      {/* Sticky Top Bar */}
      <header className="mobile-header-wireframe">
        <button className="hamburger-wireframe">☰</button>
        <button className="icon-btn-wireframe">🔔</button>
        <button className="small-btn-wireframe">Publish</button>
        <button 
          className="small-btn-wireframe"
          onClick={() => window.open("about:blank", "_blank")}
        >
          View Preview
        </button>
      </header>

      {/* Scrollable main content */}
      <div className="container-wireframe">
        {/* Versions Panel */}
        <div className="panel-wireframe versions-wireframe">
          <h2>Versions</h2>
          <ul>
            {versions.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>

        {/* Unified Command Chat Panel */}
        <div className="panel-wireframe">
          <UnifiedCommandChatPanel />
        </div>
      </div>
    </div>
  );
}