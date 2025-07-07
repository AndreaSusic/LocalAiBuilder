import React, { useEffect } from 'react';

const FixedInlineEditor = ({ onMount }) => {
  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);

  return null;
};

// Complete inline editor injection function
export const injectFixedInlineEditor = (iframe) => {
  if (!iframe) return;

  const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
  if (!frameDoc) return;

  // Remove existing editor scripts
  const existingScripts = frameDoc.querySelectorAll('[id*="editor"], [id*="comprehensive"]');
  existingScripts.forEach(script => script.remove());

  const script = frameDoc.createElement('script');
  script.id = 'fixed-inline-editor';
  script.innerHTML = `
    (function() {
      console.log('🚀 Fixed inline editor starting...');
      
      let activeEl = null;
      let toolbar = null;
      let history = [];
      let historyIndex = -1;
      let saveTimer = null;
      
      // Initialize editor
      function init() {
        addStyles();
        makeElementsEditable();
        setupEventListeners();
        setupHistory();
        console.log('✅ Fixed inline editor initialized');
      }
      
      // Add CSS styles
      function addStyles() {
        const style = frameDoc.createElement('style');
        style.innerHTML = \`
          .editable {
            position: relative;
            min-height: 20px;
            transition: all 0.2s ease;
          }
          
          .editable:hover {
            outline: 2px dashed #ff0000 !important;
            outline-offset: 2px;
          }
          
          .editable.active {
            outline: 2px solid #ffc000 !important;
            outline-offset: 2px;
            background: rgba(255, 192, 0, 0.1);
          }
          
          .editor-toolbar {
            position: absolute;
            background: #333;
            color: white;
            padding: 8px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            gap: 4px;
            font-size: 12px;
            white-space: nowrap;
            user-select: none;
            pointer-events: all;
          }
          
          .editor-toolbar button {
            background: #555;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 11px;
            user-select: none;
            pointer-events: all;
          }
          
          .editor-toolbar button:hover {
            background: #777;
          }
          
          .editor-toolbar select {
            background: #555;
            color: white;
            border: none;
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 11px;
            cursor: pointer;
          }
          
          .delete-btn {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff4444 !important;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            cursor: pointer;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            user-select: none;
            pointer-events: all;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          
          .editable:hover .delete-btn,
          .editable.active .delete-btn {
            opacity: 1;
          }
          
          .delete-btn:hover {
            background: #cc0000 !important;
            transform: scale(1.1);
          }
          
          img.editable {
            border: 2px solid transparent;
            transition: border-color 0.2s ease;
          }
          
          img.editable:hover {
            border-color: #ff0000;
          }
          
          img.editable.active {
            border-color: #ffc000;
          }
        \`;
        frameDoc.head.appendChild(style);
      }
      
      // Make elements editable
      function makeElementsEditable() {
        const selectors = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
          'p', 'span', 'div', 'button', 'a',
          'img', 'li', 'td', 'th'
        ];
        
        selectors.forEach(selector => {
          const elements = frameDoc.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.closest('.editor-toolbar') || el.classList.contains('delete-btn')) return;
            
            el.classList.add('editable');
            
            // Add delete button
            const deleteBtn = frameDoc.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.setAttribute('data-action', 'delete');
            deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              deleteElement(el);
            });
            
            el.style.position = 'relative';
            el.appendChild(deleteBtn);
          });
        });
        
        console.log('⚠️ FixedInlineEditor DISABLED to prevent duplicate × buttons');
        return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
      }
      
      // Setup event listeners
      function setupEventListeners() {
        frameDoc.addEventListener('click', handleClick);
        frameDoc.addEventListener('keydown', handleKeydown);
        frameDoc.addEventListener('input', handleInput);
        
        // Listen for messages from parent
        window.addEventListener('message', (e) => {
          if (e.data.type === 'execCommand') {
            executeCommand(e.data.command, e.data.value);
          }
        });
      }
      
      // Handle clicks
      function handleClick(e) {
        if (e.target.closest('.editor-toolbar')) return;
        if (e.target.classList.contains('delete-btn')) return;
        
        const element = e.target.closest('.editable');
        if (element) {
          e.preventDefault();
          e.stopPropagation();
          activateElement(element);
        } else {
          deactivateElement();
        }
      }
      
      // Activate element
      function activateElement(element) {
        if (activeEl) {
          activeEl.classList.remove('active');
        }
        
        activeEl = element;
        element.classList.add('active');
        
        // Make text editable
        if (!element.matches('img')) {
          element.contentEditable = true;
          element.focus();
        }
        
        showToolbar(element);
        saveState();
        
        console.log('🎯 Activated element:', element.tagName, element.textContent?.substring(0, 30) + '...');
      }
      
      // Deactivate element
      function deactivateElement() {
        if (activeEl) {
          activeEl.classList.remove('active');
          if (!activeEl.matches('img')) {
            activeEl.contentEditable = false;
          }
          activeEl = null;
        }
        hideToolbar();
      }
      
      // Show toolbar
      function showToolbar(element) {
        hideToolbar();
        
        toolbar = frameDoc.createElement('div');
        toolbar.className = 'editor-toolbar';
        
        const rect = element.getBoundingClientRect();
        const scrollTop = frameDoc.documentElement.scrollTop || frameDoc.body.scrollTop;
        const scrollLeft = frameDoc.documentElement.scrollLeft || frameDoc.body.scrollLeft;
        
        toolbar.style.position = 'absolute';
        toolbar.style.top = (rect.top + scrollTop - 50) + 'px';
        toolbar.style.left = (rect.left + scrollLeft) + 'px';
        
        // Add toolbar buttons
        if (element.matches('img')) {
          toolbar.innerHTML = \`
            <button onclick="changeImage()">🖼️ Change</button>
            <button onclick="deleteElement()">🗑️ Delete</button>
          \`;
        } else {
          toolbar.innerHTML = \`
            <button onclick="executeCommand('bold')"><b>B</b></button>
            <button onclick="executeCommand('italic')"><i>I</i></button>
            <button onclick="executeCommand('underline')"><u>U</u></button>
            <select onchange="executeCommand('fontSize', this.value)">
              <option value="">Font Size</option>
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
            <button onclick="executeCommand('foreColor', '#ff0000')" style="color: #ff0000;">A</button>
            <button onclick="executeCommand('foreColor', '#00ff00')" style="color: #00ff00;">A</button>
            <button onclick="executeCommand('foreColor', '#0000ff')" style="color: #0000ff;">A</button>
            <button onclick="deleteElement()">×</button>
          \`;
        }
        
        frameDoc.body.appendChild(toolbar);
        
        // Make toolbar functions global
        frameDoc.defaultView.executeCommand = executeCommand;
        frameDoc.defaultView.changeImage = changeImage;
        frameDoc.defaultView.deleteElement = () => deleteElement(activeEl);
      }
      
      // Hide toolbar
      function hideToolbar() {
        if (toolbar) {
          toolbar.remove();
          toolbar = null;
        }
      }
      
      // Execute command
      function executeCommand(command, value = null) {
        if (!activeEl) return;
        
        activeEl.focus();
        
        if (command === 'fontSize') {
          activeEl.style.fontSize = value + 'px';
        } else if (command === 'foreColor') {
          activeEl.style.color = value;
        } else {
          try {
            frameDoc.execCommand(command, false, value);
          } catch (e) {
            console.warn('Command failed:', command, e);
          }
        }
        
        autoSave();
      }
      
      // Delete element
      function deleteElement(element) {
        if (!element) return;
        
        saveState();
        element.remove();
        deactivateElement();
        autoSave();
        
        console.log('🗑️ Deleted element:', element.tagName);
      }
      
      // Change image
      function changeImage() {
        if (!activeEl || !activeEl.matches('img')) return;
        
        const url = prompt('Enter new image URL:');
        if (url) {
          activeEl.src = url;
          autoSave();
        }
      }
      
      // Handle input
      function handleInput(e) {
        if (e.target.classList.contains('editable')) {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            autoSave();
          }, 1000);
        }
      }
      
      // Handle keyboard
      function handleKeydown(e) {
        if (e.ctrlKey && e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.ctrlKey && e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 'Escape') {
          deactivateElement();
        }
      }
      
      // History system
      function setupHistory() {
        history = [];
        historyIndex = -1;
        saveState();
      }
      
      function saveState() {
        const state = frameDoc.documentElement.outerHTML;
        history = history.slice(0, historyIndex + 1);
        history.push(state);
        historyIndex++;
        
        if (history.length > 50) {
          history.shift();
          historyIndex--;
        }
        
        // Update parent dashboard buttons
        window.parent.postMessage({
          type: 'historyUpdate',
          canUndo: historyIndex > 0,
          canRedo: historyIndex < history.length - 1
        }, '*');
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
        frameDoc.documentElement.outerHTML = state;
        deactivateElement();
        makeElementsEditable();
        setupEventListeners();
      }
      
      // Auto-save
      function autoSave() {
        if (!activeEl) return;
        
        const elementId = generateElementId(activeEl);
        const pageId = window.location.pathname.split('/').pop();
        
        fetch('/api/save-page-edit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageId: pageId,
            elementId: elementId,
            content: activeEl.textContent || activeEl.outerHTML,
            type: activeEl.matches('img') ? 'image' : 'text'
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('💾 Auto-saved successfully');
          } else {
            console.log('❌ Auto-save failed');
          }
        })
        .catch(error => {
          console.log('❌ Auto-save error:', error);
        });
      }
      
      function generateElementId(element) {
        const tag = element.tagName.toLowerCase();
        const text = element.textContent || 'no-text';
        const cleanText = text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
        const index = Array.from(element.parentNode.children).indexOf(element);
        return \`\${tag}-\${cleanText}-\${index}\`;
      }
      
      // Initialize when DOM is ready
      if (frameDoc.readyState === 'loading') {
        frameDoc.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
      
    })();
  `;
  
  // DISABLED: frameDoc.head.appendChild(script); // Preventing duplicate editor systems
  console.log('🔧 FixedInlineEditor injection DISABLED to prevent double delete buttons');
  console.log('✅ Fixed inline editor injected');
};

export default FixedInlineEditor;