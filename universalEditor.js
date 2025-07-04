/**
 * UNIVERSAL INLINE EDITOR SYSTEM
 * Makes every element on the page editable with visual feedback
 * Framework-agnostic, works with React, Vue, vanilla HTML
 */

class UniversalEditor {
  constructor() {
    this.activeElement = null;
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
    this.cloudEditor = null;
    this.rightPanel = null;
    this.isInitialized = false;
    
    // Element selectors to make editable
    this.editableSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'div', 'a', 'button',
      'img', 'video', 'iframe',
      'li', 'td', 'th',
      '[data-edit]', '[data-editable]',
      '.title', '.heading', '.text', '.content',
      '.btn', '.button', '.link', '.menu-item',
      '.nav-link', '.dropdown-item'
    ];
    
    this.init();
  }
  
  init() {
    if (this.isInitialized) return;
    
    this.addStyles();
    this.createCloudEditor();
    this.createRightPanel();
    this.makeElementsEditable();
    this.setupEventListeners();
    this.setupHistorySystem();
    this.isInitialized = true;
    
    console.log('🚀 Universal Editor initialized');
  }
  
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Universal Editor Styles */
      .universal-editable {
        position: relative !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      
      .universal-editable:hover {
        outline: 2px dashed #ff4444 !important;
        outline-offset: 2px !important;
      }
      
      .universal-editable.active {
        outline: 3px solid #ffc000 !important;
        outline-offset: 2px !important;
        background: rgba(255, 192, 0, 0.1) !important;
      }
      
      .universal-delete-btn {
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
        line-height: 1 !important;
        display: none !important;
        z-index: 10000 !important;
        font-family: Arial, sans-serif !important;
      }
      
      .universal-editable:hover .universal-delete-btn {
        display: block !important;
      }
      
      .universal-cloud-editor {
        position: absolute !important;
        background: white !important;
        border: 2px solid #ffc000 !important;
        border-radius: 8px !important;
        padding: 8px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        z-index: 10001 !important;
        display: none !important;
        gap: 4px !important;
        flex-wrap: wrap !important;
      }
      
      .universal-cloud-editor.active {
        display: flex !important;
      }
      
      .universal-editor-btn {
        width: 32px !important;
        height: 32px !important;
        border: 1px solid #ddd !important;
        background: white !important;
        cursor: pointer !important;
        border-radius: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 14px !important;
        transition: all 0.2s ease !important;
      }
      
      .universal-editor-btn:hover {
        background: #f0f0f0 !important;
        border-color: #ffc000 !important;
      }
      
      .universal-editor-btn.active {
        background: #ffc000 !important;
        color: white !important;
        border-color: #ffc000 !important;
      }
      
      .universal-right-panel {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: 300px !important;
        height: 100vh !important;
        background: white !important;
        border-left: 2px solid #ffc000 !important;
        padding: 16px !important;
        box-shadow: -4px 0 12px rgba(0,0,0,0.15) !important;
        z-index: 10002 !important;
        display: none !important;
        flex-direction: column !important;
        overflow-y: auto !important;
      }
      
      .universal-right-panel.active {
        display: flex !important;
      }
      
      .universal-panel-header {
        font-size: 18px !important;
        font-weight: bold !important;
        margin-bottom: 16px !important;
        color: #333 !important;
      }
      
      .universal-panel-section {
        margin-bottom: 16px !important;
        padding-bottom: 16px !important;
        border-bottom: 1px solid #eee !important;
      }
      
      .universal-panel-section:last-child {
        border-bottom: none !important;
      }
      
      .universal-panel-label {
        font-size: 14px !important;
        font-weight: 500 !important;
        margin-bottom: 8px !important;
        color: #666 !important;
      }
      
      .universal-toolbar {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 4px !important;
        margin-bottom: 12px !important;
      }
      
      .universal-input {
        width: 100% !important;
        padding: 8px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        font-size: 14px !important;
      }
      
      .universal-color-picker {
        width: 40px !important;
        height: 40px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        padding: 0 !important;
      }
      
      .universal-history-controls {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        display: flex !important;
        gap: 8px !important;
        z-index: 10003 !important;
      }
      
      .universal-history-btn {
        width: 48px !important;
        height: 48px !important;
        border: 2px solid #ffc000 !important;
        background: white !important;
        color: #ffc000 !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        font-size: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
      }
      
      .universal-history-btn:hover {
        background: #ffc000 !important;
        color: white !important;
      }
      
      .universal-history-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  makeElementsEditable() {
    // Remove existing editable elements
    document.querySelectorAll('.universal-editable').forEach(el => {
      el.classList.remove('universal-editable');
      const deleteBtn = el.querySelector('.universal-delete-btn');
      if (deleteBtn) deleteBtn.remove();
    });
    
    // Make all matching elements editable
    this.editableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        // Skip if already processed or is part of editor UI
        if (element.classList.contains('universal-editable') || 
            element.closest('.universal-cloud-editor') ||
            element.closest('.universal-right-panel') ||
            element.closest('.universal-history-controls')) {
          return;
        }
        
        this.makeElementEditable(element);
      });
    });
    
    console.log('✅ Made', document.querySelectorAll('.universal-editable').length, 'elements editable');
  }
  
  makeElementEditable(element) {
    element.classList.add('universal-editable');
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'universal-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete element';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteElement(element);
    };
    element.appendChild(deleteBtn);
    
    // Add click handler
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectElement(element);
    });
    
    // Make text content editable on double-click
    if (this.isTextElement(element)) {
      element.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.enableInlineTextEdit(element);
      });
    }
  }
  
  selectElement(element) {
    // Deactivate previous element
    if (this.activeElement) {
      this.activeElement.classList.remove('active');
    }
    
    // Activate new element
    this.activeElement = element;
    element.classList.add('active');
    
    // Show cloud editor
    this.showCloudEditor(element);
    
    // Show right panel
    this.showRightPanel(element);
    
    console.log('✅ Selected element:', element.tagName, element.textContent?.slice(0, 50));
  }
  
  createCloudEditor() {
    this.cloudEditor = document.createElement('div');
    this.cloudEditor.className = 'universal-cloud-editor';
    
    const buttons = [
      { icon: 'B', title: 'Bold', action: 'bold' },
      { icon: 'I', title: 'Italic', action: 'italic' },
      { icon: 'U', title: 'Underline', action: 'underline' },
      { icon: '🎨', title: 'Color', action: 'color' },
      { icon: '📷', title: 'Image', action: 'image' },
      { icon: '🔗', title: 'Link', action: 'link' },
      { icon: '📝', title: 'Edit', action: 'edit' },
      { icon: '💬', title: 'AI Chat', action: 'ai' }
    ];
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'universal-editor-btn';
      button.innerHTML = btn.icon;
      button.title = btn.title;
      button.onclick = () => this.executeAction(btn.action);
      this.cloudEditor.appendChild(button);
    });
    
    document.body.appendChild(this.cloudEditor);
  }
  
  showCloudEditor(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    this.cloudEditor.style.top = (rect.top + scrollTop - 50) + 'px';
    this.cloudEditor.style.left = (rect.right + scrollLeft + 10) + 'px';
    this.cloudEditor.classList.add('active');
  }
  
  hideCloudEditor() {
    this.cloudEditor.classList.remove('active');
  }
  
  createRightPanel() {
    this.rightPanel = document.createElement('div');
    this.rightPanel.className = 'universal-right-panel';
    
    this.rightPanel.innerHTML = `
      <div class="universal-panel-header">Element Editor</div>
      
      <div class="universal-panel-section">
        <div class="universal-panel-label">Text Formatting</div>
        <div class="universal-toolbar">
          <button class="universal-editor-btn" onclick="universalEditor.executeAction('bold')" title="Bold">B</button>
          <button class="universal-editor-btn" onclick="universalEditor.executeAction('italic')" title="Italic">I</button>
          <button class="universal-editor-btn" onclick="universalEditor.executeAction('underline')" title="Underline">U</button>
          <button class="universal-editor-btn" onclick="universalEditor.executeAction('strikethrough')" title="Strikethrough">S</button>
        </div>
      </div>
      
      <div class="universal-panel-section">
        <div class="universal-panel-label">Text Content</div>
        <textarea class="universal-input" id="universal-text-input" placeholder="Enter text content..." rows="3"></textarea>
        <button class="universal-editor-btn" onclick="universalEditor.updateTextContent()" style="width: 100%; margin-top: 8px;">Update Text</button>
      </div>
      
      <div class="universal-panel-section">
        <div class="universal-panel-label">Colors</div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="color" class="universal-color-picker" id="universal-text-color" title="Text Color">
          <input type="color" class="universal-color-picker" id="universal-bg-color" title="Background Color">
        </div>
        <button class="universal-editor-btn" onclick="universalEditor.applyColors()" style="width: 100%;">Apply Colors</button>
      </div>
      
      <div class="universal-panel-section">
        <div class="universal-panel-label">Element Properties</div>
        <input type="text" class="universal-input" id="universal-class-input" placeholder="CSS Classes" style="margin-bottom: 8px;">
        <input type="text" class="universal-input" id="universal-id-input" placeholder="Element ID" style="margin-bottom: 8px;">
        <button class="universal-editor-btn" onclick="universalEditor.applyProperties()" style="width: 100%;">Apply Properties</button>
      </div>
      
      <div class="universal-panel-section">
        <div class="universal-panel-label">Actions</div>
        <button class="universal-editor-btn" onclick="universalEditor.duplicateElement()" style="width: 100%; margin-bottom: 8px;">Duplicate</button>
        <button class="universal-editor-btn" onclick="universalEditor.deleteElement()" style="width: 100%; background: #ff4444; color: white;">Delete</button>
      </div>
    `;
    
    document.body.appendChild(this.rightPanel);
  }
  
  showRightPanel(element) {
    this.rightPanel.classList.add('active');
    
    // Update panel content based on selected element
    const textInput = document.getElementById('universal-text-input');
    const classInput = document.getElementById('universal-class-input');
    const idInput = document.getElementById('universal-id-input');
    const textColorInput = document.getElementById('universal-text-color');
    const bgColorInput = document.getElementById('universal-bg-color');
    
    if (textInput) textInput.value = this.getElementText(element);
    if (classInput) classInput.value = element.className;
    if (idInput) idInput.value = element.id || '';
    if (textColorInput) textColorInput.value = this.getComputedColor(element, 'color');
    if (bgColorInput) bgColorInput.value = this.getComputedColor(element, 'backgroundColor');
  }
  
  hideRightPanel() {
    this.rightPanel.classList.remove('active');
  }
  
  setupEventListeners() {
    // Click outside to deselect
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.universal-editable') && 
          !e.target.closest('.universal-cloud-editor') && 
          !e.target.closest('.universal-right-panel')) {
        this.deselectElement();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            this.redo();
            break;
          case 'b':
            if (this.activeElement) {
              e.preventDefault();
              this.executeAction('bold');
            }
            break;
          case 'i':
            if (this.activeElement) {
              e.preventDefault();
              this.executeAction('italic');
            }
            break;
        }
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        this.deselectElement();
      }
    });
  }
  
  setupHistorySystem() {
    // Create history controls
    const historyControls = document.createElement('div');
    historyControls.className = 'universal-history-controls';
    historyControls.innerHTML = `
      <button class="universal-history-btn" id="universal-undo-btn" title="Undo (Ctrl+Z)">↶</button>
      <button class="universal-history-btn" id="universal-redo-btn" title="Redo (Ctrl+Y)">↷</button>
    `;
    
    document.body.appendChild(historyControls);
    
    // Add event listeners
    document.getElementById('universal-undo-btn').onclick = () => this.undo();
    document.getElementById('universal-redo-btn').onclick = () => this.redo();
    
    // Save initial state
    this.saveState('Initial state');
  }
  
  saveState(description = 'Edit') {
    const state = {
      html: document.documentElement.outerHTML,
      timestamp: Date.now(),
      description
    };
    
    // Remove future states if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
    
    this.updateHistoryButtons();
    console.log('💾 Saved state:', description);
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
      console.log('↶ Undo:', this.history[this.historyIndex].description);
    }
  }
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
      console.log('↷ Redo:', this.history[this.historyIndex].description);
    }
  }
  
  restoreState(state) {
    document.documentElement.innerHTML = state.html;
    this.isInitialized = false;
    this.activeElement = null;
    
    // Reinitialize editor
    setTimeout(() => {
      this.init();
      this.updateHistoryButtons();
    }, 100);
  }
  
  updateHistoryButtons() {
    const undoBtn = document.getElementById('universal-undo-btn');
    const redoBtn = document.getElementById('universal-redo-btn');
    
    if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
  }
  
  executeAction(action) {
    if (!this.activeElement) return;
    
    switch(action) {
      case 'bold':
        this.toggleFormat('bold');
        break;
      case 'italic':
        this.toggleFormat('italic');
        break;
      case 'underline':
        this.toggleFormat('underline');
        break;
      case 'strikethrough':
        this.toggleFormat('strikethrough');
        break;
      case 'color':
        this.openColorPicker();
        break;
      case 'image':
        this.changeImage();
        break;
      case 'link':
        this.addLink();
        break;
      case 'edit':
        this.enableInlineTextEdit(this.activeElement);
        break;
      case 'ai':
        this.openAIChat();
        break;
    }
  }
  
  toggleFormat(format) {
    if (!this.activeElement) return;
    
    const style = this.activeElement.style;
    switch(format) {
      case 'bold':
        style.fontWeight = style.fontWeight === 'bold' ? 'normal' : 'bold';
        break;
      case 'italic':
        style.fontStyle = style.fontStyle === 'italic' ? 'normal' : 'italic';
        break;
      case 'underline':
        style.textDecoration = style.textDecoration.includes('underline') ? 'none' : 'underline';
        break;
      case 'strikethrough':
        style.textDecoration = style.textDecoration.includes('line-through') ? 'none' : 'line-through';
        break;
    }
    
    this.saveState(`Toggle ${format}`);
  }
  
  enableInlineTextEdit(element) {
    if (!this.isTextElement(element)) return;
    
    const originalText = this.getElementText(element);
    element.contentEditable = true;
    element.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Handle blur
    const handleBlur = () => {
      element.contentEditable = false;
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('keydown', handleKeydown);
      
      if (this.getElementText(element) !== originalText) {
        this.saveState('Edit text');
      }
    };
    
    // Handle Enter key
    const handleKeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        element.blur();
      }
    };
    
    element.addEventListener('blur', handleBlur);
    element.addEventListener('keydown', handleKeydown);
  }
  
  updateTextContent() {
    if (!this.activeElement) return;
    
    const newText = document.getElementById('universal-text-input').value;
    if (this.isTextElement(this.activeElement)) {
      this.activeElement.textContent = newText;
      this.saveState('Update text content');
    }
  }
  
  applyColors() {
    if (!this.activeElement) return;
    
    const textColor = document.getElementById('universal-text-color').value;
    const bgColor = document.getElementById('universal-bg-color').value;
    
    this.activeElement.style.color = textColor;
    this.activeElement.style.backgroundColor = bgColor;
    
    this.saveState('Apply colors');
  }
  
  applyProperties() {
    if (!this.activeElement) return;
    
    const className = document.getElementById('universal-class-input').value;
    const id = document.getElementById('universal-id-input').value;
    
    this.activeElement.className = className;
    this.activeElement.id = id;
    
    this.saveState('Apply properties');
  }
  
  duplicateElement() {
    if (!this.activeElement) return;
    
    const clone = this.activeElement.cloneNode(true);
    this.activeElement.parentNode.insertBefore(clone, this.activeElement.nextSibling);
    this.makeElementEditable(clone);
    this.saveState('Duplicate element');
  }
  
  deleteElement(element = this.activeElement) {
    if (!element) return;
    
    const tagName = element.tagName;
    element.remove();
    
    if (element === this.activeElement) {
      this.deselectElement();
    }
    
    this.saveState(`Delete ${tagName}`);
  }
  
  deselectElement() {
    if (this.activeElement) {
      this.activeElement.classList.remove('active');
      this.activeElement = null;
    }
    
    this.hideCloudEditor();
    this.hideRightPanel();
  }
  
  // Helper methods
  isTextElement(element) {
    const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'A', 'BUTTON', 'LI', 'TD', 'TH'];
    return textTags.includes(element.tagName);
  }
  
  getElementText(element) {
    if (element.tagName === 'IMG') return element.alt || '';
    return element.textContent || element.innerText || '';
  }
  
  getComputedColor(element, property) {
    const style = window.getComputedStyle(element);
    const color = style[property];
    return this.rgbToHex(color) || '#000000';
  }
  
  rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';
    return '#' + result.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }
  
  changeImage() {
    if (!this.activeElement || this.activeElement.tagName !== 'IMG') return;
    
    const newSrc = prompt('Enter new image URL:', this.activeElement.src);
    if (newSrc) {
      this.activeElement.src = newSrc;
      this.saveState('Change image');
    }
  }
  
  addLink() {
    if (!this.activeElement) return;
    
    const url = prompt('Enter URL:');
    if (url) {
      if (this.activeElement.tagName === 'A') {
        this.activeElement.href = url;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.innerHTML = this.activeElement.innerHTML;
        this.activeElement.parentNode.replaceChild(link, this.activeElement);
        this.makeElementEditable(link);
        this.activeElement = link;
      }
      this.saveState('Add link');
    }
  }
  
  openColorPicker() {
    const colorInput = document.getElementById('universal-text-color');
    if (colorInput) {
      colorInput.click();
    }
  }
  
  openAIChat() {
    // Send message to parent frame to open AI chat
    window.parent.postMessage({
      type: 'openAIChat',
      element: this.activeElement.tagName,
      text: this.getElementText(this.activeElement)
    }, '*');
  }
  
  // Public API for external control
  refresh() {
    this.makeElementsEditable();
  }
  
  destroy() {
    document.querySelectorAll('.universal-editable').forEach(el => {
      el.classList.remove('universal-editable', 'active');
      const deleteBtn = el.querySelector('.universal-delete-btn');
      if (deleteBtn) deleteBtn.remove();
    });
    
    if (this.cloudEditor) this.cloudEditor.remove();
    if (this.rightPanel) this.rightPanel.remove();
    
    const historyControls = document.querySelector('.universal-history-controls');
    if (historyControls) historyControls.remove();
    
    this.isInitialized = false;
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.universalEditor = new UniversalEditor();
  
  // Listen for messages from parent frame
  window.addEventListener('message', function(event) {
    if (event.data.type === 'contentChange') {
      const { action, selector, newContent } = event.data;
      
      if (action === 'updateText') {
        const element = document.querySelector(selector);
        if (element) {
          element.textContent = newContent;
          window.universalEditor.saveState('AI content change');
          
          // Add visual feedback
          element.style.background = '#ffc000';
          element.style.transition = 'background 0.3s';
          setTimeout(() => {
            element.style.background = '';
          }, 1000);
        }
      }
    }
  });
}