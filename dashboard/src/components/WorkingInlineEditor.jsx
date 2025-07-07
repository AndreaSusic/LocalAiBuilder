import React, { useEffect, useRef, useState } from 'react';

const WorkingInlineEditor = ({ previewId }) => {
  console.log('🚀 WorkingInlineEditor STARTING - Only editor system active with previewId:', previewId);
  
  const [activeElement, setActiveElement] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const toolbarRef = useRef(null);

  // Font size options
  const fontSizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32'];

  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) return;

    // CRITICAL: Prevent double initialization with global guard
    if (iframe.contentWindow.__EZ_EDITOR_BRIDGE_LOADED__) {
      console.log('⚠️ Editor bridge already loaded, skipping duplicate initialization');
      return;
    }
    iframe.contentWindow.__EZ_EDITOR_BRIDGE_LOADED__ = true;

    // Save initial state
    saveHistoryState(iframeDoc, 'Initial state');
    
    // Add editor styles to iframe including duplicate button fix
    const style = iframeDoc.createElement('style');
    style.textContent = `
      /* CRITICAL FIX: Hide duplicate delete buttons on navigation menu items */
      li.edit-hoverable > .delete-btn,
      li[data-editable="true"] > .delete-btn {
        display: none !important;
      }
      
      .editor-element {
        position: relative;
        cursor: pointer;
      }
      
      .editor-element:hover {
        outline: 2px dashed #ff0000 !important;
        outline-offset: 2px;
      }
      
      .editor-element.active {
        outline: 2px solid #ffcc00 !important;
        outline-offset: 2px;
      }
      
      .delete-btn {
        position: absolute;
        top: -12px;
        right: -12px;
        width: 24px;
        height: 24px;
        background: #ff4444;
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        display: none;
        cursor: pointer;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .editor-element:hover .delete-btn,
      .editor-element.active .delete-btn {
        display: block;
      }
      
      .delete-btn:hover {
        background: #ff0000;
        transform: scale(1.1);
      }
    `;
    iframeDoc.head.appendChild(style);

    console.log('🚀 WorkingInlineEditor: Starting element processing...');
    
    // Make elements editable
    const editableSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'img', 'button', 'a'];
    let editableCount = 0;
    
    editableSelectors.forEach(selector => {
      const elements = iframeDoc.querySelectorAll(selector);
      elements.forEach(element => {
        // Skip toolbar elements and their children
        if (element.closest('.toolbar') || element.closest('.editor-toolbar')) return;
        
        // CRITICAL: Skip if this element is inside another editable - we only want the outer-most one
        if (element.closest('[data-editable="true"]') !== element) {
          console.log(`⚠️ Skipping nested editable ${element.tagName} - only outer-most elements get delete buttons`);
          return;
        }
        
        // Skip if already has delete button (prevent duplicates from other editors)
        if (element.querySelector('.delete-btn') || element.querySelector('.editor-delete-btn')) {
          console.log(`⚠️ Skipping ${element.tagName} - already has delete button from another editor`);
          return;
        }
        
        // Skip if delete button already injected (safety flag)
        if (element.dataset.deleteBtnInjected) {
          console.log(`⚠️ Skipping ${element.tagName} - delete button already injected`);
          return;
        }
        
        editableCount++;
        
        element.classList.add('editor-element');
        element.setAttribute('contenteditable', element.tagName === 'IMG' ? 'false' : 'true');
        
        // Add delete button (including for images)
        const deleteBtn = iframeDoc.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          saveHistoryState(iframeDoc, 'Delete element');
          element.remove();
          setShowToolbar(false);
          setActiveElement(null);
        };
        
        // Ensure delete button works for all elements including images
        if (element.tagName === 'IMG') {
          element.style.position = 'relative'; // Ensure relative positioning for image containers
          console.log('🖼️ Added delete button to image:', element.src?.slice(0, 50) + '...');
        }
        
        element.appendChild(deleteBtn);
        
        // Mark as injected to prevent duplicates
        element.dataset.deleteBtnInjected = '1';
        
        console.log(`✅ Added delete button to ${element.tagName}${element.className ? '.' + element.className : ''}`);
        
        // Click handler
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          handleElementClick(element, iframeDoc);
        });
      });
    });
    
    console.log(`✅ WorkingInlineEditor: Processed ${editableCount} elements with delete buttons`);

    // Click outside to hide toolbar
    iframeDoc.addEventListener('click', (e) => {
      if (!e.target.closest('.editor-element') && !e.target.closest('.toolbar')) {
        setShowToolbar(false);
        setActiveElement(null);
        setShowFontDropdown(false);
        // Remove active class from all elements
        iframeDoc.querySelectorAll('.editor-element.active').forEach(el => {
          el.classList.remove('active');
        });
      }
    });

    // Keyboard shortcuts
    iframeDoc.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo(iframeDoc);
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo(iframeDoc);
        }
      }
    });

  }, []);

  const handleElementClick = (element, iframeDoc) => {
    // Remove active class from all elements
    iframeDoc.querySelectorAll('.editor-element.active').forEach(el => {
      el.classList.remove('active');
    });
    
    // Add active class to clicked element
    element.classList.add('active');
    setActiveElement(element);
    
    // Position toolbar above element
    const rect = element.getBoundingClientRect();
    const iframe = document.querySelector('iframe');
    const iframeRect = iframe.getBoundingClientRect();
    
    setToolbarPosition({
      x: iframeRect.left + rect.left + (rect.width / 2),
      y: iframeRect.top + rect.top - 60
    });
    
    setShowToolbar(true);
    setShowFontDropdown(false);
    
    // Get current font size
    const computedStyle = iframeDoc.defaultView.getComputedStyle(element);
    const currentFontSize = parseInt(computedStyle.fontSize);
    setFontSize(currentFontSize.toString());
  };

  const saveHistoryState = (iframeDoc, description) => {
    const state = {
      html: iframeDoc.body.innerHTML,
      description,
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = (iframeDoc) => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      iframeDoc.body.innerHTML = state.html;
      setHistoryIndex(newIndex);
      setShowToolbar(false);
      setActiveElement(null);
    }
  };

  const redo = (iframeDoc) => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      iframeDoc.body.innerHTML = state.html;
      setHistoryIndex(newIndex);
      setShowToolbar(false);
      setActiveElement(null);
    }
  };

  const executeCommand = (command, value = null) => {
    const iframe = document.querySelector('iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    if (!activeElement) return;
    
    saveHistoryState(iframeDoc, `Format: ${command}`);
    
    // Focus the element first
    activeElement.focus();
    
    // Execute formatting command
    iframeDoc.execCommand(command, false, value);
  };

  const handleFontSizeChange = (size) => {
    if (activeElement) {
      const iframe = document.querySelector('iframe');
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      saveHistoryState(iframeDoc, `Font size: ${size}px`);
      activeElement.style.fontSize = size + 'px';
      setFontSize(size);
    }
    setShowFontDropdown(false);
  };

  const handleColorChange = (color) => {
    if (activeElement) {
      const iframe = document.querySelector('iframe');
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      saveHistoryState(iframeDoc, `Color: ${color}`);
      activeElement.style.color = color;
    }
  };

  const deleteElement = () => {
    if (activeElement) {
      const iframe = document.querySelector('iframe');
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      saveHistoryState(iframeDoc, 'Delete element');
      activeElement.remove();
      setShowToolbar(false);
      setActiveElement(null);
    }
  };

  // Colors for the palette
  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

  return (
    <>
      {/* Toolbar */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="toolbar editor-toolbar"
          style={{
            position: 'fixed',
            left: toolbarPosition.x - 200,
            top: toolbarPosition.y,
            zIndex: 10000,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            fontSize: '14px',
            minWidth: '400px',
            userSelect: 'none',
            pointerEvents: 'all'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bold */}
          <button
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              background: '#f5f5f5',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => executeCommand('bold')}
          >
            B
          </button>

          {/* Italic */}
          <button
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              background: '#f5f5f5',
              borderRadius: '3px',
              cursor: 'pointer',
              fontStyle: 'italic'
            }}
            onClick={() => executeCommand('italic')}
          >
            I
          </button>

          {/* Underline */}
          <button
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              background: '#f5f5f5',
              borderRadius: '3px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => executeCommand('underline')}
          >
            U
          </button>

          {/* Font Size Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                background: '#f5f5f5',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => setShowFontDropdown(!showFontDropdown)}
            >
              {fontSize}px ▼
            </button>
            {showFontDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  zIndex: 10001,
                  minWidth: '60px'
                }}
              >
                {fontSizes.map(size => (
                  <div
                    key={size}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      background: size === fontSize ? '#e0e0e0' : 'white'
                    }}
                    onClick={() => handleFontSizeChange(size)}
                  >
                    {size}px
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
            {colors.map(color => (
              <div
                key={color}
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: color,
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>

          {/* Delete Button */}
          <button
            style={{
              padding: '4px 8px',
              border: '1px solid #ff4444',
              background: '#ff4444',
              color: 'white',
              borderRadius: '3px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
            onClick={deleteElement}
          >
            Delete
          </button>
        </div>
      )}

      {/* History buttons in right panel */}
      <div style={{ 
        position: 'fixed', 
        right: '20px', 
        top: '100px', 
        zIndex: 9999,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            background: historyIndex > 0 ? '#f5f5f5' : '#e0e0e0',
            borderRadius: '4px',
            cursor: historyIndex > 0 ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            const iframe = document.querySelector('iframe');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            undo(iframeDoc);
          }}
          disabled={historyIndex <= 0}
        >
          ↶ Undo
        </button>
        <button
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            background: historyIndex < history.length - 1 ? '#f5f5f5' : '#e0e0e0',
            borderRadius: '4px',
            cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            const iframe = document.querySelector('iframe');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            redo(iframeDoc);
          }}
          disabled={historyIndex >= history.length - 1}
        >
          ↷ Redo
        </button>
      </div>
    </>
  );
};

export default WorkingInlineEditor;