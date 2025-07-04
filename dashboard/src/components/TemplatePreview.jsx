import React, { useState, useEffect, Component } from 'react';
import SiteDataProvider from '../context/SiteDataProvider.jsx';
import HomepageV1 from '../templates/homepage/v1/index.jsx';

console.log('🔍 HomepageV1 import:', HomepageV1);
console.log('🔍 HomepageV1 is function:', typeof HomepageV1 === 'function');

class TemplateErrorBoundary extends Component {
  state = { err: null };
  
  static getDerivedStateFromError(err) { 
    return { err }; 
  }
  
  componentDidCatch(err, info) { 
    console.error('💥 Template crash:', err, info); 
  }
  
  render() {
    if (this.state.err) {
      return (
        <pre style={{
          color: 'red',
          background: '#ffebee',
          padding: '20px',
          margin: '20px',
          border: '2px solid red',
          fontSize: '14px',
          whiteSpace: 'pre-wrap'
        }}>
          💥 Template Error:
          {String(this.state.err)}
          
          Stack: {this.state.err.stack}
        </pre>
      );
    }
    return this.props.children;
  }
}

export default function TemplatePreview({ previewId, fallbackBootstrap }) {
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        console.log('🔍 Fetching preview data for ID:', previewId);
        
        const response = await fetch(`/api/preview/${previewId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded cached preview data for:', data.company_name || 'Unknown Company');
          console.log('📊 Data includes reviews:', !!data.reviews?.length);
          console.log('📊 Data includes photos:', !!data.images?.length);
          setTemplateData(data);
        } else if (response.status === 404) {
          console.log('⚠️ Preview not found, using fallback data');
          setTemplateData(fallbackBootstrap);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.error('❌ Error fetching preview data:', err);
        setError(err.message);
        setTemplateData(fallbackBootstrap);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [previewId, fallbackBootstrap]);

  // Inject auto-save editor after template renders
  useEffect(() => {
    if (!templateData || loading) return;
    
    console.log('🔧 Injecting auto-save inline editor...');
    
    // Remove any existing editor scripts
    const existingScript = document.getElementById('auto-save-editor-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Create and inject auto-save editor script
    const script = document.createElement('script');
    script.id = 'auto-save-editor-script';
    script.text = `
      // Auto-save editor initialization
      console.log('🚀 Auto-save editor bridge starting...');

      let autoSaveActiveElement = null;
      let autoSaveToolbar = null;
      let autoSavePageId = '${previewId}';
      let autoSaveSaveTimeout = null;
      let autoSaveIsAuthenticated = false;
      let autoSaveEditorEnabled = true; // Always enable editor in dashboard preview

      // Check authentication status
      async function checkAuthStatus() {
        try {
          // First try to get auth status from parent dashboard
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'requestAuthStatus' }, '*');
            
            // Wait for response from parent
            const authResponse = await new Promise((resolve) => {
              const timeout = setTimeout(() => resolve(false), 1000);
              
              const messageHandler = (event) => {
                if (event.data.type === 'authStatusResponse') {
                  clearTimeout(timeout);
                  window.removeEventListener('message', messageHandler);
                  resolve(event.data.isAuthenticated);
                }
              };
              
              window.addEventListener('message', messageHandler);
            });
            
            if (authResponse) {
              autoSaveIsAuthenticated = true;
              console.log('🔐 Authentication inherited from dashboard: Authenticated');
              return;
            }
          }
          
          // Fallback to direct API check
          const response = await fetch('/api/me', { credentials: 'include' });
          autoSaveIsAuthenticated = response.ok;
          console.log('🔐 Direct auth check:', autoSaveIsAuthenticated ? 'Authenticated' : 'Not authenticated');
        } catch (error) {
          console.log('⚠️ Could not check auth status:', error.message);
          autoSaveIsAuthenticated = false;
        }
      }

      function addEditorStyles() {
        const style = document.createElement('style');
        style.textContent = \`
          [data-editable="true"]:hover {
            outline: 2px dotted #ff0000 !important;
            outline-offset: 2px !important;
            cursor: pointer !important;
          }
          
          [data-editable="true"][contenteditable="true"] {
            outline: 2px solid #ffc000 !important;
            outline-offset: 2px !important;
          }
          
          .auto-save-toolbar {
            position: fixed !important;
            background: white !important;
            border: 2px solid #333 !important;
            border-radius: 8px !important;
            padding: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            z-index: 99999 !important;
            display: none !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
            min-width: 350px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }
          
          .auto-save-btn {
            font: 14px/1 sans-serif !important;
            padding: 8px 12px !important;
            cursor: pointer !important;
            border: 1px solid #333 !important;
            border-radius: 4px !important;
            background: #f8f8f8 !important;
            min-width: 40px !important;
            color: #333 !important;
            font-weight: 500 !important;
          }
          
          .auto-save-btn:hover {
            background: #e8e8e8 !important;
            border-color: #000 !important;
          }
          
          .auto-save-status {
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            background: #4CAF50 !important;
            color: white !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            z-index: 99998 !important;
            display: none !important;
          }
          
          .auto-save-status.saving { background: #ff9800 !important; }
          .auto-save-status.saved { background: #4CAF50 !important; }
          .auto-save-status.error { background: #f44336 !important; }
        \`;
        document.head.appendChild(style);
      }

      function markEditableElements() {
        // Mark ALL text content as editable
        const allTextElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, legend, summary, figcaption');
        
        allTextElements.forEach(element => {
          // Only mark elements with text content, excluding interactive elements
          if (element.textContent.trim() && 
              !element.querySelector('input, button, select, textarea, a[href]') &&
              !element.closest('button') &&
              !element.closest('a[href]') &&
              !element.hasAttribute('data-editable')) {
            element.setAttribute('data-editable', 'true');
            element.setAttribute('data-edit-type', 'text');
            element.setAttribute('data-element-id', generateElementId(element));
          }
        });
        
        // Mark ALL images as editable
        document.querySelectorAll('img').forEach(element => {
          if (!element.hasAttribute('data-editable')) {
            element.setAttribute('data-editable', 'true');
            element.setAttribute('data-edit-type', 'image');
            element.setAttribute('data-element-id', generateElementId(element));
          }
        });
        
        // Also mark elements with specific content classes
        const contentSelectors = [
          '[class*="content"]', '[class*="text"]', '[class*="description"]',
          '[class*="title"]', '[class*="heading"]', '[class*="subtitle"]',
          '[class*="review"]', '[class*="testimonial"]', '[class*="about"]',
          '[class*="feature"]', '[class*="service"]', '[class*="contact"]',
          '[class*="gallery"]', '[class*="footer"]'
        ];
        
        contentSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(element => {
            if (element.textContent.trim() && 
                !element.querySelector('input, button, select, textarea, a[href]') &&
                !element.closest('button') &&
                !element.closest('a[href]') &&
                !element.hasAttribute('data-editable')) {
              element.setAttribute('data-editable', 'true');
              element.setAttribute('data-edit-type', 'text');
              element.setAttribute('data-element-id', generateElementId(element));
            }
          });
        });
        
        const editableCount = document.querySelectorAll('[data-editable="true"]').length;
        console.log('🎯 Marked', editableCount, 'elements as editable');
        
        // Debug log sections
        const sections = ['hero', 'services', 'about', 'features', 'reviews', 'gallery', 'contact', 'footer'];
        sections.forEach(section => {
          const sectionElements = document.querySelectorAll(\`[class*="\${section}"] [data-editable="true"]\`);
          if (sectionElements.length > 0) {
            console.log(\`📍 \${section.toUpperCase()} section: \${sectionElements.length} editable elements\`);
          }
        });
      }

      function generateElementId(element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className.replace(/\\s+/g, '-') || 'no-class';
        const textContent = element.textContent.trim().substring(0, 20).replace(/\\s+/g, '-') || 'no-text';
        const index = Array.from(document.querySelectorAll(tagName)).indexOf(element);
        
        return \`\${tagName}-\${className}-\${textContent}-\${index}\`.toLowerCase();
      }

      async function loadExistingEdits() {
        if (!autoSaveIsAuthenticated) return;
        
        try {
          console.log('📥 Loading existing edits for page:', autoSavePageId);
          const response = await fetch(\`/api/get-page-edits/\${autoSavePageId}\`);
          
          if (response.ok) {
            const data = await response.json();
            const edits = data.edits || {};
            
            console.log('📥 Found', Object.keys(edits).length, 'existing edits');
            
            Object.keys(edits).forEach(elementId => {
              const element = document.querySelector(\`[data-element-id="\${elementId}"]\`);
              if (element && edits[elementId].editedContent) {
                const editedContent = edits[elementId].editedContent;
                
                if (edits[elementId].editType === 'text') {
                  element.textContent = editedContent.text || editedContent;
                } else if (edits[elementId].editType === 'image') {
                  element.src = editedContent.src || editedContent;
                }
                
                element.style.border = '1px solid #4CAF50';
                element.title = \`Last edited: \${new Date(edits[elementId].lastModified).toLocaleString()}\`;
              }
            });
          }
        } catch (error) {
          console.error('❌ Error loading existing edits:', error);
        }
      }

      function setupEventListeners() {
        document.addEventListener('click', handleElementClick);
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('input', handleTextInput);
        document.addEventListener('keydown', handleKeyboardShortcuts);
      }

      function handleElementClick(e) {
        const editableElement = e.target.closest('[data-editable="true"]');
        if (editableElement) {
          e.preventDefault();
          activateElement(editableElement);
        }
      }

      function handleOutsideClick(e) {
        if (activeElement && !e.target.closest('.auto-save-toolbar') && !e.target.closest('[data-editable="true"]')) {
          deactivateElement();
        }
      }

      function handleTextInput(e) {
        if (e.target.hasAttribute('data-editable')) {
          scheduleAutoSave(e.target);
        }
      }

      function handleKeyboardShortcuts(e) {
        if (!activeElement) return;
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
          e.preventDefault();
          toggleFormat('bold');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          toggleFormat('italic');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
          e.preventDefault();
          toggleFormat('underline');
        }
        
        if (e.key === 'Escape') {
          deactivateElement();
        }
      }

      function activateElement(element) {
        console.log('🎯 Activating element:', element.getAttribute('data-element-id'));
        
        if (activeElement) {
          deactivateElement();
        }
        
        activeElement = element;
        
        if (element.getAttribute('data-edit-type') === 'text') {
          element.contentEditable = true;
          element.focus();
        }
        
        showAutoSaveToolbar(element);
      }

      function deactivateElement() {
        if (!activeElement) return;
        
        console.log('📤 Deactivating element');
        
        activeElement.contentEditable = false;
        activeElement.blur();
        
        scheduleAutoSave(activeElement);
        hideAutoSaveToolbar();
        
        activeElement = null;
      }

      function createAutoSaveToolbar() {
        toolbar = document.createElement('div');
        toolbar.className = 'auto-save-toolbar';
        toolbar.innerHTML = \`
          <button class="auto-save-btn" onclick="toggleFormat('bold')" title="Bold (Ctrl+B)"><b>B</b></button>
          <button class="auto-save-btn" onclick="toggleFormat('italic')" title="Italic (Ctrl+I)"><i>I</i></button>
          <button class="auto-save-btn" onclick="toggleFormat('underline')" title="Underline (Ctrl+U)"><u>U</u></button>
          <button class="auto-save-btn" onclick="changeImage()" title="Change Image">🖼️</button>
          <button class="auto-save-btn" onclick="openColorPicker()" title="Text Color">🎨</button>
          <button class="auto-save-btn" onclick="openAIAssist()" title="AI Assistant">🤖</button>
          <button class="auto-save-btn" onclick="deleteElement()" title="Delete Element">🗑️</button>
        \`;
        document.body.appendChild(toolbar);
        
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'auto-save-status';
        statusIndicator.id = 'auto-save-status';
        document.body.appendChild(statusIndicator);
      }

      function showAutoSaveToolbar(element) {
        if (!toolbar) return;
        
        const rect = element.getBoundingClientRect();
        toolbar.style.display = 'flex';
        toolbar.style.left = \`\${Math.max(10, rect.left)}px\`;
        toolbar.style.top = \`\${Math.max(10, rect.bottom + 10)}px\`;
      }

      function hideAutoSaveToolbar() {
        if (toolbar) {
          toolbar.style.display = 'none';
        }
      }

      function toggleFormat(command) {
        if (!activeElement) return;
        
        try {
          document.execCommand(command, false, null);
          scheduleAutoSave(activeElement);
        } catch (error) {
          console.error('❌ Format command failed:', command, error);
        }
      }

      function scheduleAutoSave(element) {
        // Always allow auto-save in dashboard iframe context
        const isDashboardContext = window.location.pathname.includes('/t/v1/') || 
                                   window.location.pathname.includes('/preview') ||
                                   window.parent !== window;
        
        if (!autoSaveIsAuthenticated && !isDashboardContext) {
          console.log('⚠️ Auto-save skipped - user not authenticated');
          return;
        }
        
        if (autoSaveSaveTimeout) {
          clearTimeout(autoSaveSaveTimeout);
        }
        
        autoSaveSaveTimeout = setTimeout(() => {
          autoSaveElement(element);
        }, 1000);
        
        showSaveStatus('saving');
      }

      async function autoSaveElement(element) {
        // Always allow auto-save in dashboard iframe context
        const isDashboardContext = window.location.pathname.includes('/t/v1/') || 
                                   window.location.pathname.includes('/preview') ||
                                   window.parent !== window;
        
        if (!autoSaveIsAuthenticated && !isDashboardContext) return;
        
        const elementId = element.getAttribute('data-element-id');
        const editType = element.getAttribute('data-edit-type');
        
        let originalContent = null;
        let editedContent = null;
        
        if (editType === 'text') {
          originalContent = { text: element.getAttribute('data-original-text') || '' };
          editedContent = { text: element.textContent.trim() };
          
          if (!element.hasAttribute('data-original-text')) {
            element.setAttribute('data-original-text', editedContent.text);
            originalContent.text = editedContent.text;
          }
        } else if (editType === 'image') {
          originalContent = { src: element.getAttribute('data-original-src') || element.src };
          editedContent = { src: element.src };
          
          if (!element.hasAttribute('data-original-src')) {
            element.setAttribute('data-original-src', element.src);
          }
        }
        
        try {
          console.log('💾 Auto-saving element:', elementId);
          
          const response = await fetch('/api/save-page-edit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              pageId: autoSavePageId,
              elementId: elementId,
              editType: editType,
              originalContent: originalContent,
              editedContent: editedContent
            })
          });
          
          if (response.ok) {
            console.log('✅ Auto-save successful');
            showSaveStatus('saved');
            
            element.style.border = '1px solid #4CAF50';
            element.title = \`Auto-saved: \${new Date().toLocaleString()}\`;
          } else {
            throw new Error('Save failed');
          }
        } catch (error) {
          console.error('❌ Auto-save error:', error);
          showSaveStatus('error');
        }
      }

      function showSaveStatus(status) {
        const statusElement = document.getElementById('auto-save-status');
        if (!statusElement) return;
        
        statusElement.className = \`auto-save-status \${status}\`;
        
        switch (status) {
          case 'saving':
            statusElement.textContent = 'Saving...';
            break;
          case 'saved':
            statusElement.textContent = 'Saved ✓';
            break;
          case 'error':
            statusElement.textContent = 'Save failed ✗';
            break;
        }
        
        statusElement.style.display = 'block';
        
        setTimeout(() => {
          statusElement.style.display = 'none';
        }, 3000);
      }

      // Global functions for toolbar
      window.toggleFormat = toggleFormat;

      window.changeImage = function() {
        if (!activeElement || activeElement.getAttribute('data-edit-type') !== 'image') return;
        
        const newSrc = prompt('Enter new image URL:');
        if (newSrc) {
          activeElement.src = newSrc;
          scheduleAutoSave(activeElement);
        }
      };

      window.openColorPicker = function() {
        if (!activeElement) return;
        
        const color = prompt('Enter color (hex, rgb, or name):');
        if (color) {
          activeElement.style.color = color;
          scheduleAutoSave(activeElement);
        }
      };

      window.openAIAssist = function() {
        if (!activeElement) return;
        
        // Send message to parent dashboard to open AI chat with context
        window.parent.postMessage({
          type: 'openAIChat',
          selectedElement: {
            tagName: activeElement.tagName,
            textContent: activeElement.textContent.substring(0, 100),
            className: activeElement.className,
            elementId: activeElement.getAttribute('data-element-id')
          },
          context: 'inline-editor'
        }, '*');
        
        console.log('🤖 AI assistance requested for element:', activeElement.getAttribute('data-element-id'));
      };

      window.deleteElement = function() {
        if (!activeElement) return;
        
        if (confirm('Are you sure you want to delete this element?')) {
          const elementId = activeElement.getAttribute('data-element-id');
          
          activeElement.remove();
          
          if (isAuthenticated) {
            fetch(\`/api/delete-page-edit/\${currentPageId}/\${elementId}\`, {
              method: 'DELETE'
            }).then(response => {
              if (response.ok) {
                console.log('✅ Element deleted from database');
                showSaveStatus('saved');
              }
            }).catch(error => {
              console.error('❌ Error deleting from database:', error);
            });
          }
          
          activeElement = null;
          hideAutoSaveToolbar();
        }
      };

      // Initialize auto-save editor
      async function initAutoSaveEditor() {
        console.log('🔧 Starting auto-save editor initialization...');
        
        // Always enable in dashboard preview - no "direct view access" checks
        if (window.location.pathname.includes('/t/v1/') || window.location.pathname.includes('/preview')) {
          console.log('✅ Dashboard preview detected - enabling editor');
          editorEnabled = true;
        }
        
        if (!editorEnabled) {
          console.log('🚫 Editor disabled for this environment');
          return;
        }
        
        await checkAuthStatus();
        addEditorStyles();
        
        // Wait for React components to fully render
        setTimeout(() => {
          markEditableElements();
        }, 1000);
        
        await loadExistingEdits();
        setupEventListeners();
        createAutoSaveToolbar();
        console.log('✅ Auto-save editor fully initialized');
      }

      // Start the editor with longer delay to ensure React is fully rendered
      setTimeout(initAutoSaveEditor, 1500);
    `;
    
    document.head.appendChild(script);
    console.log('✅ Auto-save editor script injected');
  }, [templateData, loading, previewId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading template preview...
      </div>
    );
  }

  if (error && !templateData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
          Preview Not Available
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          The template preview has expired or could not be loaded.
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ffc000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Render the template with the fetched data
  console.log('🎨 Rendering template with data for:', templateData?.company_name || 'Unknown Company');
  console.log('📋 TemplatePreview about to render HomepageV1 with bootstrap:', !!templateData);
  console.log('🔍 HomepageV1 component check:', HomepageV1);
  
  // If HomepageV1 is null, render error instead of crashing
  if (!HomepageV1) {
    console.error('❌ HomepageV1 is null, cannot render');
    return (
      <div style={{ padding: '20px', background: '#ffebee' }}>
        <h2 style={{ color: '#c62828' }}>HomepageV1 Import Error</h2>
        <p>HomepageV1 component failed to import properly</p>
        <p>Import result: {String(HomepageV1)}</p>
      </div>
    );
  }
  


  try {
    return (
      <SiteDataProvider bootstrap={templateData}>
        <TemplateErrorBoundary>
          <HomepageV1 bootstrap={templateData} />
        </TemplateErrorBoundary>
      </SiteDataProvider>
    );
  } catch (error) {
    console.error('💥 TemplatePreview render error:', error);
    return (
      <div style={{ padding: '20px', background: '#ffebee' }}>
        <h2 style={{ color: '#c62828' }}>TemplatePreview Error</h2>
        <p>Error: {error.message}</p>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
          {error.stack}
        </pre>
      </div>
    );
  }
}