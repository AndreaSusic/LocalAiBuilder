import React, { useState, useEffect } from 'react';

const ComprehensiveInlineEditor = ({ previewId }) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingPanel, setEditingPanel] = useState(null);
  const [fontSize, setFontSize] = useState('16');
  const [headingLevel, setHeadingLevel] = useState('H1');

  const fontSizeOptions = ['10', '12', '14', '16', '18', '20', '24', '28', '32'];
  const headingOptions = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        console.log('🚀 Starting comprehensive inline editor...');
        
        // Global variables with unique names
        let editorActiveElement = null;
        let editorToolbar = null;
        let editingPanelElement = null;
        let isEditorEnabled = true;
        
        // Authentication - assume true in dashboard context
        const isDashboardContext = window.location.pathname.includes('/t/v1/') || 
                                   window.location.pathname.includes('/preview') ||
                                   window.parent !== window;
        
        const isAuthenticated = isDashboardContext; // Always true in dashboard
        
        // Initialize editor
        function initComprehensiveEditor() {
          console.log('✅ Comprehensive editor initialization...');
          
          // Add styles
          addEditorStyles();
          
          // Make all elements editable including menu
          makeAllElementsEditable();
          
          // Setup event listeners
          setupEventListeners();
          
          // Create floating toolbar
          createFloatingToolbar();
          
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
            }
            
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
            }
            
            .editor-panel.active {
              display: block;
            }
            
            .editor-panel h3 {
              margin: 0 0 12px 0;
              font-size: 14px;
              color: #333;
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
            'nav a', 'nav span', 'nav div',
            '.menu-item', '.nav-item', '.navbar-brand',
            '[class*="title"]', '[class*="text"]', '[class*="heading"]'
          ];
          
          let editableCount = 0;
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              // Skip if already processed or if it's a script/style element
              if (element.classList.contains('editor-hoverable') || 
                  element.tagName === 'SCRIPT' || 
                  element.tagName === 'STYLE') {
                return;
              }
              
              // Check if element has meaningful text content OR is an image
              const textContent = element.textContent.trim();
              const isImage = element.tagName === 'IMG';
              
              if (textContent.length > 0 || isImage) {
                element.classList.add('editor-hoverable');
                element.setAttribute('data-editable', 'true');
                
                if (isImage) {
                  element.setAttribute('data-edit-type', 'image');
                } else {
                  element.setAttribute('data-edit-type', 'text');
                  element.setAttribute('data-original-text', textContent);
                }
                
                // Add delete button with proper styling
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'editor-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  if (confirm(\`Delete this \${isImage ? 'image' : 'element'}?\`)) {
                    element.remove();
                  }
                };
                
                // For images, ensure proper positioning and visibility
                if (isImage) {
                  // Create a wrapper for the image if needed
                  let wrapper = element.parentElement;
                  if (!wrapper || !wrapper.style.position || wrapper.style.position === 'static') {
                    wrapper = document.createElement('div');
                    wrapper.style.cssText = 'position: relative; display: inline-block;';
                    element.parentNode.insertBefore(wrapper, element);
                    wrapper.appendChild(element);
                  }
                  
                  // Style delete button for images
                  deleteBtn.style.cssText = \`
                    position: absolute !important;
                    top: 8px !important;
                    right: 8px !important;
                    width: 24px !important;
                    height: 24px !important;
                    background: rgba(255, 68, 68, 0.9) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    font-size: 14px !important;
                    line-height: 1 !important;
                    z-index: 10001 !important;
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                  \`;
                  
                  wrapper.appendChild(deleteBtn);
                  
                  // Show/hide delete button on hover
                  const showDeleteBtn = () => {
                    deleteBtn.style.opacity = '1';
                  };
                  const hideDeleteBtn = () => {
                    deleteBtn.style.opacity = '0';
                  };
                  
                  element.addEventListener('mouseenter', showDeleteBtn);
                  element.addEventListener('mouseleave', hideDeleteBtn);
                  wrapper.addEventListener('mouseenter', showDeleteBtn);
                  wrapper.addEventListener('mouseleave', hideDeleteBtn);
                  deleteBtn.addEventListener('mouseenter', showDeleteBtn);
                  
                } else {
                  element.style.position = 'relative';
                  element.appendChild(deleteBtn);
                }
                
                editableCount++;
              }
            });
          });
          
          console.log(\`📍 Made \${editableCount} elements editable including menu items\`);
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
        
        function createFloatingToolbar() {
          const toolbar = document.createElement('div');
          toolbar.className = 'floating-editor-toolbar';
          toolbar.style.cssText = \`
            position: fixed;
            z-index: 10000;
            background: white;
            border: 2px solid #ffc000;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            display: none;
            min-width: 320px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          \`;
          
          toolbar.innerHTML = \`
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <!-- Formatting buttons -->
              <button class="toolbar-btn" onclick="formatText('bold')" title="Bold" style="font-weight: bold; width: 32px; height: 32px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">B</button>
              <button class="toolbar-btn" onclick="formatText('italic')" title="Italic" style="font-style: italic; width: 32px; height: 32px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">I</button>
              <button class="toolbar-btn" onclick="formatText('underline')" title="Underline" style="text-decoration: underline; width: 32px; height: 32px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">U</button>
              
              <!-- Font size dropdown -->
              <select class="toolbar-dropdown" onchange="changeFontSize(this.value)" title="Font Size" style="height: 32px; border: 1px solid #ddd; border-radius: 4px; padding: 4px;">
                <option value="">Size</option>
                \${fontSizeOptions.map(size => \`<option value="\${size}">\${size}px</option>\`).join('')}
              </select>
              
              <!-- Heading dropdown -->
              <select class="toolbar-dropdown" onchange="changeHeading(this.value)" title="Heading" style="height: 32px; border: 1px solid #ddd; border-radius: 4px; padding: 4px;">
                <option value="">Heading</option>
                \${headingOptions.map(h => \`<option value="\${h}">\${h}</option>\`).join('')}
              </select>
              
              <!-- Color buttons -->
              <div style="display: flex; gap: 4px;">
                <div class="color-btn" style="width: 24px; height: 24px; background: #000000; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" onclick="changeColor('#000000')" title="Black"></div>
                <div class="color-btn" style="width: 24px; height: 24px; background: #666666; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" onclick="changeColor('#666666')" title="Gray"></div>
                <div class="color-btn" style="width: 24px; height: 24px; background: #ffc000; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" onclick="changeColor('#ffc000')" title="Yellow"></div>
                <div class="color-btn" style="width: 24px; height: 24px; background: #ff4444; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" onclick="changeColor('#ff4444')" title="Red"></div>
                <div class="color-btn" style="width: 24px; height: 24px; background: #22c55e; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" onclick="changeColor('#22c55e')" title="Green"></div>
                <div class="color-btn" style="width: 24px; height: 24px; background: #3b82f6; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" onclick="changeColor('#3b82f6')" title="Blue"></div>
              </div>
              
              <!-- AI button -->
              <button class="toolbar-btn" onclick="openAIChat()" title="AI Help" style="width: 32px; height: 32px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">🤖</button>
            </div>
          \`;
          
          document.body.appendChild(toolbar);
          editingPanelElement = toolbar;
          
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
          
          // Show floating toolbar positioned near element
          if (editingPanelElement) {
            const rect = element.getBoundingClientRect();
            editingPanelElement.style.display = 'block';
            editingPanelElement.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
            editingPanelElement.style.top = (rect.top - 60) + 'px';
            
            // Update dropdown values based on current element
            const fontSize = window.getComputedStyle(element).fontSize;
            const fontSizeValue = parseInt(fontSize);
            const fontSizeSelect = editingPanelElement.querySelector('.toolbar-dropdown');
            if (fontSizeSelect) {
              fontSizeSelect.value = fontSizeValue;
            }
            
            // Update heading level
            const headingSelect = editingPanelElement.querySelectorAll('.toolbar-dropdown')[1];
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
          
          // Hide floating toolbar
          if (editingPanelElement) {
            editingPanelElement.style.display = 'none';
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
          if (!editorActiveElement) return;
          
          const newElement = document.createElement(level.toLowerCase());
          newElement.innerHTML = editorActiveElement.innerHTML;
          newElement.className = editorActiveElement.className;
          newElement.setAttribute('data-editable', 'true');
          
          // Copy all data attributes
          [...editorActiveElement.attributes].forEach(attr => {
            if (attr.name.startsWith('data-')) {
              newElement.setAttribute(attr.name, attr.value);
            }
          });
          
          editorActiveElement.parentNode.replaceChild(newElement, editorActiveElement);
          activateElement(newElement);
        }
        
        function changeColor(color) {
          if (!editorActiveElement) return;
          
          editorActiveElement.style.color = color;
          scheduleAutoSave(editorActiveElement);
        }
        
        async function openAIChat() {
          if (!editorActiveElement) return;
          
          const text = editorActiveElement.textContent;
          const prompt = \`Improve this text for a business website: "\${text}". Make it more professional and engaging. Return only the improved text, no explanation.\`;
          
          try {
            console.log('🤖 Requesting AI improvement for:', text);
            
            const response = await fetch('/api/ai-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                message: prompt,
                stream: false
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              const improvedText = data.response.trim();
              
              if (improvedText && improvedText !== text) {
                // Apply the AI improvement directly
                editorActiveElement.textContent = improvedText;
                console.log('✅ AI improvement applied:', improvedText);
                
                // Save the change
                scheduleAutoSave(editorActiveElement);
                
                // Log the AI completion
                fetch('/api/ai-completion-log', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    action: 'AI text improvement',
                    originalText: text,
                    improvedText: improvedText,
                    element: editorActiveElement.tagName
                  })
                });
              }
            } else {
              console.error('AI request failed:', response.status);
              alert('AI assistant is temporarily unavailable');
            }
          } catch (error) {
            console.error('AI request error:', error);
            alert('Error connecting to AI assistant');
          }
        }
        
        let autoSaveTimeout = null;
        
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
        setTimeout(initComprehensiveEditor, 1000);
        
      })();
    `;
    
    // Inject the script into the iframe
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
      iframe.contentDocument.head.appendChild(script);
    }
  }, [previewId]);

  return null; // This component doesn't render anything
};

export default ComprehensiveInlineEditor;