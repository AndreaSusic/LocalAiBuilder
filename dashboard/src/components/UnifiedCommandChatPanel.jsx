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

  const send = async () => {
    if (!input.trim()) return;
    
    const isCmd = COMMANDS.includes(input);
    const userMessage = { speaker: 'user', text: input, isCommand: isCmd };
    
    // Add user message to history immediately
    setHistory(prev => [...prev, userMessage]);
    
    // Clear input and suggestions
    const currentInput = input;
    setInput('');
    setSuggestions([]);
    
    try {
      // Call AI chat API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          isCommand: isCmd
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiMessage = { 
          speaker: 'ai', 
          text: data.message || data.response || 'I understand your request.',
          isCommand: false 
        };
        
        setHistory(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { 
          speaker: 'ai', 
          text: 'Sorry, I encountered an error processing your request.',
          isCommand: false 
        };
        setHistory(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = { 
        speaker: 'ai', 
        text: 'Connection error. Please try again.',
        isCommand: false 
      };
      setHistory(prev => [...prev, errorMessage]);
    }
  };

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
      <div className="chat-input-container">
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
    </div>
  );
}