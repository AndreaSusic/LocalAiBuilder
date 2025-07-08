import React, { useState, useEffect, Component } from 'react';
import SiteDataProvider from '../context/SiteDataProvider.jsx';
import HomepageV1 from '../templates/homepage/v1/index.jsx';
import SimpleInlineEditor from './SimpleInlineEditor.jsx';

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

  // COMPLETELY DISABLED - OLD AUTO-SAVE EDITOR INJECTION 
  useEffect(() => {
    if (!templateData || loading) return;
    
    console.log('⚠️ TemplatePreview useEffect: ALL EDITOR INJECTION DISABLED');
    console.log('✅ Only WorkingInlineEditor.jsx component should handle editing');
    // NO SCRIPT INJECTION - WorkingInlineEditor React component handles everything
    return;
    
    console.log('🔧 Injecting auto-save inline editor...');
    
    // Remove any existing editor scripts
    const existingScript = document.getElementById('auto-save-editor-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Create and inject comprehensive inline editor script (clean implementation)
    const script = document.createElement('script');
    script.id = 'comprehensive-editor-script';
    script.text = `
      (function() {
        console.log('🚀 Starting comprehensive inline editor (clean)...');
        
        // Unique variables to avoid conflicts
        let currentActiveElement = null;
        let editingPanel = null;
        let saveTimeout = null;
        const pageId = '${previewId}';
        const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32'];
        const headingLevels = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

        // Initialize comprehensive editor
        function initEditor() {
          console.log('⚠️ TemplatePreview built-in editor DISABLED to prevent duplicate × buttons');
          return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
          
          addStyles();
          makeElementsEditable();
          createEditingPanel();
          setupEventListeners();
          console.log('✅ Comprehensive editor initialized');
        }
        
        // Add comprehensive CSS styles
        function addStyles() {
          const style = document.createElement('style');
          style.textContent = \`
            .edit-hoverable {
              position: relative;
              transition: outline 0.2s ease;
            }
            
            .edit-hoverable:hover {
              outline: 2px dashed #ff4444 !important;
              outline-offset: 2px;
            }
            
            .edit-active {
              outline: 2px solid #ffc000 !important;
              outline-offset: 2px;
              background-color: rgba(255, 192, 0, 0.1) !important;
            }
            
            .delete-btn {
              position: absolute;
              top: -10px;
              right: -10px;
              width: 20px;
              height: 20px;
              background: #ff4444;
              color: white;
              border: none;
              border-radius: 50%;
              cursor: pointer;
              font-size: 12px;
              line-height: 1;
              z-index: 10000;
              display: none;
              font-family: Arial, sans-serif;
            }
            
            .edit-hoverable:hover .delete-btn,
            .edit-active .delete-btn {
              display: block;
            }
            
            .editing-panel {
              position: fixed;
              top: 50px;
              right: 20px;
              width: 300px;
              background: white;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 10001;
              display: none;
              padding: 16px;
              font-family: Arial, sans-serif;
            }
            
            .editing-panel.show {
              display: block;
            }
            
            .editing-panel h3 {
              margin: 0 0 12px 0;
              font-size: 14px;
              color: #333;
              font-weight: bold;
            }
            
            .panel-section {
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #eee;
            }
            
            .panel-section:last-child {
              border-bottom: none;
            }
            
            .panel-section label {
              display: block;
              font-size: 11px;
              color: #666;
              margin-bottom: 4px;
              font-weight: bold;
            }
            
            .format-controls {
              display: flex;
              gap: 8px;
              margin-bottom: 8px;
            }
            
            .format-btn {
              padding: 6px 12px;
              border: 1px solid #ddd;
              background: white;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              font-family: Arial, sans-serif;
            }
            
            .format-btn:hover {
              background: #f5f5f5;
            }
            
            .format-btn.active {
              background: #ffc000;
              color: white;
            }
            
            .dropdown-select {
              width: 100%;
              padding: 4px 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 12px;
              font-family: Arial, sans-serif;
              margin-bottom: 8px;
            }
            
            .color-grid {
              display: flex;
              gap: 4px;
              flex-wrap: wrap;
            }
            
            .color-btn {
              width: 24px;
              height: 24px;
              border: 1px solid #ddd;
              border-radius: 4px;
              cursor: pointer;
            }
            
            .ai-btn {
              width: 100%;
              padding: 8px;
              background: #ffc000;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              font-family: Arial, sans-serif;
            }
            
            .save-status {
              outline: 2px solid #22c55e !important;
            }
            
            .save-progress {
              outline: 2px solid #ffc000 !important;
            }
            
            .save-error {
              outline: 2px solid #ff4444 !important;
            }
          \`;
          document.head.appendChild(style);
        }
        
        // Make all elements editable including menu
        function makeElementsEditable() {
          const selectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'a', 'button',
            'nav a', 'nav span', 'nav div', 'nav li',
            '.menu-item', '.nav-item', '.navbar-brand',
            '[class*="title"]', '[class*="text"]', '[class*="heading"]',
            '[class*="nav"]', '[class*="menu"]'
          ];
          
          let count = 0;
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              if (element.classList.contains('edit-hoverable') || 
                  element.tagName === 'SCRIPT' || 
                  element.tagName === 'STYLE' ||
                  element.classList.contains('delete-btn') ||
                  element.classList.contains('editing-panel')) {
                return;
              }
              
              const text = element.textContent.trim();
              if (text.length > 0) {
                element.classList.add('edit-hoverable');
                element.setAttribute('data-editable', 'true');
                element.setAttribute('data-original', text);
                
                // Add delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  if (confirm('Delete this element?')) {
                    element.remove();
                    scheduleAutoSave(document.body);
                  }
                };
                
                if (window.getComputedStyle(element).position === 'static') {
                  element.style.position = 'relative';
                }
                
                element.appendChild(deleteBtn);
                count++;
              }
            });
          });
          
          console.log(\`📍 Made \${count} elements editable (single editor system)\`);
        }
        
        // Create editing panel with font size icons
        function createEditingPanel() {
          const panel = document.createElement('div');
          panel.className = 'editing-panel';
          panel.innerHTML = \`
            <h3>✏️ Element Editor</h3>
            
            <div class="panel-section">
              <label>Text Formatting:</label>
              <div class="format-controls">
                <button class="format-btn" onclick="formatText('bold')" title="Bold">
                  <strong>B</strong>
                </button>
                <button class="format-btn" onclick="formatText('italic')" title="Italic">
                  <em>I</em>
                </button>
                <button class="format-btn" onclick="formatText('underline')" title="Underline">
                  <u>U</u>
                </button>
              </div>
            </div>
            
            <div class="panel-section">
              <label>Font Size:</label>
              <select class="dropdown-select" onchange="changeFontSize(this.value)" id="fontSizeSelect">
                \${fontSizes.map(size => \`<option value="\${size}">\${size}px</option>\`).join('')}
              </select>
              
              <label>Heading Level:</label>
              <select class="dropdown-select" onchange="changeHeading(this.value)" id="headingSelect">
                <option value="">Keep current</option>
                \${headingLevels.map(h => \`<option value="\${h}">\${h}</option>\`).join('')}
              </select>
            </div>
            
            <div class="panel-section">
              <label>Text Color:</label>
              <div class="color-grid">
                <div class="color-btn" style="background: #000000" onclick="changeColor('#000000')"></div>
                <div class="color-btn" style="background: #333333" onclick="changeColor('#333333')"></div>
                <div class="color-btn" style="background: #666666" onclick="changeColor('#666666')"></div>
                <div class="color-btn" style="background: #999999" onclick="changeColor('#999999')"></div>
                <div class="color-btn" style="background: #ffffff; border: 2px solid #000" onclick="changeColor('#ffffff')"></div>
                <div class="color-btn" style="background: #ffc000" onclick="changeColor('#ffc000')"></div>
                <div class="color-btn" style="background: #ff4444" onclick="changeColor('#ff4444')"></div>
                <div class="color-btn" style="background: #22c55e" onclick="changeColor('#22c55e')"></div>
                <div class="color-btn" style="background: #3b82f6" onclick="changeColor('#3b82f6')"></div>
              </div>
            </div>
            
            <div class="panel-section">
              <button class="ai-btn" onclick="openAIHelp()">
                🤖 Get AI Help
              </button>
            </div>
          \`;
          
          document.body.appendChild(panel);
          editingPanel = panel;
          
          // Add global functions
          window.formatText = formatText;
          window.changeFontSize = changeFontSize;
          window.changeHeading = changeHeading;
          window.changeColor = changeColor;
          window.openAIHelp = openAIHelp;
        }
        
        // Setup event listeners
        function setupEventListeners() {
          document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
              return;
            }
            
            const editableEl = e.target.closest('[data-editable="true"]');
            if (editableEl) {
              e.preventDefault();
              e.stopPropagation();
              activateElement(editableEl);
            } else {
              deactivateElement();
            }
          });
          
          document.addEventListener('input', (e) => {
            if (e.target.classList.contains('edit-active')) {
              scheduleAutoSave(e.target);
            }
          });
          
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentActiveElement) {
              deactivateElement();
            }
          });
        }
        
        function activateElement(element) {
          console.log('🎯 Activating element:', element.tagName, element.textContent.substring(0, 30));
          
          if (currentActiveElement) {
            deactivateElement();
          }
          
          currentActiveElement = element;
          element.classList.add('edit-active');
          element.contentEditable = true;
          
          if (editingPanel) {
            editingPanel.classList.add('show');
            
            // Update font size dropdown
            const fontSize = window.getComputedStyle(element).fontSize;
            const fontSizeValue = parseInt(fontSize);
            const fontSelect = editingPanel.querySelector('#fontSizeSelect');
            if (fontSelect) {
              fontSelect.value = fontSizeValue;
            }
            
            // Update heading dropdown
            const headingSelect = editingPanel.querySelector('#headingSelect');
            if (headingSelect && element.tagName.match(/H[1-6]/)) {
              headingSelect.value = element.tagName;
            }
          }
          
          element.focus();
          scheduleAutoSave(element);
        }
        
        function deactivateElement() {
          if (currentActiveElement) {
            currentActiveElement.classList.remove('edit-active');
            currentActiveElement.contentEditable = false;
            currentActiveElement = null;
          }
          
          if (editingPanel) {
            editingPanel.classList.remove('show');
          }
        }
        
        function formatText(command) {
          if (!currentActiveElement) return;
          document.execCommand(command, false, null);
          scheduleAutoSave(currentActiveElement);
        }
        
        function changeFontSize(size) {
          if (!currentActiveElement) return;
          currentActiveElement.style.fontSize = size + 'px';
          scheduleAutoSave(currentActiveElement);
        }
        
        function changeHeading(level) {
          if (!currentActiveElement || !level) return;
          
          const newEl = document.createElement(level.toLowerCase());
          newEl.innerHTML = currentActiveElement.innerHTML;
          newEl.className = currentActiveElement.className;
          newEl.setAttribute('data-editable', 'true');
          newEl.setAttribute('data-original', currentActiveElement.getAttribute('data-original'));
          newEl.style.cssText = currentActiveElement.style.cssText;
          
          currentActiveElement.parentNode.replaceChild(newEl, currentActiveElement);
          activateElement(newEl);
        }
        
        function changeColor(color) {
          if (!currentActiveElement) return;
          currentActiveElement.style.color = color;
          scheduleAutoSave(currentActiveElement);
        }
        
        function openAIHelp() {
          if (!currentActiveElement) return;
          
          const text = currentActiveElement.textContent;
          const message = \`Please help improve this text: "\${text}"\`;
          
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'AI_CHAT_REQUEST',
              message: message,
              context: 'inline-editor'
            }, '*');
          }
        }
        
        function scheduleAutoSave(element) {
          showSaveStatus(element, 'progress');
          
          if (saveTimeout) {
            clearTimeout(saveTimeout);
          }
          
          saveTimeout = setTimeout(() => {
            autoSaveElement(element);
          }, 1000);
        }
        
        async function autoSaveElement(element) {
          const elementId = generateElementId(element);
          const originalContent = element.getAttribute('data-original') || '';
          const editedContent = element.textContent || '';
          
          try {
            console.log('💾 Auto-saving element:', elementId);
            
            const response = await fetch('/api/save-page-edit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                pageId: pageId,
                elementId: elementId,
                editType: 'text',
                originalContent: originalContent,
                editedContent: editedContent
              })
            });
            
            if (response.ok) {
              console.log('✅ Auto-save successful');
              showSaveStatus(element, 'status');
              element.setAttribute('data-original', editedContent);
            } else {
              console.log('❌ Auto-save failed:', response.status);
              showSaveStatus(element, 'error');
            }
          } catch (error) {
            console.log('❌ Auto-save error:', error);
            showSaveStatus(element, 'error');
          }
        }
        
        function showSaveStatus(element, status) {
          element.classList.remove('save-status', 'save-progress', 'save-error');
          element.classList.add(\`save-\${status}\`);
          
          setTimeout(() => {
            element.classList.remove(\`save-\${status}\`);
          }, 2000);
        }
        
        function generateElementId(element) {
          const tag = element.tagName.toLowerCase();
          const cls = element.className.replace(/\\s+/g, '-') || 'no-class';
          const txt = element.textContent.trim().substring(0, 20).replace(/\\s+/g, '-') || 'no-text';
          const idx = Array.from(document.querySelectorAll(tag)).indexOf(element);
          
          return \`\${tag}-\${cls}-\${txt}-\${idx}\`.toLowerCase();
        }
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initEditor);
        } else {
          initEditor();
        }
        
        // Re-initialize after React updates
        setTimeout(initEditor, 1000);
        
      })();

      async function checkAuthStatus() {
        try {
          // Dashboard users automatically get authentication for editing
          if (window.location.href.includes('dashboard') || window.parent !== window) {
            autoSaveIsAuthenticated = true;
            console.log('🔐 Dashboard user auto-authenticated for editing');
            return;
          }
          
          autoSaveIsAuthenticated = false;
          console.log('🔐 Non-dashboard user - editing disabled');
        } catch (error) {
          console.log('⚠️ Auth check error:', error.message);
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
        console.log('⚠️ loadExistingEdits DISABLED to prevent autoSavePageId errors');
        return; // DISABLED TO PREVENT autoSavePageId ERRORS
        
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
          <select class="auto-save-btn" onchange="changeFontSize(this.value)" title="Font Size" style="width: 60px;">
            <option value="">Size</option>
            <option value="10px">10px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="32px">32px</option>
          </select>
          <button class="auto-save-btn color-btn" onclick="openColorPicker()" title="Text Color" style="background: #000; color: #fff; width: 30px;">A</button>
          <button class="auto-save-btn" onclick="changeImage()" title="Change Image">🖼️</button>
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
      
      function changeFontSize(size) {
        if (!activeElement || !size) return;
        
        try {
          if (window.getSelection().toString()) {
            document.execCommand('fontSize', false, '7');
            const fontElements = document.querySelectorAll('font[size="7"]');
            fontElements.forEach(el => {
              el.removeAttribute('size');
              el.style.fontSize = size;
            });
          } else {
            activeElement.style.fontSize = size;
          }
          scheduleAutoSave(activeElement);
        } catch (error) {
          console.error('❌ Font size change failed:', error);
        }
      }
      
      function openColorPicker() {
        if (!activeElement) return;
        
        const existingPicker = document.querySelector('.color-picker-panel');
        if (existingPicker) {
          document.body.removeChild(existingPicker);
          return;
        }
        
        const colors = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff', 
                       '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                       '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'];
        
        const picker = document.createElement('div');
        picker.className = 'color-picker-panel';
        picker.style.cssText = \`
          position: fixed;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 10px;
          z-index: 10002;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
        \`;
        
        colors.forEach(color => {
          const colorBtn = document.createElement('button');
          colorBtn.style.cssText = \`
            width: 24px;
            height: 24px;
            background: \${color};
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
          \`;
          colorBtn.onclick = () => {
            try {
              if (window.getSelection().toString()) {
                document.execCommand('foreColor', false, color);
              } else {
                activeElement.style.color = color;
              }
              document.body.removeChild(picker);
              scheduleAutoSave(activeElement);
            } catch (error) {
              console.error('❌ Color change failed:', error);
            }
          };
          picker.appendChild(colorBtn);
        });
        
        const toolbarRect = toolbar.getBoundingClientRect();
        picker.style.left = toolbarRect.left + 'px';
        picker.style.top = (toolbarRect.bottom + 5) + 'px';
        
        document.body.appendChild(picker);
        
        setTimeout(() => {
          const clickHandler = (e) => {
            if (!picker.contains(e.target)) {
              document.body.removeChild(picker);
              document.removeEventListener('click', clickHandler);
            }
          };
          document.addEventListener('click', clickHandler);
        }, 100);
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

      // Check authentication status
      async function checkAuthStatus() {
        try {
          // Force authentication for dashboard preview - bypass 401 API call
          autoSaveIsAuthenticated = true;
          console.log('🔐 Dashboard preview auto-authenticated for editing');
        } catch (error) {
          console.log('⚠️ Auth setup error:', error.message);
          autoSaveIsAuthenticated = false;
        }
      }

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
        
        // DISABLED: await loadExistingEdits(); // Prevents autoSavePageId errors
        setupEventListeners();
        createAutoSaveToolbar();
        console.log('✅ Auto-save editor fully initialized');
      }

      // DISABLED: Start the editor with longer delay to ensure React is fully rendered
      // setTimeout(() => {
      //   initAutoSaveEditor();
      // }, 1500);
      console.log('⚠️ initAutoSaveEditor COMPLETELY DISABLED to prevent autoSavePageId errors');
    `;
    
    console.log('⚠️ TemplatePreview auto-save editor DISABLED to prevent duplicate × buttons');
    return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
    
    // DISABLED: document.head.appendChild(script);
    console.log('⚠️ Auto-save editor script injection COMPLETELY DISABLED');
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
          {/* <SimpleInlineEditor previewId={previewId} /> */}
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