import React, { useEffect, useRef } from 'react';

const NewTemplatePreview = ({ previewId, onReady }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        console.log('⚠️ NewTemplatePreview editor DISABLED to prevent duplicate × buttons');
        return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
        
        // Inject comprehensive inline editor
        const script = iframeDoc.createElement('script');
        script.innerHTML = `
          (function() {
            console.log('🚀 Starting comprehensive inline editor...');
            
            // Global variables with unique names to avoid conflicts
            let editorActiveElement = null;
            let editingPanelElement = null;
            let isEditorEnabled = true;
            let autoSaveTimeout = null;
            
            // Authentication - assume true in dashboard context
            const isDashboardContext = window.location.pathname.includes('/t/v1/') || 
                                       window.location.pathname.includes('/preview') ||
                                       window.parent !== window;
            
            const isAuthenticated = isDashboardContext; // Always true in dashboard
            
            // Font size and heading options
            const fontSizeOptions = ['10', '12', '14', '16', '18', '20', '24', '28', '32'];
            const headingOptions = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
            
            // Initialize editor
            function initComprehensiveEditor() {
              console.log('✅ Comprehensive editor initialization...');
              
              // Add styles
              addEditorStyles();
              
              // Make all elements editable including menu
              makeAllElementsEditable();
              
              // Setup event listeners
              setupEventListeners();
              
              // Create editing panel
              createEditingPanel();
              
              console.log('✅ Comprehensive editor fully initialized');
            }
            
            function addEditorStyles() {
              const style = document.createElement('style');
              style.textContent = \`
                .editor-hoverable {
                  position: relative;
                  transition: outline 0.2s ease;
                }
                
                .editor-hoverable:hover {
                  outline: 2px dashed #ff4444 !important;
                  outline-offset: 2px;
                }
                
                .editor-active {
                  outline: 2px solid #ffc000 !important;
                  outline-offset: 2px;
                  background-color: rgba(255, 192, 0, 0.1) !important;
                }
                
                .editor-delete-btn {
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
                
                .editor-hoverable:hover .editor-delete-btn,
                .editor-active .editor-delete-btn {
                  display: block;
                }
                
                .editor-panel {
                  position: fixed;
                  top: 50px;
                  right: 20px;
                  width: 280px;
                  background: white;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  z-index: 10001;
                  display: none;
                  padding: 16px;
                  font-family: Arial, sans-serif;
                }
                
                .editor-panel.active {
                  display: block;
                }
                
                .editor-panel h3 {
                  margin: 0 0 12px 0;
                  font-size: 14px;
                  color: #333;
                  font-weight: bold;
                }
                
                .editor-controls {
                  display: flex;
                  gap: 8px;
                  margin-bottom: 12px;
                  flex-wrap: wrap;
                }
                
                .editor-btn {
                  padding: 6px 12px;
                  border: 1px solid #ddd;
                  background: white;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  transition: all 0.2s ease;
                  font-family: Arial, sans-serif;
                }
                
                .editor-btn:hover {
                  background: #f5f5f5;
                }
                
                .editor-btn.active {
                  background: #ffc000;
                  color: white;
                  border-color: #ffc000;
                }
                
                .editor-dropdown {
                  padding: 4px 8px;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  font-size: 12px;
                  background: white;
                  font-family: Arial, sans-serif;
                  min-width: 60px;
                }
                
                .editor-section {
                  margin-bottom: 12px;
                  padding-bottom: 12px;
                  border-bottom: 1px solid #eee;
                }
                
                .editor-section:last-child {
                  border-bottom: none;
                  margin-bottom: 0;
                }
                
                .editor-section label {
                  display: block;
                  font-size: 11px;
                  color: #666;
                  margin-bottom: 4px;
                  font-weight: bold;
                }
                
                .editor-color-picker {
                  display: flex;
                  gap: 4px;
                  flex-wrap: wrap;
                }
                
                .editor-color-btn {
                  width: 24px;
                  height: 24px;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  cursor: pointer;
                  transition: transform 0.2s ease;
                }
                
                .editor-color-btn:hover {
                  transform: scale(1.1);
                }
                
                .editor-saved {
                  outline: 2px solid #22c55e !important;
                  outline-offset: 2px;
                }
                
                .editor-saving {
                  outline: 2px solid #ffc000 !important;
                  outline-offset: 2px;
                }
                
                .editor-error {
                  outline: 2px solid #ff4444 !important;
                  outline-offset: 2px;
                }
              \`;
              document.head.appendChild(style);
            }
            
            function makeAllElementsEditable() {
              // Select all text elements including menu items
              const selectors = [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'span', 'div', 'a', 'button',
                'nav a', 'nav span', 'nav div', 'nav li',
                '.menu-item', '.nav-item', '.navbar-brand',
                '[class*="title"]', '[class*="text"]', '[class*="heading"]',
                '[class*="nav"]', '[class*="menu"]'
              ];
              
              let editableCount = 0;
              
              selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                  // Skip if already processed or if it's a script/style element
                  if (element.classList.contains('editor-hoverable') || 
                      element.tagName === 'SCRIPT' || 
                      element.tagName === 'STYLE' ||
                      element.classList.contains('editor-delete-btn') ||
                      element.classList.contains('editor-panel')) {
                    return;
                  }
                  
                  // Check if element has meaningful text content
                  const textContent = element.textContent.trim();
                  if (textContent.length > 0) {
                    element.classList.add('editor-hoverable');
                    element.setAttribute('data-editable', 'true');
                    element.setAttribute('data-original-text', textContent);
                    
                    // Add delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'editor-delete-btn';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.onclick = (e) => {
                      e.stopPropagation();
                      if (confirm('Delete this element?')) {
                        element.remove();
                        scheduleAutoSave(document.body); // Save the deletion
                      }
                    };
                    
                    // Ensure element is relatively positioned for delete button
                    const computedStyle = window.getComputedStyle(element);
                    if (computedStyle.position === 'static') {
                      element.style.position = 'relative';
                    }
                    
                    element.appendChild(deleteBtn);
                    editableCount++;
                  }
                });
              });
              
              console.log('⚠️ NewTemplatePreview editor DISABLED to prevent duplicate × buttons');
              return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
            }
            
            function setupEventListeners() {
              // Click handler for element selection
              document.addEventListener('click', (e) => {
                if (e.target.classList.contains('editor-delete-btn')) {
                  return; // Let delete button handle its own click
                }
                
                const editableElement = e.target.closest('[data-editable="true"]');
                if (editableElement) {
                  e.preventDefault();
                  e.stopPropagation();
                  activateElement(editableElement);
                } else {
                  deactivateElement();
                }
              });
              
              // Input handler for auto-save
              document.addEventListener('input', (e) => {
                if (e.target.classList.contains('editor-active')) {
                  scheduleAutoSave(e.target);
                }
              });
              
              // Escape key to deactivate
              document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && editorActiveElement) {
                  deactivateElement();
                }
              });
            }
            
            function createEditingPanel() {
              const panel = document.createElement('div');
              panel.className = 'editor-panel';
              panel.innerHTML = \`
                <h3>✏️ Element Editor</h3>
                
                <div class="editor-section">
                  <label>Text Formatting:</label>
                  <div class="editor-controls">
                    <button class="editor-btn" onclick="formatText('bold')" title="Bold">
                      <strong>B</strong>
                    </button>
                    <button class="editor-btn" onclick="formatText('italic')" title="Italic">
                      <em>I</em>
                    </button>
                    <button class="editor-btn" onclick="formatText('underline')" title="Underline">
                      <u>U</u>
                    </button>
                  </div>
                </div>
                
                <div class="editor-section">
                  <label>Font Size:</label>
                  <select class="editor-dropdown" onchange="changeFontSize(this.value)" id="fontSize">
                    \${fontSizeOptions.map(size => \`<option value="\${size}">\${size}px</option>\`).join('')}
                  </select>
                  
                  <label style="margin-top: 8px;">Heading Level:</label>
                  <select class="editor-dropdown" onchange="changeHeading(this.value)" id="headingLevel">
                    <option value="">Keep current</option>
                    \${headingOptions.map(h => \`<option value="\${h}">\${h}</option>\`).join('')}
                  </select>
                </div>
                
                <div class="editor-section">
                  <label>Text Color:</label>
                  <div class="editor-color-picker">
                    <div class="editor-color-btn" style="background: #000000" onclick="changeColor('#000000')" title="Black"></div>
                    <div class="editor-color-btn" style="background: #333333" onclick="changeColor('#333333')" title="Dark Gray"></div>
                    <div class="editor-color-btn" style="background: #666666" onclick="changeColor('#666666')" title="Gray"></div>
                    <div class="editor-color-btn" style="background: #999999" onclick="changeColor('#999999')" title="Light Gray"></div>
                    <div class="editor-color-btn" style="background: #ffffff; border: 2px solid #000" onclick="changeColor('#ffffff')" title="White"></div>
                    <div class="editor-color-btn" style="background: #ffc000" onclick="changeColor('#ffc000')" title="Yellow"></div>
                    <div class="editor-color-btn" style="background: #ff4444" onclick="changeColor('#ff4444')" title="Red"></div>
                    <div class="editor-color-btn" style="background: #22c55e" onclick="changeColor('#22c55e')" title="Green"></div>
                    <div class="editor-color-btn" style="background: #3b82f6" onclick="changeColor('#3b82f6')" title="Blue"></div>
                  </div>
                </div>
                
                <div class="editor-section">
                  <button class="editor-btn" onclick="openAIChat()" style="width: 100%;">
                    🤖 Get AI Help
                  </button>
                </div>
              \`;
              
              document.body.appendChild(panel);
              editingPanelElement = panel;
              
              // Add global functions
              window.formatText = formatText;
              window.changeFontSize = changeFontSize;
              window.changeHeading = changeHeading;
              window.changeColor = changeColor;
              window.openAIChat = openAIChat;
            }
            
            function activateElement(element) {
              console.log('🎯 Activating element:', element.tagName, element.textContent.substring(0, 30));
              
              // Deactivate previous element
              if (editorActiveElement) {
                deactivateElement();
              }
              
              // Activate new element
              editorActiveElement = element;
              element.classList.add('editor-active');
              element.contentEditable = true;
              
              // Show editing panel
              if (editingPanelElement) {
                editingPanelElement.classList.add('active');
                
                // Update panel values based on current element
                const fontSize = window.getComputedStyle(element).fontSize;
                const fontSizeValue = parseInt(fontSize);
                const fontSizeSelect = editingPanelElement.querySelector('#fontSize');
                if (fontSizeSelect) {
                  fontSizeSelect.value = fontSizeValue;
                }
                
                // Update heading level
                const headingSelect = editingPanelElement.querySelector('#headingLevel');
                if (headingSelect && element.tagName.match(/H[1-6]/)) {
                  headingSelect.value = element.tagName;
                }
              }
              
              // Focus element
              element.focus();
              
              // Schedule auto-save
              scheduleAutoSave(element);
            }
            
            function deactivateElement() {
              if (editorActiveElement) {
                editorActiveElement.classList.remove('editor-active');
                editorActiveElement.contentEditable = false;
                editorActiveElement = null;
              }
              
              // Hide editing panel
              if (editingPanelElement) {
                editingPanelElement.classList.remove('active');
              }
            }
            
            function formatText(command) {
              if (!editorActiveElement) return;
              
              document.execCommand(command, false, null);
              scheduleAutoSave(editorActiveElement);
            }
            
            function changeFontSize(size) {
              if (!editorActiveElement) return;
              
              editorActiveElement.style.fontSize = size + 'px';
              scheduleAutoSave(editorActiveElement);
            }
            
            function changeHeading(level) {
              if (!editorActiveElement || !level) return;
              
              const newElement = document.createElement(level.toLowerCase());
              newElement.innerHTML = editorActiveElement.innerHTML;
              newElement.className = editorActiveElement.className;
              newElement.setAttribute('data-editable', 'true');
              newElement.setAttribute('data-original-text', editorActiveElement.getAttribute('data-original-text'));
              
              // Copy all data attributes
              [...editorActiveElement.attributes].forEach(attr => {
                if (attr.name.startsWith('data-')) {
                  newElement.setAttribute(attr.name, attr.value);
                }
              });
              
              // Copy styles
              newElement.style.cssText = editorActiveElement.style.cssText;
              
              // Replace element
              editorActiveElement.parentNode.replaceChild(newElement, editorActiveElement);
              activateElement(newElement);
            }
            
            function changeColor(color) {
              if (!editorActiveElement) return;
              
              editorActiveElement.style.color = color;
              scheduleAutoSave(editorActiveElement);
            }
            
            function openAIChat() {
              if (!editorActiveElement) return;
              
              const text = editorActiveElement.textContent;
              const message = \`Please help me improve this text: "\${text}"\`;
              
              // Send to parent dashboard
              if (window.parent !== window) {
                window.parent.postMessage({
                  type: 'AI_CHAT_REQUEST',
                  message: message,
                  context: 'inline-editor',
                  elementInfo: {
                    tagName: editorActiveElement.tagName,
                    className: editorActiveElement.className,
                    text: text
                  }
                }, '*');
              }
            }
            
            function scheduleAutoSave(element) {
              if (!isAuthenticated) return;
              
              showSaveStatus(element, 'saving');
              
              if (autoSaveTimeout) {
                clearTimeout(autoSaveTimeout);
              }
              
              autoSaveTimeout = setTimeout(() => {
                autoSaveElement(element);
              }, 1000);
            }
            
            async function autoSaveElement(element) {
              if (!isAuthenticated) return;
              
              const elementId = generateElementId(element);
              const originalContent = element.getAttribute('data-original-text') || '';
              const editedContent = element.textContent || '';
              
              try {
                console.log('💾 Auto-saving element:', elementId);
                
                const response = await fetch('/api/save-page-edit', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    pageId: '${previewId}',
                    elementId: elementId,
                    editType: 'text',
                    originalContent: originalContent,
                    editedContent: editedContent
                  })
                });
                
                if (response.ok) {
                  console.log('✅ Auto-save successful');
                  showSaveStatus(element, 'saved');
                  
                  // Update original text
                  element.setAttribute('data-original-text', editedContent);
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
              // Remove previous status classes
              element.classList.remove('editor-saving', 'editor-saved', 'editor-error');
              
              // Add new status class
              element.classList.add(\`editor-\${status}\`);
              
              // Remove status after 2 seconds
              setTimeout(() => {
                element.classList.remove(\`editor-\${status}\`);
              }, 2000);
            }
            
            function generateElementId(element) {
              const tagName = element.tagName.toLowerCase();
              const className = element.className.replace(/\\s+/g, '-') || 'no-class';
              const textContent = element.textContent.trim().substring(0, 20).replace(/\\s+/g, '-') || 'no-text';
              const index = Array.from(document.querySelectorAll(tagName)).indexOf(element);
              
              return \`\${tagName}-\${className}-\${textContent}-\${index}\`.toLowerCase();
            }
            
            // Initialize when DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initComprehensiveEditor);
            } else {
              initComprehensiveEditor();
            }
            
            // Re-initialize after any React updates
            setTimeout(() => {
              initComprehensiveEditor();
            }, 1000);
            
          })();
        `;
        
        // DISABLED: iframeDoc.head.appendChild(script); // Preventing duplicate editor systems
        console.log('🔧 NewTemplatePreview editor injection DISABLED to prevent double delete buttons');
        
        console.log('✅ Comprehensive inline editor injected');
        
        if (onReady) {
          onReady();
        }
      } catch (error) {
        console.error('❌ Error injecting editor:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [previewId, onReady]);

  return (
    <iframe
      ref={iframeRef}
      src={`/t/v1/${previewId}`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px'
      }}
      title="Template Preview"
    />
  );
};

export default NewTemplatePreview;