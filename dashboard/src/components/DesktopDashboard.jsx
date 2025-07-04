import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UnifiedCommandChatPanel from "./UnifiedCommandChatPanel";

// Inject the working inline editor
function injectWorkingEditor(iframe) {
  try {
    console.log('🔧 Injecting working inline editor...');
    
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!frameDoc) {
      console.error('❌ Cannot access iframe document');
      return;
    }
    
    // Remove any existing editor scripts
    const existingScripts = frameDoc.querySelectorAll('[id*="editor"], [id*="bridge"]');
    existingScripts.forEach(script => script.remove());
    
    // Wait for React content to fully load
    setTimeout(() => {
      // Inject the working editor script directly
      const script = frameDoc.createElement('script');
      script.id = 'working-editor-script';
      script.textContent = `
        console.log('🚀 Working inline editor starting...');
        
        let activeElement = null;
        let toolbar = null;
        
        // Simple command execution
        function exec(command, value = null) {
          try {
            document.execCommand(command, false, value);
            console.log('✅ Executed command:', command);
          } catch (error) {
            console.error('Command execution failed:', command, error);
          }
        }
        
        // Add editor styles
        function addEditorStyles() {
          if (document.getElementById('editor-styles')) return;
          
          const style = document.createElement('style');
          style.id = 'editor-styles';
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
            
            .editor-toolbar {
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
              min-width: 300px !important;
              font-family: sans-serif !important;
            }
            
            .editor-btn {
              font: 14px/1 sans-serif !important;
              padding: 6px 10px !important;
              cursor: pointer !important;
              border: 1px solid #333 !important;
              border-radius: 4px !important;
              background: #f8f8f8 !important;
              color: #333 !important;
              font-weight: 500 !important;
            }
            
            .editor-btn:hover {
              background: #e8e8e8 !important;
              border-color: #000 !important;
            }
          \`;
          document.head.appendChild(style);
        }
        
        // Color picker functions
        function pickColor(command) {
          const color = prompt('Enter color (hex, rgb, or name):');
          if (color) {
            exec(command, color);
          }
        }
        
        // Media insertion functions
        function insertMedia(type) {
          if (type === 'image') {
            const url = prompt('Enter image URL:');
            if (url) {
              exec('insertImage', url);
            }
          } else if (type === 'video') {
            const url = prompt('Enter video URL:');
            if (url) {
              const video = \`<video controls src="\${url}" style="max-width:100%"></video>\`;
              exec('insertHTML', video);
            }
          }
        }
        
        // Component insertion functions
        function insertComponent(type) {
          if (type === 'card') {
            const html = '<div style="border:1px solid #ddd;padding:20px;margin:10px;border-radius:8px;"><h3>Card Title</h3><p>Card content goes here...</p></div>';
            exec('insertHTML', html);
          } else if (type === 'button') {
            const text = prompt('Button text:', 'Click me');
            const html = \`<button style="background:#ffc000;color:white;padding:10px 20px;border:none;border-radius:5px;cursor:pointer;">\${text}</button>\`;
            exec('insertHTML', html);
          }
        }
        
        // Toggle functions
        function toggleResizeBox() {
          // Add resize handles to selected element
          if (activeElement) {
            activeElement.style.resize = activeElement.style.resize === 'both' ? 'none' : 'both';
            activeElement.style.overflow = 'auto';
          }
        }
        
        function openSpacingPanel() {
          const margin = prompt('Enter margin (e.g., 10px, 1em):', '10px');
          const padding = prompt('Enter padding (e.g., 10px, 1em):', '10px');
          if (activeElement) {
            if (margin) activeElement.style.margin = margin;
            if (padding) activeElement.style.padding = padding;
          }
        }
        
        function pastePlain() {
          exec('insertText', '');
          document.execCommand('paste');
        }
        
        function toggleCodeView() {
          if (activeElement) {
            const isCode = activeElement.dataset.codeView === 'true';
            if (isCode) {
              activeElement.innerHTML = activeElement.textContent;
              activeElement.dataset.codeView = 'false';
            } else {
              activeElement.textContent = activeElement.innerHTML;
              activeElement.dataset.codeView = 'true';
            }
          }
        }
        
        // Create comprehensive toolbar
        function createEditorToolbar() {
          if (toolbar) return;
          
          toolbar = document.createElement('div');
          toolbar.className = 'editor-toolbar';
          toolbar.contentEditable = false;
          
          const commands = [
            { label: '𝐁', action: () => exec('bold'), title: 'Bold (Ctrl+B)' },
            { label: '𝑰', action: () => exec('italic'), title: 'Italic (Ctrl+I)' },
            { label: '𝑼', action: () => exec('underline'), title: 'Underline (Ctrl+U)' },
            { label: 'List', action: () => exec('insertUnorderedList'), title: 'Bullet List' },
            { label: '10px', action: () => showFontSizeDropdown(), title: 'Font Size' },
            { label: 'A🖌️', action: () => pickColor('foreColor'), title: 'Text Color' },
            { label: '🖍️', action: () => pickColor('hiliteColor'), title: 'Highlight Color' },
            { label: '🖼️', action: () => insertMedia('image'), title: 'Insert Image' },
            { label: '🎥', action: () => insertMedia('video'), title: 'Insert Video' },
            { label: '↔️↕️', action: () => toggleResizeBox(), title: 'Resize Element' },
            { label: '📐', action: () => openSpacingPanel(), title: 'Spacing' },
            { label: 'H₁', action: () => exec('formatBlock','H1'), title: 'Heading 1' },
            { label: '¶', action: () => exec('formatBlock','P'), title: 'Paragraph' },
            { label: '🔲', action: () => insertComponent('card'), title: 'Insert Card' },
            { label: '📋', action: () => pastePlain(), title: 'Paste Plain Text' },
            { label: '</>', action: () => toggleCodeView(), title: 'Code View' },
            { label: '🔘', action: () => insertComponent('button'), title: 'Insert Button' },
            { label: '➕', action: () => addNewElement(), title: 'Add New Element' },
            { label: '🤖', action: () => openAIChat(), title: 'AI Assistant' }
          ];
          
          commands.forEach(cmd => {
            const btn = document.createElement('button');
            btn.className = 'editor-btn';
            btn.textContent = cmd.label;
            btn.title = cmd.title || '';
            btn.contentEditable = false;
            
            btn.addEventListener('mousedown', (e) => e.preventDefault());
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              cmd.action();
            });
            
            toolbar.appendChild(btn);
          });
          
          document.body.appendChild(toolbar);
          console.log('✅ Toolbar created');
        }
        
        // Show toolbar
        function showEditorToolbar(element) {
          if (!toolbar) return;
          
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY - 60;
          const left = rect.left + window.scrollX;
          
          toolbar.style.top = top + 'px';
          toolbar.style.left = left + 'px';
          toolbar.style.display = 'flex';
          
          console.log('✅ Toolbar shown at', top, left);
        }
        
        // Hide toolbar
        function hideEditorToolbar() {
          if (toolbar) {
            toolbar.style.display = 'none';
          }
        }
        
        // Activate element for editing
        function activateElement(element) {
          console.log('🎯 Activating element:', element.tagName, element.textContent.substring(0, 30));
          
          if (activeElement) {
            activeElement.contentEditable = false;
            activeElement = null;
          }
          
          activeElement = element;
          element.contentEditable = true;
          element.focus();
          
          setTimeout(() => showEditorToolbar(element), 10);
        }
        
        // Setup click handlers
        function setupClickHandlers() {
          document.addEventListener('click', function(e) {
            const element = e.target;
            
            if (element.hasAttribute('data-edit') || element.hasAttribute('data-editable')) {
              e.preventDefault();
              e.stopPropagation();
              activateElement(element);
            } else if (!element.closest('.editor-toolbar')) {
              if (activeElement) {
                activeElement.contentEditable = false;
                activeElement = null;
              }
              hideEditorToolbar();
            }
          }, true);
          
          console.log('✅ Click handlers setup');
        }
        
        // Check if we should prevent editing (direct view access)
        function shouldPreventEditing() {
          const currentUrl = window.location.href;
          const isDashboard = currentUrl.includes('/preview') || currentUrl.includes('/dashboard');
          const isDirectAccess = !isDashboard && !window.parent !== window;
          
          return isDirectAccess;
        }
        
        // Font size dropdown
        function showFontSizeDropdown() {
          const dropdown = document.createElement('div');
          dropdown.className = 'font-size-dropdown';
          dropdown.style.cssText = \`
            position: fixed;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          \`;
          
          const sizes = [10, 11, 12, 14, 16, 18];
          sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.textContent = size + 'px';
            btn.style.cssText = \`
              padding: 6px 12px;
              border: none;
              background: transparent;
              cursor: pointer;
              text-align: left;
              border-radius: 4px;
            \`;
            btn.onmouseover = () => btn.style.background = '#f0f0f0';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = () => {
              exec('fontSize', size);
              document.body.removeChild(dropdown);
            };
            dropdown.appendChild(btn);
          });
          
          // Position near toolbar
          const rect = toolbar.getBoundingClientRect();
          dropdown.style.top = (rect.bottom + 5) + 'px';
          dropdown.style.left = rect.left + 'px';
          
          document.body.appendChild(dropdown);
          
          // Close on click outside
          setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
              if (!dropdown.contains(e.target)) {
                document.body.removeChild(dropdown);
                document.removeEventListener('click', closeDropdown);
              }
            });
          }, 100);
        }
        
        // Add new element
        function addNewElement() {
          const elementsMenu = document.createElement('div');
          elementsMenu.className = 'elements-menu';
          elementsMenu.style.cssText = \`
            position: fixed;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 200px;
          \`;
          
          const elements = [
            { label: '📝 Text Block', action: () => insertElement('text') },
            { label: '🔲 Card Section', action: () => insertElement('card') },
            { label: '🔘 Button', action: () => insertElement('button') },
            { label: '🖼️ Image', action: () => insertElement('image') },
            { label: '📋 Contact Form', action: () => insertElement('form') },
            { label: '⭐ Reviews Section', action: () => insertElement('reviews') },
            { label: '📍 Map', action: () => insertElement('map') },
            { label: '📞 Contact Info', action: () => insertElement('contact') }
          ];
          
          elements.forEach(elem => {
            const btn = document.createElement('button');
            btn.textContent = elem.label;
            btn.style.cssText = \`
              padding: 8px 12px;
              border: none;
              background: transparent;
              cursor: pointer;
              text-align: left;
              border-radius: 4px;
            \`;
            btn.onmouseover = () => btn.style.background = '#f0f0f0';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = () => {
              elem.action();
              document.body.removeChild(elementsMenu);
            };
            elementsMenu.appendChild(btn);
          });
          
          // Position near toolbar
          const rect = toolbar.getBoundingClientRect();
          elementsMenu.style.top = (rect.bottom + 5) + 'px';
          elementsMenu.style.left = rect.left + 'px';
          
          document.body.appendChild(elementsMenu);
          
          // Close on click outside
          setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
              if (!elementsMenu.contains(e.target)) {
                document.body.removeChild(elementsMenu);
                document.removeEventListener('click', closeMenu);
              }
            });
          }, 100);
        }
        
        // Insert element
        function insertElement(type) {
          const templates = {
            text: '<p>New text block - click to edit</p>',
            card: '<div class="card" style="border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px;"><h3>Card Title</h3><p>Card content goes here</p></div>',
            button: '<button style="background: #ffc000; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">New Button</button>',
            image: '<img src="https://via.placeholder.com/300x200" alt="New image" style="max-width: 100%; height: auto;">',
            form: '<form style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 10px 0;"><h3>Contact Form</h3><input type="text" placeholder="Name" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;"><input type="email" placeholder="Email" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;"><textarea placeholder="Message" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; height: 100px;"></textarea><button type="submit" style="background: #ffc000; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Send</button></form>',
            reviews: '<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 10px 0;"><h3>Customer Reviews</h3><div style="border-left: 4px solid #ffc000; padding-left: 15px; margin: 10px 0;"><p>"Great service and quality work!"</p><p><strong>- Customer Name</strong></p></div></div>',
            map: '<div style="background: #f0f0f0; padding: 40px; text-align: center; border-radius: 8px; margin: 10px 0;"><p>🗺️ Map placeholder - replace with actual map</p></div>',
            contact: '<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 10px 0;"><h3>Contact Information</h3><p>📞 Phone: (555) 123-4567</p><p>📧 Email: info@business.com</p><p>📍 Address: 123 Main St, City, State</p></div>'
          };
          
          const template = templates[type] || templates.text;
          
          if (activeElement) {
            activeElement.insertAdjacentHTML('afterend', template);
          } else {
            document.body.insertAdjacentHTML('beforeend', template);
          }
          
          saveState(\`Insert \${type} element\`);
        }
        
        // Open AI Chat
        function openAIChat() {
          // Send message to parent dashboard to open AI chat
          window.parent.postMessage({
            type: 'openAIChat',
            selectedElement: activeElement ? {
              tagName: activeElement.tagName,
              textContent: activeElement.textContent,
              className: activeElement.className,
              id: activeElement.id
            } : null
          }, '*');
        }
        
        // Connect to dashboard right panel
        function connectToDashboardPanel() {
          // Send toolbar state to parent
          window.parent.postMessage({
            type: 'toolbarUpdate',
            activeElement: activeElement ? {
              tagName: activeElement.tagName,
              textContent: activeElement.textContent?.substring(0, 50),
              canFormat: true,
              canDelete: true
            } : null
          }, '*');
        }
        
        // Listen for messages from parent dashboard
        window.addEventListener('message', function(event) {
          if (event.data.type === 'contentChange') {
            const { action, selector, newContent } = event.data;
            
            if (action === 'updateText') {
              const element = document.querySelector(selector);
              if (element) {
                element.textContent = newContent;
                saveState('AI content change');
                console.log('✅ Content updated via AI:', selector, newContent);
                
                // Add visual feedback
                element.style.background = '#ffc000';
                element.style.transition = 'background 0.3s';
                setTimeout(() => {
                  element.style.background = '';
                }, 1000);
              }
            }
          } else if (event.data.type === 'keyboardShortcut') {
            const { action } = event.data;
            if (action === 'undo') {
              undo();
            } else if (action === 'redo') {
              redo();
            }
          }
        });
        
        // History system
        let history = [];
        let historyIndex = -1;
        const maxHistory = 50;
        
        function saveState(description = 'Edit') {
          const state = {
            html: document.documentElement.outerHTML,
            timestamp: Date.now(),
            description
          };
          
          if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
          }
          
          history.push(state);
          historyIndex = history.length - 1;
          
          if (history.length > maxHistory) {
            history.shift();
            historyIndex--;
          }
          
          updateHistoryButtons();
        }
        
        function undo() {
          if (historyIndex > 0) {
            historyIndex--;
            restoreState(history[historyIndex]);
          }
        }
        
        function redo() {
          if (historyIndex < history.length - 1) {
            historyIndex++;
            restoreState(history[historyIndex]);
          }
        }
        
        function restoreState(state) {
          document.documentElement.innerHTML = state.html;
          setTimeout(() => {
            initWorkingEditor();
            updateHistoryButtons();
          }, 100);
        }
        
        function updateHistoryButtons() {
          // Send update to parent dashboard
          window.parent.postMessage({
            type: 'historyUpdate',
            canUndo: historyIndex > 0,
            canRedo: historyIndex < history.length - 1
          }, '*');
        }
        
        // Create history controls
        function createHistoryControls() {
          const historyDiv = document.createElement('div');
          historyDiv.style.cssText = \`
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: 10003;
          \`;
          
          const undoBtn = document.createElement('button');
          undoBtn.innerHTML = '↶';
          undoBtn.title = 'Undo';
          undoBtn.style.cssText = \`
            width: 48px;
            height: 48px;
            border: 2px solid #ffc000;
            background: white;
            color: #ffc000;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s ease;
          \`;
          undoBtn.onclick = undo;
          
          const redoBtn = document.createElement('button');
          redoBtn.innerHTML = '↷';
          redoBtn.title = 'Redo';
          redoBtn.style.cssText = undoBtn.style.cssText;
          redoBtn.onclick = redo;
          
          historyDiv.appendChild(undoBtn);
          historyDiv.appendChild(redoBtn);
          document.body.appendChild(historyDiv);
          
          window.undoBtn = undoBtn;
          window.redoBtn = redoBtn;
        }
        
        // Make all elements universally editable
        function makeAllElementsEditable() {
          const selectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div', 'a', 'button',
            'img', 'video', 'iframe',
            'li', 'td', 'th',
            '[data-edit]', '[data-editable]',
            '.title', '.heading', '.text', '.content',
            '.btn', '.button', '.link', '.menu-item',
            '.nav-link', '.dropdown-item'
          ];
          
          let editableCount = 0;
          
          selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
              if (element.closest('.editor-toolbar') || 
                  element.classList.contains('delete-btn') ||
                  element.getAttribute('data-universal-editor') === 'true') {
                return;
              }
              
              makeElementEditable(element);
              editableCount++;
            });
          });
          
          console.log('✅ Made', editableCount, 'elements universally editable');
        }
        
        function makeElementEditable(element) {
          element.setAttribute('data-universal-editor', 'true');
          element.style.cssText += \`
            position: relative !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          \`;
          
          // Add delete button with proper positioning
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.innerHTML = '×';
          deleteBtn.style.cssText = \`
            position: absolute !important;
            top: -10px !important;
            right: -10px !important;
            width: 24px !important;
            height: 24px !important;
            background: #ff4444 !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            font-size: 14px !important;
            font-weight: bold !important;
            line-height: 1 !important;
            display: none !important;
            z-index: 10000 !important;
            font-family: Arial, sans-serif !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
          \`;
          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            const tagName = element.tagName;
            element.remove();
            saveState(\`Delete \${tagName}\`);
          };
          
          // Ensure element has relative positioning for absolute delete button
          if (window.getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
          }
          
          element.appendChild(deleteBtn);
          
          // Add hover effects
          element.addEventListener('mouseenter', () => {
            element.style.outline = '2px dashed #ff4444';
            element.style.outlineOffset = '2px';
            deleteBtn.style.display = 'block';
          });
          
          element.addEventListener('mouseleave', () => {
            if (element !== activeElement) {
              element.style.outline = '';
              element.style.outlineOffset = '';
              deleteBtn.style.display = 'none';
            }
          });
          
          // Add click handler
          element.addEventListener('click', (e) => {
            e.stopPropagation();
            selectElement(element);
          });
          
          // Add double-click for text editing
          if (isTextElement(element)) {
            element.addEventListener('dblclick', (e) => {
              e.stopPropagation();
              enableInlineTextEdit(element);
            });
          }
        }
        
        function selectElement(element) {
          // Don't reselect the same element
          if (activeElement === element) return;
          
          // Deactivate previous
          if (activeElement) {
            activeElement.classList.remove('active');
            activeElement.style.outline = '';
            activeElement.style.background = '';
            const prevDeleteBtn = activeElement.querySelector('.delete-btn');
            if (prevDeleteBtn) prevDeleteBtn.style.display = 'none';
          }
          
          // Activate new
          activeElement = element;
          element.classList.add('active');
          element.style.outline = '3px solid #ffc000';
          element.style.outlineOffset = '2px';
          element.style.background = 'rgba(255, 192, 0, 0.1)';
          
          const deleteBtn = element.querySelector('.delete-btn');
          if (deleteBtn) deleteBtn.style.display = 'block';
          
          // Show toolbar with delay to prevent multiple triggers
          setTimeout(() => showEditorToolbar(element), 50);
          
          // Connect to dashboard panel
          connectToDashboardPanel();
          
          console.log('✅ Selected element:', element.tagName, element.textContent?.substring(0, 30));
        }
        
        function isTextElement(element) {
          const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'A', 'BUTTON', 'LI', 'TD', 'TH'];
          return textTags.includes(element.tagName);
        }
        
        function enableInlineTextEdit(element) {
          if (!isTextElement(element)) return;
          
          const originalText = element.textContent;
          element.contentEditable = true;
          element.focus();
          
          // Select all text
          const range = document.createRange();
          range.selectNodeContents(element);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          
          const handleBlur = () => {
            element.contentEditable = false;
            element.removeEventListener('blur', handleBlur);
            element.removeEventListener('keydown', handleKeydown);
            
            if (element.textContent !== originalText) {
              saveState('Edit text');
            }
          };
          
          const handleKeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              element.blur();
            }
          };
          
          element.addEventListener('blur', handleBlur);
          element.addEventListener('keydown', handleKeydown);
        }
        
        // Initialize editor
        function initWorkingEditor() {
          // Don't initialize editor on direct view access
          if (shouldPreventEditing()) {
            console.log('🚫 Editor disabled - direct view access detected');
            return;
          }
          
          addEditorStyles();
          createEditorToolbar();
          createHistoryControls();
          setupClickHandlers();
          makeAllElementsEditable();
          
          // Save initial state
          saveState('Initial state');
          
          console.log('✅ Universal editor initialized');
        }
        
        // Listen for messages from parent dashboard
        window.addEventListener('message', function(event) {
          if (event.data.type === 'execCommand') {
            exec(event.data.command);
          } else if (event.data.type === 'showFontSizeDropdown') {
            showFontSizeDropdown();
          } else if (event.data.type === 'undo') {
            undo();
          } else if (event.data.type === 'redo') {
            redo();
          }
        });
        
        // Start when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initWorkingEditor);
        } else {
          initWorkingEditor();
        }
      `;
      frameDoc.head.appendChild(script);
      
      console.log('✅ Working editor script injected');
    }, 2000);
  } catch (error) {
    console.error('❌ Error injecting working editor:', error);
  }
}

function DesktopDashboard({ bootstrap }) {
  const navigate = useNavigate();
  const [previewContent, setPreviewContent] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [currentDevice, setCurrentDevice] = useState("Desktop");
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('text');

  useEffect(() => {
    // Listen for messages from preview iframe
    const handleMessage = (event) => {
      if (event.data.type === 'openAIChat') {
        // Focus the AI chat tab and input
        setActiveTab('ai');
        // Auto-populate with context if element is selected
        if (event.data.selectedElement) {
          const context = `Selected: ${event.data.selectedElement.tagName} "${event.data.selectedElement.textContent?.substring(0, 50)}..."`;
          setChatMessage(context + " - ");
        }
      } else if (event.data.type === 'toolbarUpdate') {
        // Update right panel with element info
        console.log('🔗 Toolbar update from iframe:', event.data.activeElement);
      } else if (event.data.type === 'historyUpdate') {
        // Could update undo/redo buttons in dashboard if needed
        console.log('📚 History update:', event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
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
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [bootstrap]);

  const handleIframeLoad = (event) => {
    const iframe = event.target;
    if (iframe && previewContent) {
      // Inject simple editor after iframe loads
      setTimeout(() => {
        injectWorkingEditor(iframe);
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

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isProcessing) return;
    
    const userMessage = chatMessage.trim();
    setChatMessage("");
    setIsProcessing(true);
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      
      // If AI returned a content change instruction, execute it in the iframe
      if (data.contentChange) {
        const iframe = document.querySelector('.preview-iframe');
        if (iframe && iframe.contentWindow) {
          try {
            // Execute DOM changes in the iframe
            const script = `
              const element = document.querySelector('${data.contentChange.selector}');
              if (element) {
                element.textContent = '${data.contentChange.newContent}';
                element.innerHTML = '${data.contentChange.newContent}';
                console.log('✅ Content updated successfully');
              } else {
                console.log('❌ Element not found with selector: ${data.contentChange.selector}');
              }
            `;
            iframe.contentWindow.eval(script);
          } catch (error) {
            console.error('Error executing content change:', error);
          }
        }
      }
      
      // Add AI response to chat history
      setChatHistory(prev => [...prev, { role: 'ai', content: data.message || data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="dashboard-wireframe">
      {/* Header */}
      <header className="header-wireframe">
        <div className="logo-section">
          <a href="/" className="logo-link">
            <img src="https://840478aa-17a3-42f4-b6a7-5f22e27e1019-00-2dw3amqh2cngv.picard.replit.dev/assets/logo-transparent.png" alt="LocalAI Builder" className="dashboard-logo" />
          </a>
        </div>
        
        {/* Main Action Buttons */}
        <div className="header-center">
          <button className="btn-wireframe" onClick={() => window.open('/', '_blank')}>
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

        {/* Language and Device Switchers */}
        <div className="header-switches">
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="language-select"
          >
            <option value="EN">EN</option>
            <option value="SR">SR</option>
          </select>
          
          <select 
            value={currentDevice} 
            onChange={(e) => setCurrentDevice(e.target.value)}
            className="device-select"
          >
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
          </select>
        </div>

        {/* Right Side Actions */}
        <div className="header-actions">
          <div className="credits-info">
            <span className="credits-label">Credits remaining: <strong>25</strong></span>
          </div>
          
          <div className="pages-dropdown">
            <button className="btn-wireframe" onClick={() => console.log('Pages clicked')}>
              Pages ▼
            </button>
          </div>

          <button className="btn-wireframe">🔔</button>

          <button className="btn-wireframe" onClick={() => console.log('Publish clicked')}>
            Publish
          </button>

          <button className="btn-wireframe" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Live Preview Panel */}
        <div className="preview-panel-wireframe">
          <div className="preview-container">
            {previewContent && (
              <iframe
                key={previewContent}
                src={previewContent}
                className={`preview-iframe preview-${currentDevice.toLowerCase()}`}
                onLoad={handleIframeLoad}
                title="Website Preview"
              />
            )}
          </div>
          
          {/* Sticky button at bottom of preview panel */}
          <div className="preview-panel-footer">
            <button 
              className="view-live-btn-mobile" 
              onClick={() => {
                // Use permanent cache ID for Kigen Plastika
                const permanentUrl = `/t/v1/kigen-plastika-default`;
                window.open(permanentUrl, '_blank');
              }}
            >
              View Live Site
            </button>
          </div>
        </div>

        {/* Right Panel - Editor and Chat */}
        <div className="right-panel-wireframe">
          <div className="editor-panel">
            <div className="editor-tabs">
              <button 
                className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} 
                onClick={() => setActiveTab('text')}
              >
                Text
              </button>
              <button 
                className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} 
                onClick={() => setActiveTab('media')}
              >
                Media
              </button>
              <button 
                className={`tab-btn ${activeTab === 'components' ? 'active' : ''}`} 
                onClick={() => setActiveTab('components')}
              >
                Components
              </button>
              <button 
                className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} 
                onClick={() => setActiveTab('ai')}
              >
                AI
              </button>
            </div>
            <div className="editor-content">
              {activeTab === 'text' && (
                <div className="editor-commands">
                  <div className="command-group">
                    <button className="editor-cmd-btn" title="Bold" onClick={() => {
                      const iframe = document.querySelector('.preview-iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({type: 'execCommand', command: 'bold'}, '*');
                      }
                    }}>𝐁</button>
                    <button className="editor-cmd-btn" title="Italic" onClick={() => {
                      const iframe = document.querySelector('.preview-iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({type: 'execCommand', command: 'italic'}, '*');
                      }
                    }}>𝑰</button>
                    <button className="editor-cmd-btn" title="Underline" onClick={() => {
                      const iframe = document.querySelector('.preview-iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({type: 'execCommand', command: 'underline'}, '*');
                      }
                    }}>𝑼</button>
                    <button className="editor-cmd-btn" title="List" onClick={() => {
                      const iframe = document.querySelector('.preview-iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({type: 'execCommand', command: 'insertUnorderedList'}, '*');
                      }
                    }}>List</button>
                    <button className="editor-cmd-btn" title="Font Size" onClick={() => {
                      // Send font size command to iframe
                      const iframe = document.querySelector('.preview-iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({type: 'showFontSizeDropdown'}, '*');
                      }
                    }}>Font Size</button>
                    <button className="editor-cmd-btn" title="Text Color">A🖌️</button>
                    <button className="editor-cmd-btn" title="Highlight">🖍️</button>
                    <button className="editor-cmd-btn" title="Heading">H₁</button>
                    <button className="editor-cmd-btn" title="Paragraph">¶</button>
                    <button className="editor-cmd-btn" title="Paste Plain">📋</button>
                    <button className="editor-cmd-btn" title="Code View">{'</>'}</button>
                  </div>
                </div>
              )}
              {activeTab === 'media' && (
                <div className="editor-commands">
                  <div className="command-group">
                    <button className="editor-cmd-btn" title="Image">🖼️</button>
                    <button className="editor-cmd-btn" title="Video">🎥</button>
                    <button className="editor-cmd-btn" title="Resize">↔️↕️</button>
                    <button className="editor-cmd-btn" title="Spacing">📐</button>
                  </div>
                </div>
              )}
              {activeTab === 'components' && (
                <div className="editor-commands">
                  <div className="command-group">
                    <button className="editor-cmd-btn" title="Card">🔲</button>
                    <button className="editor-cmd-btn" title="Button">🔘</button>
                  </div>
                </div>
              )}
              {activeTab === 'ai' && (
                <div className="ai-chat-section">
                  <div className="chat-history">
                    {chatHistory.map((message, index) => (
                      <div key={index} className={`chat-bubble ${message.role}`}>
                        <div className="bubble-content">
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="chat-bubble ai">
                        <div className="bubble-content">
                          <span className="typing-indicator">●●●</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message to AI... (e.g., 'Change the title to Welcome')"
                      className="chat-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      disabled={isProcessing}
                    />
                    <button 
                      onClick={handleSendMessage} 
                      disabled={isProcessing || !chatMessage.trim()}
                      className="send-btn"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Panel in Right Column */}
          <div className="chat-panel-section">
            <h3>AI Assistant</h3>
            <div className="chat-history">
              {chatHistory.map((message, index) => (
                <div key={index} className={`chat-bubble ${message.role}`}>
                  <div className="bubble-content">
                    {message.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="chat-bubble ai">
                  <div className="bubble-content">
                    <span className="typing-indicator">●●●</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-container">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message to AI..."
                className="chat-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                disabled={isProcessing}
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isProcessing}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesktopDashboard;