import React, { useState, useEffect } from 'react';

const EditorPanel = () => {
  const [active, setActive] = useState('text');
  const [selectedElement, setSelectedElement] = useState(null);

  // Execute formatting command on iframe content
  const executeCommand = (command, value = null) => {
    const iframe = document.querySelector('.preview-iframe');
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      type: 'editor-cmd',
      cmd: command,
      value: value
    }, '*');
  };

  // Listen for element selection from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'elementSelected') {
        setSelectedElement(event.data);
      } else if (event.data.type === 'elementDeleted') {
        console.log('Element deleted:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="panel-root">
      <p className="intro">
        Click on icons to edit content or type a command.
      </p>

      <div className="tabs">
        {['text','media','components'].map(tab => (
          <button
            key={tab}
            className={active===tab?'active':''}
            data-toolbar={tab}
            onClick={()=>setActive(tab)}
          >
            {tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Selected Element Info */}
      {selectedElement && (
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          marginBottom: '10px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Selected:</strong> {selectedElement.tagName}<br/>
          <span style={{ color: '#666' }}>
            {selectedElement.content?.substring(0, 40)}...
          </span>
        </div>
      )}

      {/* Toolbars */}
      <div className={`toolbar ${active==='text'?'active':''}`} data-toolbar="text">
        <button onClick={() => executeCommand('bold')}>𝐁</button>
        <button onClick={() => executeCommand('italic')}>𝑰</button>
        <button onClick={() => executeCommand('underline')}>𝑼</button>
        <select onChange={(e) => executeCommand('insertUnorderedList')}>
          <option>List</option>
          <option value="ul">• Unordered</option>
          <option value="ol">1. Ordered</option>
        </select>
        <select onChange={(e) => executeCommand('fontSize', e.target.value)}>
          <option>Size</option>
          <option value="1">8px</option>
          <option value="2">12px</option>
          <option value="3">14px</option>
          <option value="4">16px</option>
          <option value="5">18px</option>
          <option value="6">20px</option>
          <option value="7">24px</option>
        </select>
        <button onClick={() => executeCommand('foreColor', '#ffc000')}>A🖌️</button>
        <button onClick={() => executeCommand('backColor', '#ffff00')}>🖍️</button>
      </div>
      <div className={`toolbar ${active==='media'?'active':''}`} data-toolbar="media">
        <button>🖼️</button><button>🎥</button><button>↔️↕️</button><button>📐</button>
      </div>
      <div className={`toolbar ${active==='components'?'active':''}`} data-toolbar="components">
        <button>H₁</button><button>¶</button><button>🔲</button>
        <button>📋</button><button>🔗</button>
      </div>

      {/* Chat Messages - Hidden initially */}
      <div style={{ 
        marginTop: '15px', 
        maxHeight: '200px', 
        overflowY: 'auto',
        display: 'none' 
      }}>
        {/* Chat history would go here */}
      </div>

      {/* Chat Input */}
      {/* Command input removed - using sticky input at bottom */}
    </div>
  );
};

export default EditorPanel;