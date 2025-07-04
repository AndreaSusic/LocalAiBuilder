import React, { useEffect } from 'react';

const FixedInlineEditor = ({ previewId }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        console.log('🚀 Fixed comprehensive inline editor starting...');
        
        // Global variables
        let editorActiveElement = null;
        let editorToolbar = null;
        let editHistory = [];
        let historyIndex = -1;
        
        // Check if we're in read-only mode (View Site pages)
        const isReadOnlyMode = window.location.href.includes('/t/v1/') && 
                               !window.location.href.includes('dashboard');
        
        if (isReadOnlyMode) {
          console.log('📖 Read-only mode detected - editor disabled');
          return; // Exit early for read-only pages
        }
        
        // Initialize editor
        function initFixedEditor() {
          addEditorStyles();
          makeElementsEditable();
          setupEventListeners();
          createFloatingToolbar();
          console.log('✅ Fixed editor fully initialized');
        }
        
        function addEditorStyles() {
          const style = document.createElement('style');
          style.textContent = \`
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
              top: -8px !important;
              right: -8px !important;
              width: 20px !important;
              height: 20px !important;
              background: #ff4444 !important;
              color: white !important;
              border: none !important;
              border-radius: 50% !important;
              cursor: pointer !important;
              font-size: 12px !important;
              z-index: 10001 !important;
              opacity: 0 !important;
              transition: opacity 0.2s ease !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .editor-hoverable:hover .editor-delete-btn,
            .editor-active .editor-delete-btn {
              opacity: 1 !important;
            }
            
            .floating-editor-toolbar {
              position: fixed !important;
              z-index: 10000 !important;
              background: white !important;
              border: 2px solid #ffc000 !important;
              border-radius: 8px !important;
              padding: 12px !important;
              box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
              display: none !important;
              min-width: 400px !important;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
            }
            
            .toolbar-btn {
              width: 32px !important;
              height: 32px !important;
              border: 1px solid #ddd !important;
              background: #f8f9fa !important;
              border-radius: 4px !important;
              cursor: pointer !important;
              font-size: 14px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            
            .toolbar-btn:hover {
              background: #e9ecef !important;
            }
            
            .toolbar-dropdown {
              height: 32px !important;
              border: 1px solid #ddd !important;
              border-radius: 4px !important;
              padding: 4px 8px !important;
              font-size: 12px !important;
            }
            
            .color-btn {
              width: 24px !important;
              height: 24px !important;
              border: 1px solid #ddd !important;
              border-radius: 4px !important;
              cursor: pointer !important;
            }
          \`;
          document.head.appendChild(style);
        }
        
        function makeElementsEditable() {
          const selectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div:not(.floating-editor-toolbar)', 'a', 'button:not(.toolbar-btn):not(.editor-delete-btn)',
            'img'
          ];
          
          let count = 0;
          selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
              // Skip toolbar elements and already processed elements
              if (element.closest('.floating-editor-toolbar') || 
                  element.classList.contains('editor-hoverable') ||
                  element.tagName === 'SCRIPT' ||
                  element.tagName === 'STYLE') {
                return;
              }
              
              const hasText = element.textContent.trim().length > 0;
              const isImage = element.tagName === 'IMG';
              
              if (hasText || isImage) {
                element.classList.add('editor-hoverable');
                element.setAttribute('data-editable', 'true');
                
                // Add delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'editor-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.onclick = (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // CRITICAL FIX: Prevent deleting toolbar elements
                  if (element.closest('.floating-editor-toolbar')) {
                    console.log('🚫 Cannot delete toolbar elements');
                    return;
                  }
                  if (confirm(\`Delete this \${isImage ? 'image' : 'element'}?\`)) {
                    saveToHistory('Delete element');
                    element.remove();
                  }
                };
                
                element.appendChild(deleteBtn);
                count++;
              }
            });
          });
          
          console.log(\`📍 Made \${count} elements editable\`);
        }
        
        function setupEventListeners() {
          // CRITICAL FIX: Proper outside click handling
          document.addEventListener('click', (e) => {
            // Skip if clicking on toolbar
            if (e.target.closest('.floating-editor-toolbar')) {
              return;
            }
            
            const editableElement = e.target.closest('[data-editable="true"]');
            
            if (editableElement) {
              activateElement(editableElement);
            } else if (editorActiveElement) {
              // CRITICAL FIX: Only deactivate if clicking truly outside
              deactivateElement();
            }
          });
          
          // Keyboard shortcuts
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && editorActiveElement) {
              deactivateElement();
            }
            
            // CRITICAL FIX: Working undo/redo
            if ((e.ctrlKey || e.metaKey) && editorActiveElement) {
              if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoAction();
              } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                e.preventDefault();
                redoAction();
              }
            }
          });
          
          // Auto-save on input
          document.addEventListener('input', (e) => {
            if (e.target.classList.contains('editor-active')) {
              scheduleAutoSave(e.target);
            }
          });
        }
        
        function createFloatingToolbar() {
          const toolbar = document.createElement('div');
          toolbar.className = 'floating-editor-toolbar';
          toolbar.innerHTML = \`
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <!-- CRITICAL FIX: Working formatting buttons -->
              <button class="toolbar-btn" onclick="window.editorFormatText('bold')" title="Bold" style="font-weight: bold;">B</button>
              <button class="toolbar-btn" onclick="window.editorFormatText('italic')" title="Italic" style="font-style: italic;">I</button>
              <button class="toolbar-btn" onclick="window.editorFormatText('underline')" title="Underline" style="text-decoration: underline;">U</button>
              
              <div style="width: 1px; height: 24px; background: #ddd; margin: 0 4px;"></div>
              
              <!-- Font size -->
              <select class="toolbar-dropdown" onchange="window.editorChangeFontSize(this.value)" title="Font Size">
                <option value="">Size</option>
                <option value="10">10px</option>
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="28">28px</option>
                <option value="32">32px</option>
              </select>
              
              <!-- Heading level -->
              <select class="toolbar-dropdown" onchange="window.editorChangeHeading(this.value)" title="Heading">
                <option value="">Heading</option>
                <option value="H1">H1</option>
                <option value="H2">H2</option>
                <option value="H3">H3</option>
                <option value="H4">H4</option>
                <option value="H5">H5</option>
                <option value="H6">H6</option>
              </select>
              
              <div style="width: 1px; height: 24px; background: #ddd; margin: 0 4px;"></div>
              
              <!-- Colors -->
              <div class="color-btn" style="background: #000000;" onclick="window.editorChangeColor('#000000')" title="Black"></div>
              <div class="color-btn" style="background: #666666;" onclick="window.editorChangeColor('#666666')" title="Gray"></div>
              <div class="color-btn" style="background: #ffc000;" onclick="window.editorChangeColor('#ffc000')" title="Yellow"></div>
              <div class="color-btn" style="background: #ff4444;" onclick="window.editorChangeColor('#ff4444')" title="Red"></div>
              <div class="color-btn" style="background: #22c55e;" onclick="window.editorChangeColor('#22c55e')" title="Green"></div>
              <div class="color-btn" style="background: #3b82f6;" onclick="window.editorChangeColor('#3b82f6')" title="Blue"></div>
              
              <div style="width: 1px; height: 24px; background: #ddd; margin: 0 4px;"></div>
              
              <!-- Undo/Redo -->
              <button class="toolbar-btn" onclick="window.editorUndo()" title="Undo">↶</button>
              <button class="toolbar-btn" onclick="window.editorRedo()" title="Redo">↷</button>
              
              <!-- AI -->
              <button class="toolbar-btn" onclick="window.editorOpenAI()" title="AI Help">🤖</button>
            </div>
          \`;
          
          document.body.appendChild(toolbar);
          editorToolbar = toolbar;
        }
        
        function activateElement(element) {
          // Deactivate previous
          if (editorActiveElement) {
            editorActiveElement.classList.remove('editor-active');
            editorActiveElement.contentEditable = false;
          }
          
          // Activate new element
          editorActiveElement = element;
          element.classList.add('editor-active');
          element.contentEditable = true;
          element.focus();
          
          // Position toolbar above element
          showToolbar(element);
          
          console.log(\`🎯 Activated: \${element.tagName} \${element.textContent.slice(0, 30)}\`);
        }
        
        function deactivateElement() {
          if (editorActiveElement) {
            editorActiveElement.classList.remove('editor-active');
            editorActiveElement.contentEditable = false;
            editorActiveElement = null;
          }
          hideToolbar();
        }
        
        function showToolbar(element) {
          if (!editorToolbar) return;
          
          const rect = element.getBoundingClientRect();
          const toolbarHeight = 60; // Estimated toolbar height
          
          let top = rect.top - toolbarHeight - 10;
          let left = rect.left;
          
          // Keep toolbar on screen
          if (top < 10) {
            top = rect.bottom + 10;
          }
          if (left + 400 > window.innerWidth) {
            left = window.innerWidth - 410;
          }
          if (left < 10) {
            left = 10;
          }
          
          editorToolbar.style.display = 'block';
          editorToolbar.style.top = top + 'px';
          editorToolbar.style.left = left + 'px';
        }
        
        function hideToolbar() {
          if (editorToolbar) {
            editorToolbar.style.display = 'none';
          }
        }
        
        // CRITICAL FIX: Working toolbar functions
        window.editorFormatText = function(command) {
          if (!editorActiveElement) return;
          saveToHistory(\`Format: \${command}\`);
          document.execCommand(command, false, null);
          scheduleAutoSave(editorActiveElement);
        };
        
        window.editorChangeFontSize = function(size) {
          if (!editorActiveElement || !size) return;
          saveToHistory(\`Font size: \${size}px\`);
          editorActiveElement.style.fontSize = size + 'px';
          scheduleAutoSave(editorActiveElement);
        };
        
        window.editorChangeHeading = function(heading) {
          if (!editorActiveElement || !heading) return;
          saveToHistory(\`Change to \${heading}\`);
          const newElement = document.createElement(heading.toLowerCase());
          newElement.innerHTML = editorActiveElement.innerHTML;
          newElement.className = editorActiveElement.className;
          newElement.setAttribute('data-editable', 'true');
          editorActiveElement.parentNode.replaceChild(newElement, editorActiveElement);
          activateElement(newElement);
          scheduleAutoSave(newElement);
        };
        
        window.editorChangeColor = function(color) {
          if (!editorActiveElement) return;
          saveToHistory(\`Color: \${color}\`);
          editorActiveElement.style.color = color;
          scheduleAutoSave(editorActiveElement);
        };
        
        // CRITICAL FIX: Working undo/redo
        window.editorUndo = function() {
          undoAction();
        };
        
        window.editorRedo = function() {
          redoAction();
        };
        
        function saveToHistory(action) {
          // Save current state
          const state = {
            action: action,
            html: document.body.innerHTML,
            timestamp: Date.now()
          };
          
          // Remove future history if we're not at the end
          editHistory = editHistory.slice(0, historyIndex + 1);
          editHistory.push(state);
          historyIndex = editHistory.length - 1;
          
          // Limit history size
          if (editHistory.length > 50) {
            editHistory.shift();
            historyIndex--;
          }
          
          console.log(\`💾 Saved to history: \${action}\`);
        }
        
        function undoAction() {
          if (historyIndex > 0) {
            historyIndex--;
            restoreState(editHistory[historyIndex]);
            console.log(\`↶ Undo: \${editHistory[historyIndex].action}\`);
          }
        }
        
        function redoAction() {
          if (historyIndex < editHistory.length - 1) {
            historyIndex++;
            restoreState(editHistory[historyIndex]);
            console.log(\`↷ Redo: \${editHistory[historyIndex].action}\`);
          }
        }
        
        function restoreState(state) {
          const currentElement = editorActiveElement;
          document.body.innerHTML = state.html;
          
          // Reinitialize after restore
          makeElementsEditable();
          createFloatingToolbar();
          
          // Try to reactivate similar element
          if (currentElement) {
            const similar = document.querySelector(\`\${currentElement.tagName}[data-editable="true"]\`);
            if (similar) {
              activateElement(similar);
            }
          }
        }
        
        // CRITICAL FIX: Working AI assistant
        window.editorOpenAI = async function() {
          if (!editorActiveElement) return;
          
          const text = editorActiveElement.textContent;
          const prompt = \`Improve this text for a business website: "\${text}". Make it more professional and engaging. Return only the improved text, no explanation.\`;
          
          try {
            console.log('🤖 AI improving text:', text);
            
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
                saveToHistory('AI improvement');
                editorActiveElement.textContent = improvedText;
                console.log('✅ AI improvement applied:', improvedText);
                scheduleAutoSave(editorActiveElement);
              }
            } else {
              alert('AI assistant is temporarily unavailable');
            }
          } catch (error) {
            console.error('AI error:', error);
            alert('Error connecting to AI assistant');
          }
        };
        
        let autoSaveTimeout = null;
        
        function scheduleAutoSave(element) {
          clearTimeout(autoSaveTimeout);
          autoSaveTimeout = setTimeout(() => {
            autoSaveElement(element);
          }, 1000);
        }
        
        async function autoSaveElement(element) {
          try {
            const elementId = generateElementId(element);
            const response = await fetch('/api/save-page-edit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                pageId: '${previewId || 'default'}',
                elementId: elementId,
                content: element.textContent || element.outerHTML,
                editType: element.tagName === 'IMG' ? 'image' : 'text'
              })
            });
            
            if (response.ok) {
              console.log('✅ Auto-saved successfully');
            } else {
              console.log('❌ Auto-save failed');
            }
          } catch (error) {
            console.error('Auto-save error:', error);
          }
        }
        
        function generateElementId(element) {
          const tag = element.tagName.toLowerCase();
          const text = element.textContent.trim().substring(0, 30).replace(/\\s+/g, '-').toLowerCase();
          const index = Array.from(document.querySelectorAll(tag)).indexOf(element);
          return \`\${tag}-\${text}-\${index}\`;
        }
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initFixedEditor);
        } else {
          initFixedEditor();
        }
        
        // Save initial state
        setTimeout(() => {
          saveToHistory('Initial state');
        }, 1000);
        
      })();
    `;
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [previewId]);

  return null;
};

export default FixedInlineEditor;