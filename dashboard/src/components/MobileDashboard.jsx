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
    
    // Inject editor bridge script inline to avoid cross-origin issues
    const script = frameDoc.createElement('script');
    script.id = 'editor-bridge-script';
    script.innerHTML = `
      console.log('✅ Mobile Editor bridge injected successfully as inline script');
      
      // Enhanced editor bridge functionality with React component support
      window.initEditorBridge = function() {
        console.log('🔧 Initializing enhanced editor bridge...');
        
        // Wait for React components to fully render with more patience
        function waitForReactComponents() {
          return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // Wait up to 5 seconds
            
            const checkForElements = () => {
              console.log('🔍 Checking for React components, attempt:', attempts + 1);
              
              // Look for specific React component classes that should be in our template
              const heroSection = document.querySelector('.hero-section, .hero, [class*="hero"]');
              const servicesSection = document.querySelector('.services-section, .services, [class*="service"]');
              const aboutSection = document.querySelector('.about-section, .about, [class*="about"]');
              const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, figcaption, blockquote, a, button');
              
              console.log('🔍 Found elements:', {
                heroSection: !!heroSection,
                servicesSection: !!servicesSection,
                aboutSection: !!aboutSection,
                textElements: textElements.length
              });
              
              // Check if we have the essential React components rendered
              if ((heroSection || servicesSection || aboutSection) && textElements.length > 10) {
                console.log('✅ React components detected, proceeding with editor setup');
                resolve();
              } else if (attempts >= maxAttempts) {
                console.log('⚠️ Max attempts reached, proceeding anyway');
                resolve();
              } else {
                attempts++;
                setTimeout(checkForElements, 100);
              }
            };
            
            // Start checking immediately
            checkForElements();
          });
        }
        
        waitForReactComponents().then(() => {
          // Enhanced element selection with React component awareness
          const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, figcaption, blockquote, a, button');
          
          let editableCount = 0;
          
          elements.forEach(element => {
            // Skip elements that shouldn't be editable
            if (element.closest('[contenteditable="false"]') || 
                element.closest('script') ||
                element.closest('style') ||
                element.closest('nav') ||
                element.closest('header') ||
                element.closest('.navbar') ||
                element.closest('.toolbar') ||
                element.querySelector('script, style, svg') ||
                !element.textContent.trim() ||
                element.textContent.trim().length < 2) {
              return;
            }
            
            // Add editable functionality
            element.style.cursor = 'pointer';
            element.style.transition = 'all 0.2s ease';
            element.setAttribute('data-editable', 'true');
            editableCount++;
            
            // Click handler for editing
            element.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              // Deactivate other elements
              document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                if (el !== element) {
                  el.contentEditable = 'false';
                  el.style.outline = 'none';
                  el.style.backgroundColor = '';
                }
              });
              
              // Make element editable
              element.contentEditable = 'true';
              element.focus();
              
              // Add visual feedback
              element.style.outline = '2px solid #007cff';
              element.style.backgroundColor = 'rgba(0, 124, 255, 0.05)';
              
              // Select all text
              const range = document.createRange();
              range.selectNodeContents(element);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
            });
            
            // Blur handler to stop editing
            element.addEventListener('blur', function() {
              element.contentEditable = 'false';
              element.style.outline = 'none';
              element.style.backgroundColor = '';
              
              // Send changes to parent
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'editor-save',
                  data: {
                    element: element.tagName,
                    content: element.innerHTML,
                    text: element.textContent,
                    id: element.id || null,
                    className: element.className || null
                  }
                }, '*');
              }
            });
            
            // Enhanced hover effects
            element.addEventListener('mouseenter', function() {
              if (element.contentEditable !== 'true') {
                element.style.outline = '2px dashed #007cff';
                element.style.outlineOffset = '2px';
              }
            });
            
            element.addEventListener('mouseleave', function() {
              if (element.contentEditable !== 'true') {
                element.style.outline = 'none';
                element.style.outlineOffset = '0px';
              }
            });
            
            // Handle Enter key
            element.addEventListener('keydown', function(e) {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
              }
              if (e.key === 'Escape') {
                element.blur();
              }
            });
          });
          
          console.log('✅ Made ' + editableCount + ' elements editable out of ' + elements.length + ' total elements');
          
          // Add global click handler to deactivate editing
          document.addEventListener('click', function(e) {
            if (!e.target.closest('[data-editable="true"]')) {
              document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.contentEditable = 'false';
                el.style.outline = 'none';
                el.style.backgroundColor = '';
              });
            }
          });
        });
      };
      
      // Initialize when DOM is ready with additional delay for React components
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          setTimeout(window.initEditorBridge, 2000);
        });
      } else {
        setTimeout(window.initEditorBridge, 2000);
      }
    `;
    
    frameDoc.head.appendChild(script);
    
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