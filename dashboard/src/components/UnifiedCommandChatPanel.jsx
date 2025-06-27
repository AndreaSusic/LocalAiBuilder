import React, {useState, useRef, useEffect} from 'react';
import './UnifiedCommandChatPanel.css';

const COMMANDS = [
  'Rephrase intro',
  'Make bullet list',
  'Generate hero section',
  'Optimize SEO'
];

export default function UnifiedCommandChatPanel() {
  const [active, setActive] = useState('text');             // which toolbar
  const [history, setHistory] = useState([]);               // {speaker, text, isCommand}
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const dropdownRef = useRef();

  useEffect(() => {
    if (!input) return setSuggestions([]);
    setSuggestions(COMMANDS.filter(c =>
      c.toLowerCase().includes(input.toLowerCase())
    ));
  }, [input]);

  const send = () => {
    if (!input.trim()) return;
    const isCmd = COMMANDS.includes(input);
    setHistory([...history, { speaker: 'user', text: input, isCommand: isCmd }]);
    // TODO: call your LLM endpoint when isCmd or free-form
    setInput('');
    setSuggestions([]);
  };

  return (
    <div className="panel-root">
      <p className="intro">
        Let me help you polish your webpage. Click on icons to edit content or ask or type a command.
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
        <button>• List</button><button>1. List</button>
        <select><option>12px</option><option>14px</option><option>16px</option></select>
        <button>A🖌️</button><button>🖍️</button>
      </div>
      <div className={`toolbar ${active==='media'?'active':''}`} data-toolbar="media">
        <button>🖼️</button><button>🎥</button><button>↔️↕️</button><button>📐</button>
      </div>
      <div className={`toolbar ${active==='components'?'active':''}`} data-toolbar="components">
        <button>H₁</button><button>¶</button><button>🔲</button>
        <button>📋</button><button>{"</>"}</button><button>🔘</button>
      </div>

      {/* Chat Flow */}
      <div className="chat-container">
        {history.map((m,i)=>(
          <div key={i}
            className={`bubble ${m.speaker} ${m.isCommand?'command':''}`}>
            <span dangerouslySetInnerHTML={{__html:m.text.replace(/\n/g,'<br/>')}}/>
          </div>
        ))}
      </div>

      {/* Unified Input + Autocomplete */}
      <div className="chat-input">
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          placeholder="Ask or type a command…"
        />
        <button onClick={send}>Send ➤</button>
        {suggestions.length>0 && (
          <ul className="suggestions" ref={dropdownRef}>
            {suggestions.map((c,i)=>
              <li key={i} onClick={()=>setInput(c)}>{c}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}