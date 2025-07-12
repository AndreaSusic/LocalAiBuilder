import React, {useState, useRef, useEffect} from 'react';
import './UnifiedCommandChatPanel.css';
import { useRichText } from '../hooks/useRichText';

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
  const richText = useRichText();

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
        
        // Check if this is a content modification request
        if (data.contentChange) {
          // Send content change to preview iframe
          const previewIframe = document.querySelector('.preview-iframe');
          if (previewIframe && previewIframe.contentWindow) {
            previewIframe.contentWindow.postMessage({
              type: 'contentChange',
              action: data.contentChange.action,
              selector: data.contentChange.selector,
              newContent: data.contentChange.newContent
            }, '*');
          }
          
          const aiMessage = { 
            speaker: 'ai', 
            text: data.message || `✅ Updated ${data.contentChange.elementType} to "${data.contentChange.newContent}"`,
            isCommand: false 
          };
          setHistory(prev => [...prev, aiMessage]);
        } else {
          const aiMessage = { 
            speaker: 'ai', 
            text: data.message || data.response || 'I understand your request.',
            isCommand: false 
          };
          setHistory(prev => [...prev, aiMessage]);
        }
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
        <button onClick={richText.bold} title="Bold (Ctrl+B)">𝐁</button>
        <button onClick={richText.italic} title="Italic (Ctrl+I)">𝑰</button>
        <button onClick={richText.underline} title="Underline (Ctrl+U)">𝑼</button>
        <select onChange={(e) => {
          const value = e.target.value;
          if (value === 'unordered') richText.insertUnorderedList();
          else if (value === 'ordered') richText.insertOrderedList();
          e.target.value = 'List';
        }}>
          <option>List</option>
          <option value="unordered">• Unordered</option>
          <option value="ordered">1. Ordered</option>
        </select>
        <select onChange={(e) => {
          if (e.target.value !== 'Font Size') {
            richText.fontSize(e.target.value);
          }
        }}>
          <option>Font Size</option>
          <option value="1">8px</option>
          <option value="2">12px</option>
          <option value="3">14px</option>
          <option value="4">16px</option>
          <option value="5">18px</option>
          <option value="6">24px</option>
          <option value="7">32px</option>
        </select>
        <button onClick={() => richText.foreColor('#000000')} title="Text Color">A🖌️</button>
        <button onClick={() => richText.backColor('#ffff00')} title="Background Color">🖍️</button>
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

      {/* Note: Input field moved to sticky bottom position in parent component */}
    </div>
  );
}