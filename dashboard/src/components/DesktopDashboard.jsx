import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Fresh inline editor implementation
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

export default function DesktopDashboard() {
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Create short URL for preview
    const generatePreview = async () => {
      try {
        const response = await fetch('/api/cache-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: {} })
        });
        const result = await response.json();
        const shortUrl = `/t/v1/${result.id}`;
        setPreviewUrl(shortUrl);
        console.log('Created short URL for preview:', shortUrl);
      } catch (error) {
        console.error('Failed to create preview URL:', error);
      }
    };

    generatePreview();
  }, []);

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    if (iframe && previewUrl) {
      // Inject fresh editor after iframe loads
      setTimeout(() => {
        injectFreshEditor(iframe);
      }, 500);
    }
  };

  return (
    <div className="desktop-dashboard">
      <div className="dashboard-grid">
        <div className="chat-panel">
          <UnifiedCommandChatPanel />
        </div>
        <div className="preview-panel">
          <h3>Live Preview</h3>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="preview-iframe"
              onLoad={handleIframeLoad}
              style={{
                width: '100%',
                height: '600px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}