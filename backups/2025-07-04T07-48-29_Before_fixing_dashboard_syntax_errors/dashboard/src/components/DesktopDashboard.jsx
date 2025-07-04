import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject the framework-agnostic inline editor
function injectSimpleEditor(iframe) {
  try {
    console.log('🔧 Injecting framework-agnostic inline editor...');
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!frameDoc) {
      console.error('❌ Cannot access iframe document');
      return;
    }
    
    // Remove any existing editor scripts
    const existingScripts = frameDoc.querySelectorAll('[id*="editor"], [id*="bridge"]');
    existingScripts.forEach(script => script.remove());
    
    // Wait for content to load, then inject the proper editor bridge
    setTimeout(() => {
      const script = frameDoc.createElement('script');
      script.id = 'editor-bridge-script';
      script.type = 'module';
      script.src = '/editorBridge.js';
      frameDoc.head.appendChild(script);
      
      console.log('✅ Editor bridge script injected');
    }, 1000);
  } catch (error) {
    console.error('❌ Error injecting editor:', error);
  }
}

function DesktopDashboard({ bootstrap }) {
}

export default function DesktopDashboard({ bootstrap }) {
  console.log('🖥️ DesktopDashboard component rendering');
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [currentDevice, setCurrentDevice] = useState('Desktop');
  const [previewContent, setPreviewContent] = useState(null);

  useEffect(() => {
    const createPreviewUrl = async () => {
      try {
        // Generate a unique ID for the preview
        const id = Math.random().toString(36).substr(2, 9);
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, data: bootstrap || {} })
        });
        const result = await response.json();
        const shortUrl = `/t/v1/${id}`;
        setPreviewContent(shortUrl);
        console.log('Created short URL for desktop preview:', shortUrl);
      } catch (error) {
        console.error('Failed to create preview URL:', error);
        setPreviewContent('/t/v1');
      }
    };

    createPreviewUrl();
  }, [bootstrap]);

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    if (iframe && previewContent) {
      // Inject simple editor after iframe loads
      setTimeout(() => {
        injectSimpleEditor(iframe);
      }, 500);
    }
  };

  const handleLogout = async () => {
    try {
      window.location.href = '/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/logout';
    }
  };

  const showTemplatePreview = async (templateUrl) => {
    if (bootstrap && Object.keys(bootstrap).length > 0) {
      try {
        const shortId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: shortId, data: bootstrap })
        });
        
        if (response.ok) {
          const shortUrl = `/t/v1/${shortId}`;
          window.open(shortUrl, '_blank');
          return;
        }
      } catch (error) {
        console.error('Error creating short URL:', error);
      }
    }
    
    window.open('/t/v1/demo', '_blank');
  };

  return (
    <div className="dashboard-wireframe">
      {/* Header */}
      <header className="header-wireframe">
        <div className="logo-section">
          <a href="/" className="logo-link">
            <img src="/logo.svg" alt="LocalAI Builder" className="dashboard-logo" />
          </a>
        </div>
        
        {/* Main Action Buttons */}
        <div className="header-center">
          <button className="btn-wireframe" onClick={() => window.open('/', '_blank')}>
            + New Site
          </button>
          <button className="btn-wireframe" onClick={() => console.log('Save clicked')}>
            Save
          </button>
          <button className="btn-wireframe" onClick={() => window.postMessage({type: 'undo'}, '*')}>
            ↶ Undo
          </button>
          <button className="btn-wireframe" onClick={() => window.postMessage({type: 'redo'}, '*')}>
            ↷ Redo
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="header-actions">
          <div className="credits-info">
            <span className="credits-label">Credits remaining: <strong>25</strong></span>
          </div>
          
          {/* Language Dropdown */}
          <div className="dropdown-wrapper">
            <button 
              className="btn-wireframe"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              {currentLanguage} ▼
            </button>
            {showLanguageDropdown && (
              <div className="versions-dropdown">
                <div className="version-item" onClick={() => {setCurrentLanguage('EN'); setShowLanguageDropdown(false);}}>
                  English
                </div>
                <div className="version-item" onClick={() => {setCurrentLanguage('SR'); setShowLanguageDropdown(false);}}>
                  Srpski
                </div>
              </div>
            )}
          </div>

          {/* Device Switcher */}
          <div className="dropdown-wrapper">
            <button 
              className="btn-wireframe"
              onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
            >
              {currentDevice} ▼
            </button>
            {showDeviceDropdown && (
              <div className="versions-dropdown">
                <div className="version-item" onClick={() => {setCurrentDevice('Desktop'); setShowDeviceDropdown(false);}}>
                  🖥️ Desktop
                </div>
                <div className="version-item" onClick={() => {setCurrentDevice('Tablet'); setShowDeviceDropdown(false);}}>
                  📱 Tablet
                </div>
                <div className="version-item" onClick={() => {setCurrentDevice('Mobile'); setShowDeviceDropdown(false);}}>
                  📱 Mobile
                </div>
              </div>
            )}
          </div>
          
          <div className="dropdown-wrapper">
            <button 
              className="btn-wireframe"
              onClick={() => setShowPagesDropdown(!showPagesDropdown)}
            >
              Pages ▼
            </button>
            {showPagesDropdown && (
              <div className="versions-dropdown">
                <div className="version-item" onClick={() => showTemplatePreview('/templates/homepage/v1/index.jsx')}>
                  Homepage
                </div>
                <div className="version-item" onClick={() => showTemplatePreview('/templates/service/v1/index.jsx')}>
                  Service
                </div>
                <div className="version-item" onClick={() => showTemplatePreview('/templates/contact/v1/index.jsx')}>
                  Contact
                </div>
              </div>
            )}
          </div>
          <button className="btn-wireframe">🔔</button>
          <button className="btn-wireframe">Publish</button>
          <button className="btn-wireframe" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content-wireframe">
        {/* Live Preview */}
        <div className="left-panel-wireframe">
          <h2>Live Preview</h2>
          <div className="preview-frame">
            {previewContent && (
              <iframe 
                title="preview" 
                src={previewContent}
                onLoad={handleIframeLoad}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none"
                }}
              />
            )}
          </div>
          <button 
            className="view-live-btn" 
            onClick={() => {
              if (previewContent) {
                window.open(previewContent, '_blank');
              }
            }}
          >
            View Live Site
          </button>
        </div>

        {/* Command Chat Panel */}
        <div className="right-panel-wireframe">
          <UnifiedCommandChatPanel />
        </div>
      </div>
    </div>
  );
}