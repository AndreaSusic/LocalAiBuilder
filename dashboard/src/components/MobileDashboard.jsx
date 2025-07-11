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
        
        // Wait a moment for DOM to be ready
        setTimeout(() => {
          console.log('📝 Making all text elements editable...');
          
          // Look for our test element first, then all text elements
          const testElement = document.querySelector('.editable-test');
          const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, td, th, div');
          console.log('Found test element:', !!testElement);
          console.log('Found', textElements.length, 'text elements');
          
          if (testElement) {
            console.log('🎯 TEST ELEMENT FOUND:', testElement.tagName, testElement.textContent?.slice(0, 30));
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
          
          console.log('⚠️ MobileDashboard editor DISABLED to prevent duplicate × buttons');
          return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
          
        }, 2000); // Wait 2 seconds for everything to load
      `;
      
      // DISABLED: frameDoc.head.appendChild(script); // Preventing duplicate editor systems
      console.log('🔧 MobileDashboard editor injection DISABLED to prevent double delete buttons');
      console.log('✅ Simple editor script injected');
      
    }, 1000); // Wait 1 second for iframe to load
    
  } catch (error) {
    console.error('❌ Simple editor setup failed:', error);
  }
}

export default function MobileDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [versions] = useState(["Version 1", "Version 2", "Version 3"]);
  const [showVersions, setShowVersions] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Kigen Plastika page instead of template
    setPreviewContent('/frozen-ui-v1/');
    console.log('✅ Mobile dashboard loading Kigen Plastika page');
    
    const checkAuth = async () => {
      try {
        // Dashboard users get auto-authentication for editing features
        setUser({ 
          name: 'Dashboard User', 
          email: 'dashboard@localai.dev',
          isDashboardUser: true 
        });
        console.log('✅ Mobile dashboard user auto-authenticated for editing');
      } catch (error) {
        console.error('Auth setup failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="mobile-dashboard-wireframe">
      {/* Sticky Top Bar */}
      <header className="mobile-header-wireframe">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start'}}>
          <a href="/" className="mobile-logo-link">
            <img src="https://840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv.picard.replit.dev/assets/logo-transparent.png" alt="LocalAI Builder" className="mobile-dashboard-logo" />
          </a>
          <button className="icon-btn-wireframe">🔔</button>
          <button className="small-btn-wireframe">Publish</button>
          {user && user.isDashboardUser ? (
            <button className="small-btn-wireframe" onClick={handleLogout}>Logout</button>
          ) : (
            <a href="/auth/google" className="small-btn-wireframe">Login</a>
          )}
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