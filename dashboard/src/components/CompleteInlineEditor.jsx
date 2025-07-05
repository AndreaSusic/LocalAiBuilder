import React, { useEffect } from 'react';

const CompleteInlineEditor = ({ previewId }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        console.log('🚀 Complete inline editor with all 5 features starting...');
        
        // Global variables
        let activeElement = null;
        let floatingToolbar = null;
        let editHistory = [];
        let historyIndex = -1;
        let isAuthenticated = false;
        let autoSaveTimeout = null;
        
        // Check if we're in read-only mode (View Site pages)
        const isReadOnlyMode = window.location.href.includes('/t/v1/') && 
                               !window.location.href.includes('dashboard');
        
        if (isReadOnlyMode) {
          console.log('📖 Read-only mode detected - editor disabled');
          return; // Exit early for read-only pages
        }
        
        // Initialize complete editor
        function initCompleteEditor() {
          addCompleteEditorStyles();
          makeAllElementsEditable();
          setupCompleteEventListeners();
          createCompleteFloatingToolbar();
          checkAuthStatus();
          console.log('✅ Complete editor with image delete, formatting, undo, font sizes initialized');
        }
        
        function addCompleteEditorStyles() {
          const style = document.createElement('style');
          style.textContent = \`
            /* 1. IMAGE DELETE BUTTONS - Visible on hover and click */
            .editor-hoverable {
              position: relative !important;
              cursor: pointer !important;
              transition: outline 0.2s ease !important;
            }
            
            .editor-hoverable:hover {
              outline: 2px dotted #ff4444 !important;
              outline-offset: 2px !important;
            }
            
            .editor-active {
              outline: 3px solid #ffc000 !important;
              outline-offset: 2px !important;
              background: rgba(255, 192, 0, 0.1) !important;
            }
            
            .editor-delete-btn {
              position: absolute !important;
              top: -10px !important;
              right: -10px !important;
              width: 24px !important;
              height: 24px !important;
              background: #ff4444 !important;
              color: white !important;
              border: 2px solid white !important;
              border-radius: 50% !important;
              cursor: pointer !important;
              font-size: 14px !important;
              font-weight: bold !important;
              z-index: 10001 !important;
              opacity: 0 !important;
              transition: opacity 0.2s ease !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
            }
            
            .editor-hoverable:hover .editor-delete-btn,
            .editor-active .editor-delete-btn {
              opacity: 1 !important;
            }
            
            .editor-delete-btn:hover {
              background: #cc0000 !important;
              transform: scale(1.1) !important;
            }
            
            /* 2. FLOATING TOOLBAR WITH ALL FORMATTING COMMANDS */
            .complete-floating-toolbar {
              position: fixed !important;
              z-index: 10000 !important;
              background: white !important;
              border: 2px solid #ffc000 !important;
              border-radius: 8px !important;
              padding: 12px !important;
              box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
              display: none !important;
              min-width: 480px !important;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
            
            .toolbar-row {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
              margin-bottom: 8px !important;
            }
            
            .toolbar-row:last-child {
              margin-bottom: 0 !important;
            }
            
            .toolbar-btn {
              width: 36px !important;
              height: 36px !important;
              border: 1px solid #ddd !important;
              background: #f8f9fa !important;
              border-radius: 6px !important;
              cursor: pointer !important;
              font-size: 14px !important;
              font-weight: bold !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              transition: all 0.2s ease !important;
            }
            
            .toolbar-btn:hover {
              background: #e9ecef !important;
              border-color: #007bff !important;
            }
            
            .toolbar-btn.active {
              background: #007bff !important;
              color: white !important;
            }
            
            /* 4. FONT SIZE DROPDOWN */
            .font-size-dropdown {
              height: 36px !important;
              border: 1px solid #ddd !important;
              border-radius: 6px !important;
              padding: 6px 12px !important;
              font-size: 14px !important;
              background: white !important;
              cursor: pointer !important;
              min-width: 80px !important;
            }
            
            .font-size-dropdown:hover {
              border-color: #007bff !important;
            }
            
            /* Color palette */
            .color-btn {
              width: 28px !important;
              height: 28px !important;
              border: 2px solid #ddd !important;
              border-radius: 4px !important;
              cursor: pointer !important;
              transition: transform 0.2s ease !important;
            }
            
            .color-btn:hover {
              transform: scale(1.1) !important;
              border-color: #333 !important;
            }
            
            /* 3. UNDO/REDO BUTTONS */
            .history-btn {
              width: 40px !important;
              height: 36px !important;
              border: 1px solid #ddd !important;
              background: #f8f9fa !important;
              border-radius: 6px !important;
              cursor: pointer !important;
              font-size: 16px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .history-btn:disabled {
              opacity: 0.5 !important;
              cursor: not-allowed !important;
            }
            
            .history-btn:not(:disabled):hover {
              background: #e9ecef !important;
              border-color: #007bff !important;
            }
            
            /* Toolbar labels */
            .toolbar-label {
              font-size: 12px !important;
              color: #666 !important;
              margin-right: 8px !important;
              white-space: nowrap !important;
            }
          \`;
          document.head.appendChild(style);
        }
        
        function makeAllElementsEditable() {
          // Make text elements editable
          const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, div, button, a, li';
          const textElements = document.querySelectorAll(textSelectors);
          
          textElements.forEach(element => {
            if (shouldMakeEditable(element)) {
              makeTextElementEditable(element);
            }
          });
          
          // Make images editable with delete buttons  
          const images = document.querySelectorAll('img');
          images.forEach(image => {
            if (shouldMakeEditable(image)) {
              makeImageElementEditable(image);
            }
          });
          
          console.log(\`✅ Made \${textElements.length} text elements and \${images.length} images editable with delete buttons\`);
        }
        
        function shouldMakeEditable(element) {
          // Don't make toolbar elements editable
          if (element.closest('.complete-floating-toolbar')) return false;
          if (element.classList.contains('toolbar-btn')) return false;
          if (element.classList.contains('editor-delete-btn')) return false;
          
          // Don't make script/style elements editable
          if (['SCRIPT', 'STYLE', 'META', 'LINK'].includes(element.tagName)) return false;
          
          // Don't make empty elements editable
          if (element.tagName === 'IMG') return true;
          if (!element.textContent.trim() && element.children.length === 0) return false;
          
          return true;
        }
        
        function makeTextElementEditable(element) {
          element.classList.add('editor-hoverable');
          element.setAttribute('contenteditable', 'false'); // Will be enabled on click
          
          // Add delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '×';
          deleteBtn.className = 'editor-delete-btn';
          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteElement(element);
          };
          element.style.position = 'relative';
          element.appendChild(deleteBtn);
        }
        
        function makeImageElementEditable(element) {
          element.classList.add('editor-hoverable');
          
          // Wrap image in container if not already wrapped
          if (!element.parentElement.style.position) {
            element.parentElement.style.position = 'relative';
          }
          
          // Add delete button for images
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '×';
          deleteBtn.className = 'editor-delete-btn';
          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteElement(element);
          };
          element.parentElement.appendChild(deleteBtn);
        }
        
        function setupCompleteEventListeners() {
          // Click to activate elements
          document.addEventListener('click', handleElementClick);
          
          // Click outside to deactivate
          document.addEventListener('click', handleOutsideClick);
          
          // Keyboard shortcuts for undo/redo
          document.addEventListener('keydown', handleKeyboardShortcuts);
          
          // Text input for auto-save
          document.addEventListener('input', handleTextInput);
        }
        
        function handleElementClick(e) {
          const element = e.target;
          
          // Don't activate toolbar elements
          if (element.closest('.complete-floating-toolbar')) return;
          if (element.classList.contains('editor-delete-btn')) return;
          
          if (element.classList.contains('editor-hoverable')) {
            e.preventDefault();
            e.stopPropagation();
            activateElement(element);
          }
        }
        
        function handleOutsideClick(e) {
          // Only deactivate if clicking outside both active element and toolbar
          if (!e.target.closest('.editor-active') && 
              !e.target.closest('.complete-floating-toolbar')) {
            deactivateElement();
          }
        }
        
        function handleKeyboardShortcuts(e) {
          if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
              e.preventDefault();
              undo();
            } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
              e.preventDefault();
              redo();
            }
          }
        }
        
        function handleTextInput(e) {
          if (e.target.classList.contains('editor-active')) {
            scheduleAutoSave(e.target);
          }
        }
        
        function activateElement(element) {
          // Deactivate previous element
          if (activeElement) {
            deactivateElement();
          }
          
          // Save current state to history
          saveToHistory();
          
          activeElement = element;
          element.classList.add('editor-active');
          
          // Enable contenteditable for text elements
          if (element.tagName !== 'IMG') {
            element.setAttribute('contenteditable', 'true');
            element.focus();
          }
          
          showFloatingToolbar(element);
          console.log(\`🎯 Activated element: \${element.tagName} \${element.textContent?.substring(0, 30) || '[Image]'}\`);
        }
        
        function deactivateElement() {
          if (activeElement) {
            activeElement.classList.remove('editor-active');
            activeElement.setAttribute('contenteditable', 'false');
            activeElement = null;
          }
          hideFloatingToolbar();
        }
        
        function createCompleteFloatingToolbar() {
          floatingToolbar = document.createElement('div');
          floatingToolbar.className = 'complete-floating-toolbar';
          floatingToolbar.innerHTML = \`
            <div class="toolbar-row">
              <span class="toolbar-label">Format:</span>
              <button class="toolbar-btn" onclick="toggleFormat('bold')" title="Bold">B</button>
              <button class="toolbar-btn" onclick="toggleFormat('italic')" title="Italic">I</button>
              <button class="toolbar-btn" onclick="toggleFormat('underline')" title="Underline">U</button>
              
              <span class="toolbar-label">Size:</span>
              <select class="font-size-dropdown" onchange="changeFontSize(this.value)">
                <option value="">Font Size</option>
                <option value="10px">10px</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
              
              <span class="toolbar-label">Heading:</span>
              <select class="font-size-dropdown" onchange="changeHeading(this.value)">
                <option value="">Heading</option>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
                <option value="p">Paragraph</option>
              </select>
            </div>
            
            <div class="toolbar-row">
              <span class="toolbar-label">Colors:</span>
              <button class="color-btn" style="background: #000000" onclick="changeColor('#000000')" title="Black"></button>
              <button class="color-btn" style="background: #ffffff; border-color: #000" onclick="changeColor('#ffffff')" title="White"></button>
              <button class="color-btn" style="background: #ff0000" onclick="changeColor('#ff0000')" title="Red"></button>
              <button class="color-btn" style="background: #00ff00" onclick="changeColor('#00ff00')" title="Green"></button>
              <button class="color-btn" style="background: #0000ff" onclick="changeColor('#0000ff')" title="Blue"></button>
              <button class="color-btn" style="background: #ffc000" onclick="changeColor('#ffc000')" title="Yellow"></button>
              
              <span class="toolbar-label">History:</span>
              <button class="history-btn" onclick="undo()" title="Undo">↶</button>
              <button class="history-btn" onclick="redo()" title="Redo">↷</button>
              
              <button class="toolbar-btn" onclick="deleteCurrentElement()" title="Delete" style="background: #ff4444; color: white;">×</button>
            </div>
          \`;
          document.body.appendChild(floatingToolbar);
        }
        
        function showFloatingToolbar(element) {
          if (!floatingToolbar) return;
          
          const rect = element.getBoundingClientRect();
          floatingToolbar.style.display = 'block';
          floatingToolbar.style.left = Math.max(10, rect.left) + 'px';
          floatingToolbar.style.top = Math.max(10, rect.top - floatingToolbar.offsetHeight - 10) + 'px';
          
          // If toolbar would be off-screen at top, show below element
          if (rect.top - floatingToolbar.offsetHeight < 10) {
            floatingToolbar.style.top = (rect.bottom + 10) + 'px';
          }
        }
        
        function hideFloatingToolbar() {
          if (floatingToolbar) {
            floatingToolbar.style.display = 'none';
          }
        }
        
        // 2. FORMATTING COMMANDS IN POPUP
        window.toggleFormat = function(command) {
          if (!activeElement) return;
          
          try {
            document.execCommand(command, false, null);
            scheduleAutoSave(activeElement);
            console.log(\`✅ Applied formatting: \${command}\`);
          } catch (error) {
            console.error(\`❌ Format command failed: \${command}\`, error);
          }
        };
        
        // 4. FONT SIZE DROPDOWN FUNCTIONALITY
        window.changeFontSize = function(size) {
          if (!activeElement || !size) return;
          
          try {
            if (window.getSelection().toString()) {
              // Apply to selection
              document.execCommand('fontSize', false, '7');
              const fontElements = document.querySelectorAll('font[size="7"]');
              fontElements.forEach(el => {
                el.removeAttribute('size');
                el.style.fontSize = size;
              });
            } else {
              // Apply to whole element
              activeElement.style.fontSize = size;
            }
            scheduleAutoSave(activeElement);
            console.log(\`✅ Changed font size to: \${size}\`);
          } catch (error) {
            console.error(\`❌ Font size change failed: \${size}\`, error);
          }
        };
        
        window.changeHeading = function(tag) {
          if (!activeElement || !tag) return;
          
          try {
            if (activeElement.tagName.toLowerCase() !== tag) {
              const newElement = document.createElement(tag);
              newElement.innerHTML = activeElement.innerHTML;
              newElement.className = activeElement.className;
              activeElement.parentNode.replaceChild(newElement, activeElement);
              activateElement(newElement);
            }
            console.log(\`✅ Changed to heading: \${tag}\`);
          } catch (error) {
            console.error(\`❌ Heading change failed: \${tag}\`, error);
          }
        };
        
        window.changeColor = function(color) {
          if (!activeElement) return;
          
          try {
            if (window.getSelection().toString()) {
              document.execCommand('foreColor', false, color);
            } else {
              activeElement.style.color = color;
            }
            scheduleAutoSave(activeElement);
            console.log(\`✅ Changed color to: \${color}\`);
          } catch (error) {
            console.error(\`❌ Color change failed: \${color}\`, error);
          }
        };
        
        // 1. DELETE FUNCTIONALITY FOR IMAGES AND TEXT
        function deleteElement(element) {
          if (confirm('Are you sure you want to delete this element?')) {
            saveToHistory();
            element.remove();
            if (activeElement === element) {
              activeElement = null;
              hideFloatingToolbar();
            }
            console.log(\`🗑️ Deleted element: \${element.tagName}\`);
          }
        }
        
        window.deleteCurrentElement = function() {
          if (activeElement) {
            deleteElement(activeElement);
          }
        };
        
        // 3. UNDO/REDO FUNCTIONALITY (Technically feasible with DOM snapshots)
        function saveToHistory() {
          const snapshot = document.body.innerHTML;
          editHistory = editHistory.slice(0, historyIndex + 1);
          editHistory.push(snapshot);
          historyIndex++;
          
          // Limit history size
          if (editHistory.length > 50) {
            editHistory.shift();
            historyIndex--;
          }
          
          console.log(\`💾 Saved to history, index: \${historyIndex}\`);
        }
        
        window.undo = function() {
          if (historyIndex > 0) {
            historyIndex--;
            document.body.innerHTML = editHistory[historyIndex];
            makeAllElementsEditable(); // Re-initialize after DOM change
            activeElement = null;
            hideFloatingToolbar();
            console.log(\`↶ Undo applied, index: \${historyIndex}\`);
          }
        };
        
        window.redo = function() {
          if (historyIndex < editHistory.length - 1) {
            historyIndex++;
            document.body.innerHTML = editHistory[historyIndex];
            makeAllElementsEditable(); // Re-initialize after DOM change
            activeElement = null;
            hideFloatingToolbar();
            console.log(\`↷ Redo applied, index: \${historyIndex}\`);
          }
        };
        
        // Auto-save functionality
        function scheduleAutoSave(element) {
          if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          
          autoSaveTimeout = setTimeout(() => {
            autoSaveElement(element);
          }, 1000);
        }
        
        function autoSaveElement(element) {
          if (!isAuthenticated) return;
          
          const elementId = generateElementId(element);
          const content = element.tagName === 'IMG' ? element.src : element.textContent;
          
          fetch('/api/save-page-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              pageId: '${previewId}',
              elementId: elementId,
              editType: element.tagName === 'IMG' ? 'image' : 'text',
              originalContent: { text: content },
              editedContent: { text: content }
            })
          }).then(response => {
            if (response.ok) {
              console.log('💾 Auto-saved:', elementId);
            }
          }).catch(error => {
            console.error('❌ Auto-save failed:', error);
          });
        }
        
        function generateElementId(element) {
          const tagName = element.tagName.toLowerCase();
          const textContent = (element.textContent || '').replace(/[^a-z0-9]/gi, '-').substring(0, 30);
          const className = element.className.replace(/\\s+/g, '-');
          return \`\${tagName}-\${className}-\${textContent}\`.toLowerCase();
        }
        
        function checkAuthStatus() {
          fetch('/api/me')
            .then(response => {
              isAuthenticated = response.ok;
              console.log('🔐 Authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
            })
            .catch(() => {
              isAuthenticated = false;
            });
        }
        
        // Initialize editor after short delay
        setTimeout(() => {
          initCompleteEditor();
        }, 1500);
        
      })();
    `;
    
    document.head.appendChild(script);
    console.log('✅ Complete inline editor script injected');
  }, [previewId]);

  return null; // This component doesn't render anything visible
};

export default CompleteInlineEditor;