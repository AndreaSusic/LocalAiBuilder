import React, { useState } from 'react';

const EditorPanel = () => {
  const [active, setActive] = useState('text');

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

      {/* Toolbars */}
      <div className={`toolbar ${active==='text'?'active':''}`} data-toolbar="text">
        <button>𝐁</button><button>𝑰</button><button>𝑼</button>
        <select>
          <option>List</option>
          <option>• Unordered</option>
          <option>1. Ordered</option>
        </select>
        <select><option>8px</option><option>12px</option><option>14px</option><option>16px</option></select>
        <button>A🖌️</button><button>🖍️</button>
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
      <div style={{ 
        marginTop: '10px',
        display: 'flex',
        gap: '8px' 
      }}>
        <input 
          type="text" 
          placeholder="Type command or question..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px'
          }}
        />
        <button style={{
          background: '#ffc000',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default EditorPanel;