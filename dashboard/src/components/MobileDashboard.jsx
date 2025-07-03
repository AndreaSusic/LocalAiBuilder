import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Fresh inline editor implementation (same as desktop)
function injectFreshEditor(iframe) {
  try {
    console.log('🔧 Starting completely fresh inline editor...');
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!frameDoc) {
      console.error('❌ Cannot access iframe document');
      return;
    }
    
    // Remove any existing editor scripts
    const existingScripts = frameDoc.querySelectorAll('[id*="editor"], [id*="bridge"]');
    existingScripts.forEach(script => script.remove());
    
    // Wait for iframe content to fully load
    setTimeout(() => {
      const script = frameDoc.createElement('script');
      script.id = 'fresh-editor-script';
      script.innerHTML = `
        console.log('🚀 Fresh inline editor starting...');
        
        // Find all elements with data-gas-edit attributes first, then fallback to general text elements
        const editableElements = document.querySelectorAll('[data-gas-edit]');
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li');
        console.log('📝 Found', editableElements.length, 'data-gas-edit elements');
        console.log('📝 Found', textElements.length, 'total text elements');
        
        let editableCount = 0;
        
        // Prioritize elements with data-gas-edit attributes
        const elementsToProcess = editableElements.length > 0 ? editableElements : textElements;
        console.log('🎯 Processing', elementsToProcess.length, 'elements for editing');
        
        elementsToProcess.forEach(element => {
          // Skip elements inside scripts, styles, or already processed
          if (element.closest('script, style, .editor-processed')) return;
          
          // Mark as processed
          element.classList.add('editor-processed');
          
          // Add visual feedback
          element.style.cursor = 'pointer';
          element.style.transition = 'all 0.2s ease';
          
          // Hover effect
          element.addEventListener('mouseenter', () => {
            element.style.outline = '2px dashed #007cff';
            element.style.backgroundColor = 'rgba(0, 124, 255, 0.05)';
          });
          
          element.addEventListener('mouseleave', () => {
            if (!element.isContentEditable || element.contentEditable === 'false') {
              element.style.outline = 'none';
              element.style.backgroundColor = 'transparent';
            }
          });
          
          // Click to edit
          element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('✏️ Editing element:', element.tagName, element.textContent?.slice(0, 30));
            
            // Make editable
            element.contentEditable = 'true';
            element.focus();
            element.style.outline = '2px solid #007cff';
            element.style.backgroundColor = 'rgba(0, 124, 255, 0.1)';
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          });
          
          // Stop editing on blur
          element.addEventListener('blur', () => {
            element.contentEditable = 'false';
            element.style.outline = 'none';
            element.style.backgroundColor = 'transparent';
            console.log('💾 Stopped editing:', element.tagName);
          });
          
          editableCount++;
        });
        
        console.log('✅ Made', editableCount, 'elements editable');
      `;
      
      frameDoc.head.appendChild(script);
      console.log('✅ Fresh editor script injected');
      
    }, 1000); // Wait 1 second for iframe to fully load
    
  } catch (error) {
    console.error('❌ Fresh editor setup failed:', error);
  }
}

export default function MobileDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  useEffect(() => {
    const createPreviewUrl = async () => {
      try {
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: bootstrap || {} })
        });
        const result = await response.json();
        const shortUrl = `/t/v1/${result.id}`;
        setPreviewContent(shortUrl);
        console.log('Created short URL for mobile preview:', shortUrl);
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
      // Inject fresh editor after iframe loads
      setTimeout(() => {
        injectFreshEditor(iframe);
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
      </header>

      {/* Scrollable main content */}
      <div className="container-wireframe">
        {/* Live Preview */}
        <div className="panel-wireframe">
          <h2>Live Preview</h2>
          <div className="preview-mobile">
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
            className="view-live-btn-mobile" 
            onClick={() => {
              if (previewContent) {
                window.open(previewContent, '_blank');
              }
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