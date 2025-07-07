import React, { useState } from 'react';

const EditorPanel = () => {
  const [activeElement, setActiveElement] = useState(null);

  // Execute formatting command on iframe content
  const executeCommand = (command, value = null) => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc) return;

    // Get the currently selected/active element
    const activeEl = iframeDoc.querySelector('.editor-element.active');
    if (!activeEl) return;

    // Focus the element first
    activeEl.focus();

    // For font size, apply directly to element style
    if (command === 'fontSize') {
      activeEl.style.fontSize = value + 'px';
      return;
    }

    // For heading changes
    if (command === 'formatBlock') {
      const newTag = document.createElement(value.toLowerCase());
      newTag.innerHTML = activeEl.innerHTML;
      newTag.className = activeEl.className;
      newTag.style.cssText = activeEl.style.cssText;
      activeEl.parentNode.replaceChild(newTag, activeEl);
      return;
    }

    // For other formatting commands
    try {
      iframeDoc.execCommand(command, false, value);
    } catch (e) {
      console.warn('Command not supported:', command);
    }
  };

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32];
  const headings = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

  return (
    <div className="editor-panel-container" style={{
      padding: '20px',
      borderLeft: '1px solid #e0e0e0',
      background: '#f9f9f9',
      minHeight: '100vh'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Text Editor</h3>
      
      {/* Formatting Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Formatting</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => executeCommand('bold')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            B
          </button>
          <button
            onClick={() => executeCommand('italic')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontStyle: 'italic'
            }}
          >
            I
          </button>
          <button
            onClick={() => executeCommand('underline')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            U
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Font Size</h4>
        <select
          onChange={(e) => executeCommand('fontSize', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff'
          }}
        >
          <option value="">Select Size</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
      </div>

      {/* Heading Level */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Heading Level</h4>
        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff'
          }}
        >
          <option value="">Select Level</option>
          {headings.map(heading => (
            <option key={heading} value={heading}>{heading}</option>
          ))}
        </select>
      </div>

      {/* Lists */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Lists</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => executeCommand('insertUnorderedList')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            • List
          </button>
          <button
            onClick={() => executeCommand('insertOrderedList')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            1. List
          </button>
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Text Color</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map(color => (
            <button
              key={color}
              onClick={() => executeCommand('foreColor', color)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: color,
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;