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
    
    // Wait for iframe to fully load
    const injectScript = () => {
      // Inject editor bridge script
      const script = frameDoc.createElement('script');
      script.id = 'editor-bridge-script';
      script.src = '/editorBridge.js';
      
      script.onload = () => {
        console.log('✅ Editor bridge injected successfully');
        // Force initialization
        if (frameDoc.defaultView && frameDoc.defaultView.initEditorBridge) {
          frameDoc.defaultView.initEditorBridge();
        }
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to inject editor bridge:', error);
      };
      
      frameDoc.head.appendChild(script);
      
      // Also inject CSS for better styling
      const style = frameDoc.createElement('style');
      style.textContent = `
        .ez-editable-active {
          outline: 2px solid #007cff !important;
          outline-offset: 2px !important;
        }
        .ez-toolbar {
          z-index: 99999 !important;
        }
        .ez-element-delete {
          z-index: 100000 !important;
        }
      `;
      frameDoc.head.appendChild(style);
    };
    
    // Try to inject immediately, or wait for load
    if (frameDoc.readyState === 'complete') {
      injectScript();
    } else {
      iframe.addEventListener('load', injectScript);
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

export default function MobileDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
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
            console.log('Auto-loaded user data for mobile preview');
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
            console.log('Created short URL for mobile preview:', shortUrl);
            return;
          }
        } catch (error) {
          console.error('Error creating short URL for mobile preview:', error);
        }
      }
      
      // Fallback
      setPreviewContent('/t/v1');
    };
    
    createPreviewUrl();
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