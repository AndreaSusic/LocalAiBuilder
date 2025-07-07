import React, { useState } from 'react';

const EditorPanel = () => {
  const [activeElement, setActiveElement] = useState(null);

  // Execute formatting command on iframe content
  const executeCommand = (command, value = null) => {
    const iframe = document.querySelector('.preview-iframe');
    if (!iframe || !iframe.contentWindow) return;

    // Send command to iframe via postMessage
    iframe.contentWindow.postMessage({
      type: 'execCommand',
      command: command,
      value: value
    }, '*');
  };

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32];
  const headings = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

  return (
    <div className="editor-panel-container">
      <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Text Editor</h3>
      
      {/* Formatting Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Formatting</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => executeCommand('bold')}
            className="format-btn"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => executeCommand('italic')}
            className="format-btn"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => executeCommand('underline')}
            className="format-btn"
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            onClick={() => executeCommand('insertUnorderedList')}
            className="format-btn"
            title="Bullet List"
          >
            ≡
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Font Size</h4>
        <select 
          className="font-size-select"
          onChange={(e) => executeCommand('fontSize', e.target.value)}
          defaultValue=""
        >
          <option value="">Choose size</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>
      </div>

      {/* Headings */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Heading Level</h4>
        <select 
          className="font-size-select"
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          defaultValue=""
        >
          <option value="">Choose heading</option>
          {headings.map(heading => (
            <option key={heading} value={heading.toLowerCase()}>{heading}</option>
          ))}
        </select>
      </div>

      {/* Text Colors */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Text Color</h4>
        <div className="color-swatches">
          <div 
            className="color-swatch" 
            style={{background: '#000000'}}
            onClick={() => executeCommand('foreColor', '#000000')}
            title="Black"
          ></div>
          <div 
            className="color-swatch" 
            style={{background: '#ffc000'}}
            onClick={() => executeCommand('foreColor', '#ffc000')}
            title="Yellow"
          ></div>
          <div 
            className="color-swatch" 
            style={{background: '#ff4444'}}
            onClick={() => executeCommand('foreColor', '#ff4444')}
            title="Red"
          ></div>
          <div 
            className="color-swatch" 
            style={{background: '#0066cc'}}
            onClick={() => executeCommand('foreColor', '#0066cc')}
            title="Blue"
          ></div>
          <div 
            className="color-swatch" 
            style={{background: '#22c55e'}}
            onClick={() => executeCommand('foreColor', '#22c55e')}
            title="Green"
          ></div>
          <div 
            className="color-swatch" 
            style={{background: '#8b5cf6'}}
            onClick={() => executeCommand('foreColor', '#8b5cf6')}
            title="Purple"
          ></div>
        </div>
      </div>

      {/* Alignment */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Text Alignment</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => executeCommand('justifyLeft')}
            className="format-btn"
            title="Align Left"
          >
            ⬅
          </button>
          <button
            onClick={() => executeCommand('justifyCenter')}
            className="format-btn"
            title="Align Center"
          >
            ↔
          </button>
          <button
            onClick={() => executeCommand('justifyRight')}
            className="format-btn"
            title="Align Right"
          >
            ➡
          </button>
        </div>
      </div>

      {/* Links */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Links</h4>
        <button
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) executeCommand('createLink', url);
          }}
          className="format-btn"
          style={{ width: '100%' }}
        >
          🔗 Add Link
        </button>
      </div>
    </div>
  );
};

export default EditorPanel;