import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Ultra-simple inline editor that just works
function injectSimpleEditor(iframe) {
  try {
    // Only inject editor for preview pages, not for direct template views
    const currentUrl = window.location.href;
    const isPreviewPage = currentUrl.includes('/preview') || currentUrl.includes('/dashboard');
    
    if (!isPreviewPage) {
      console.log('🚫 Skipping editor injection - not in preview context');
      return;
    }
    
    console.log('🔧 Injecting ultra-simple inline editor...');
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!frameDoc) {
      console.error('❌ Cannot access iframe document');
      return;
    }
    
    // Remove any existing editor scripts
    const existingScripts = frameDoc.querySelectorAll('[id*="editor"], [id*="bridge"]');
    existingScripts.forEach(script => script.remove());
    
    // Wait a bit for content to load, then inject the simplest possible editor
    setTimeout(() => {
      const script = frameDoc.createElement('script');
      script.id = 'simple-editor-script';
      script.innerHTML = `
        console.log('🚀 Simple inline editor starting...');
        
        // Wait for React components to render
        function setupEditableElements() {
          console.log('📝 Setting up editable elements...');
          
          // First check if any elements exist
          const allEditableElements = document.querySelectorAll('[data-edit]');
          console.log('Found', allEditableElements.length, 'elements with data-edit attributes');
          
          if (allEditableElements.length === 0) {
            console.log('❌ No editable elements found - React may not have finished rendering');
            return 0;
          }
          
          // First look for React components with data-edit attributes
          const dataEditElements = document.querySelectorAll('[data-edit]');
          console.log('Found', dataEditElements.length, 'elements with data-edit attributes');
          
          // If no data-edit elements, fall back to general text elements
          const textElements = dataEditElements.length > 0 ? 
            dataEditElements : 
            document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, td, th, div');
          
          console.log('Processing', textElements.length, 'elements total');
          
          // Test for specific elements
          const testElement = document.querySelector('.editable-test');
          const heroTitle = document.querySelector('[data-edit="heroTitle"]');
          console.log('Found test element:', !!testElement);
          console.log('Found heroTitle element:', !!heroTitle);
          
          if (heroTitle) {
            console.log('🎯 HERO TITLE FOUND:', heroTitle.textContent?.slice(0, 30), 'Tag:', heroTitle.tagName);
          }
          
          let editableCount = 0;
          
          textElements.forEach((element, index) => {
            // Skip elements that shouldn't be editable
            if (element.closest('script, style, head, meta') || 
                element.children.length > 0 || 
                !element.textContent || 
                element.textContent.trim().length === 0) {
              return;
            }
            
            console.log('Making editable:', element.tagName, element.textContent?.slice(0, 30));
            
            // Add hover effect
            element.addEventListener('mouseenter', () => {
              element.style.outline = '2px dashed #007cff';
              element.style.backgroundColor = 'rgba(0, 124, 255, 0.05)';
              element.style.cursor = 'pointer';
            });
            
            element.addEventListener('mouseleave', () => {
              if (element.contentEditable !== 'true') {
                element.style.outline = 'none';
                element.style.backgroundColor = 'transparent';
              }
            });
            
            // Click to edit
            element.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              console.log('✏️ Editing:', element.tagName, element.textContent?.slice(0, 30));
              
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
            
            // Stop editing on blur or Enter
            element.addEventListener('blur', () => {
              element.contentEditable = 'false';
              element.style.outline = 'none';
              element.style.backgroundColor = 'transparent';
              console.log('💾 Saved changes to:', element.tagName);
            });
            
            element.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
              }
              if (e.key === 'Escape') {
                element.blur();
              }
            });
            
            editableCount++;
          });
          
          console.log('✅ Made', editableCount, 'elements editable');
          return editableCount;
        }
        
        // Initialize only after React is ready
        let hasInitialized = false;
        
        // Listen for React ready event
        console.log('🎯 Setting up React DOM ready event listener...');
        window.addEventListener('react-dom-ready', (event) => {
          console.log('🔄 React DOM ready - re-scanning for editable elements', event);
          if (!hasInitialized) {
            const count = setupEditableElements();
            if (count > 0) {
              hasInitialized = true;
            }
          }
        });
        
        // Immediate check (in case React is already ready)
        setTimeout(() => {
          if (!hasInitialized) {
            console.log('🔄 Initial scan for editable elements');
            const count = setupEditableElements();
            if (count > 0) {
              hasInitialized = true;
            }
          }
        }, 500);
        
        // Fallback after longer delay
        setTimeout(() => {
          if (!hasInitialized) {
            console.log('🔄 Fallback scan - checking for React components');
            setupEditableElements();
          }
        }, 2000);
        
        // Also run after a longer delay as fallback
        setTimeout(setupEditableElements, 3000);
      `;
      
      frameDoc.head.appendChild(script);
      console.log('✅ Simple editor script injected');
      
    }, 1000); // Wait 1 second for iframe to load
    
  } catch (error) {
    console.error('❌ Simple editor setup failed:', error);
  }
}

export default function DesktopDashboard({ bootstrap }) {
  console.log('🖥️ DesktopDashboard component rendering');
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
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
          <button className="btn-primary" onClick={() => window.open('/', '_blank')}>
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