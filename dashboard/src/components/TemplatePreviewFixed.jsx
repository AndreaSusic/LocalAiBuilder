import { useEffect, useRef } from "react";

console.log("######## I AM TP at", import.meta.url);

const TemplatePreviewFixed = ({ previewId, onReady }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const frameDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        if (!frameDoc) return;

        console.log(
          "⚠️ TemplatePreviewFixed editor DISABLED to prevent duplicate × buttons",
        );
        return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS

        // Wait for React content to load
        setTimeout(() => {
          // Create comprehensive inline editor script
          const script = frameDoc.createElement("script");
          script.innerHTML = `
            (function() {
              console.log('🚀 Starting comprehensive inline editor...');
              
              // Variables with unique names
              let activeEditElement = null;
              let editPanel = null;
              let saveTimer = null;
              const pageId = '${previewId}';
              
              // Font and heading options
              const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32'];
              const headings = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
              
              // Add comprehensive styles
              function addStyles() {
                const style = document.createElement('style');
                style.textContent = \`
                  .edit-hover {
                    position: relative;
                    transition: outline 0.2s ease;
                  }
                  
                  .edit-hover:hover {
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
                  
                  .edit-hover:hover .delete-btn,
                  .edit-active .delete-btn {
                    display: block;
                  }
                  
                  .edit-panel {
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
                  
                  .edit-panel.show {
                    display: block;
                  }
                  
                  .edit-panel h3 {
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
                    margin-bottom: 12px;
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
                  
                  .dropdown-ctrl {
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
                    outline-offset: 2px;
                  }
                  
                  .save-progress {
                    outline: 2px solid #ffc000 !important;
                    outline-offset: 2px;
                  }
                  
                  .save-error {
                    outline: 2px solid #ff4444 !important;
                    outline-offset: 2px;
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
                    if (element.classList.contains('edit-hover') || 
                        element.tagName === 'SCRIPT' || 
                        element.tagName === 'STYLE' ||
                        element.classList.contains('delete-btn') ||
                        element.classList.contains('edit-panel')) {
                      return;
                    }
                    
                    const text = element.textContent.trim();
                    if (text.length > 0) {
                      element.classList.add('edit-hover');
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
                
                console.log('⚠️ TemplatePreviewFixed editor DISABLED to prevent duplicate × buttons');
                return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
              }
              
              // Create editing panel with font size icons
              function createEditPanel() {
                const panel = document.createElement('div');
                panel.className = 'edit-panel';
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
                    <select class="dropdown-ctrl" onchange="changeFontSize(this.value)" id="fontSizeSelect">
                      \${fontSizes.map(size => \`<option value="\${size}">\${size}px</option>\`).join('')}
                    </select>
                    
                    <label>Heading Level:</label>
                    <select class="dropdown-ctrl" onchange="changeHeading(this.value)" id="headingSelect">
                      <option value="">Keep current</option>
                      \${headings.map(h => \`<option value="\${h}">\${h}</option>\`).join('')}
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
                editPanel = panel;
                
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
                  if (e.key === 'Escape' && activeEditElement) {
                    deactivateElement();
                  }
                });
              }
              
              function activateElement(element) {
                console.log('🎯 Activating element:', element.tagName, element.textContent.substring(0, 30));
                
                if (activeEditElement) {
                  deactivateElement();
                }
                
                activeEditElement = element;
                element.classList.add('edit-active');
                element.contentEditable = true;
                
                if (editPanel) {
                  editPanel.classList.add('show');
                  
                  // Update font size dropdown
                  const fontSize = window.getComputedStyle(element).fontSize;
                  const fontSizeValue = parseInt(fontSize);
                  const fontSelect = editPanel.querySelector('#fontSizeSelect');
                  if (fontSelect) {
                    fontSelect.value = fontSizeValue;
                  }
                  
                  // Update heading dropdown
                  const headingSelect = editPanel.querySelector('#headingSelect');
                  if (headingSelect && element.tagName.match(/H[1-6]/)) {
                    headingSelect.value = element.tagName;
                  }
                }
                
                element.focus();
                scheduleAutoSave(element);
              }
              
              function deactivateElement() {
                if (activeEditElement) {
                  activeEditElement.classList.remove('edit-active');
                  activeEditElement.contentEditable = false;
                  activeEditElement = null;
                }
                
                if (editPanel) {
                  editPanel.classList.remove('show');
                }
              }
              
              function formatText(command) {
                if (!activeEditElement) return;
                document.execCommand(command, false, null);
                scheduleAutoSave(activeEditElement);
              }
              
              function changeFontSize(size) {
                if (!activeEditElement) return;
                activeEditElement.style.fontSize = size + 'px';
                scheduleAutoSave(activeEditElement);
              }
              
              function changeHeading(level) {
                if (!activeEditElement || !level) return;
                
                const newEl = document.createElement(level.toLowerCase());
                newEl.innerHTML = activeEditElement.innerHTML;
                newEl.className = activeEditElement.className;
                newEl.setAttribute('data-editable', 'true');
                newEl.setAttribute('data-original', activeEditElement.getAttribute('data-original'));
                newEl.style.cssText = activeEditElement.style.cssText;
                
                activeEditElement.parentNode.replaceChild(newEl, activeEditElement);
                activateElement(newEl);
              }
              
              function changeColor(color) {
                if (!activeEditElement) return;
                activeEditElement.style.color = color;
                scheduleAutoSave(activeEditElement);
              }
              
              function openAIHelp() {
                if (!activeEditElement) return;
                
                const text = activeEditElement.textContent;
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
                
                if (saveTimer) {
                  clearTimeout(saveTimer);
                }
                
                saveTimer = setTimeout(() => {
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
              
              // Initialize
              function init() {
                addStyles();
                makeElementsEditable();
                createEditPanel();
                setupEventListeners();
                console.log('✅ Comprehensive editor initialized');
              }
              
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
              } else {
                init();
              }
              
              setTimeout(init, 1000);
            })();
          `;

          // DISABLED: frameDoc.head.appendChild(script); // Preventing duplicate editor systems
          console.log(
            "🔧 TemplatePreviewFixed editor injection DISABLED to prevent double delete buttons",
          );
          console.log("✅ Comprehensive editor injected");

          if (onReady) onReady();
        }, 1000);
      } catch (error) {
        console.error("❌ Error injecting editor:", error);
      }
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [previewId, onReady]);

  return (
    <iframe
      ref={iframeRef}
      src={`/t/v1/${previewId}`}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        borderRadius: "8px",
      }}
      title="Template Preview"
    />
  );
};

export default TemplatePreviewFixed;
