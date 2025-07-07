import { useEffect, useRef } from 'react';

const CleanTemplatePreview = ({ previewId, onReady }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!frameDoc) return;

        // Wait for React content to load, then inject clean editor
        setTimeout(() => {
          const script = frameDoc.createElement('script');
          script.innerHTML = `
            (function() {
              console.log('🚀 Clean comprehensive editor starting...');
              
              // Variables
              let activeEl = null;
              let panel = null;
              let timer = null;
              
              // Initialize
              function init() {
                addStyles();
                makeEditable();
                createPanel();
                setupEvents();
                console.log('✅ Clean editor ready');
              }
              
              function addStyles() {
                const style = document.createElement('style');
                style.textContent = \`
                  .hover-edit {
                    position: relative;
                    transition: outline 0.2s;
                  }
                  
                  .hover-edit:hover {
                    outline: 2px dashed #ff4444 !important;
                    outline-offset: 2px;
                  }
                  
                  .active-edit {
                    outline: 2px solid #ffc000 !important;
                    outline-offset: 2px;
                    background: rgba(255, 192, 0, 0.1) !important;
                  }
                  
                  .del-btn {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 20px;
                    height: 20px;
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 12px;
                    z-index: 10000;
                    display: none;
                    font-family: Arial;
                  }
                  
                  .hover-edit:hover .del-btn,
                  .active-edit .del-btn {
                    display: block;
                  }
                  
                  .edit-panel {
                    position: fixed;
                    top: 50px;
                    right: 20px;
                    width: 300px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10001;
                    display: none;
                    padding: 16px;
                    font-family: Arial;
                  }
                  
                  .edit-panel.show { display: block; }
                  
                  .edit-panel h3 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: bold;
                  }
                  
                  .section {
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #eee;
                  }
                  
                  .section:last-child { border-bottom: none; }
                  
                  .section label {
                    display: block;
                    font-size: 11px;
                    color: #666;
                    margin-bottom: 4px;
                    font-weight: bold;
                  }
                  
                  .format-btns {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                  }
                  
                  .fmt-btn {
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                  }
                  
                  .fmt-btn:hover { background: #f5f5f5; }
                  
                  .dropdown {
                    width: 100%;
                    padding: 4px 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-bottom: 8px;
                  }
                  
                  .colors {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                  }
                  
                  .color {
                    width: 24px;
                    height: 24px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                  }
                  
                  .ai-btn {
                    width: 100%;
                    padding: 8px;
                    background: #ffc000;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                  }
                \`;
                document.head.appendChild(style);
              }
              
              function makeEditable() {
                const selectors = [
                  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button',
                  'nav a', 'nav span', 'nav div', 'nav li',
                  '.menu-item', '.nav-item', '.navbar-brand',
                  '[class*="title"]', '[class*="text"]', '[class*="heading"]',
                  '[class*="nav"]', '[class*="menu"]'
                ];
                
                let count = 0;
                selectors.forEach(sel => {
                  document.querySelectorAll(sel).forEach(el => {
                    if (el.classList.contains('hover-edit') || 
                        el.tagName === 'SCRIPT' || 
                        el.tagName === 'STYLE' ||
                        el.classList.contains('del-btn') ||
                        el.classList.contains('edit-panel')) return;
                    
                    const text = el.textContent.trim();
                    if (text.length > 0) {
                      el.classList.add('hover-edit');
                      el.setAttribute('data-edit', 'true');
                      el.setAttribute('data-orig', text);
                      
                      const delBtn = document.createElement('button');
                      delBtn.className = 'del-btn';
                      delBtn.innerHTML = '×';
                      delBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (confirm('Delete?')) {
                          el.remove();
                          save(document.body);
                        }
                      };
                      
                      if (getComputedStyle(el).position === 'static') {
                        el.style.position = 'relative';
                      }
                      
                      el.appendChild(delBtn);
                      count++;
                    }
                  });
                });
                
                console.log('⚠️ CleanTemplatePreview editor DISABLED to prevent duplicate × buttons');
                return; // DISABLED TO PREVENT DUPLICATE DELETE BUTTONS
              }
              
              function createPanel() {
                const p = document.createElement('div');
                p.className = 'edit-panel';
                p.innerHTML = \`
                  <h3>✏️ Element Editor</h3>
                  
                  <div class="section">
                    <label>Format:</label>
                    <div class="format-btns">
                      <button class="fmt-btn" onclick="fmt('bold')"><b>B</b></button>
                      <button class="fmt-btn" onclick="fmt('italic')"><i>I</i></button>
                      <button class="fmt-btn" onclick="fmt('underline')"><u>U</u></button>
                    </div>
                  </div>
                  
                  <div class="section">
                    <label>Font Size:</label>
                    <select class="dropdown" onchange="fontSize(this.value)">
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
                    
                    <label>Heading:</label>
                    <select class="dropdown" onchange="heading(this.value)">
                      <option value="">Keep current</option>
                      <option value="H1">H1</option>
                      <option value="H2">H2</option>
                      <option value="H3">H3</option>
                      <option value="H4">H4</option>
                      <option value="H5">H5</option>
                      <option value="H6">H6</option>
                    </select>
                  </div>
                  
                  <div class="section">
                    <label>Color:</label>
                    <div class="colors">
                      <div class="color" style="background: #000" onclick="color('#000000')"></div>
                      <div class="color" style="background: #333" onclick="color('#333333')"></div>
                      <div class="color" style="background: #666" onclick="color('#666666')"></div>
                      <div class="color" style="background: #999" onclick="color('#999999')"></div>
                      <div class="color" style="background: #fff; border: 2px solid #000" onclick="color('#ffffff')"></div>
                      <div class="color" style="background: #ffc000" onclick="color('#ffc000')"></div>
                      <div class="color" style="background: #f44" onclick="color('#ff4444')"></div>
                      <div class="color" style="background: #2c5" onclick="color('#22c55e')"></div>
                      <div class="color" style="background: #38f" onclick="color('#3b82f6')"></div>
                    </div>
                  </div>
                  
                  <div class="section">
                    <button class="ai-btn" onclick="ai()">🤖 AI Help</button>
                  </div>
                \`;
                
                document.body.appendChild(p);
                panel = p;
                
                window.fmt = fmt;
                window.fontSize = fontSize;
                window.heading = heading;
                window.color = color;
                window.ai = ai;
              }
              
              function setupEvents() {
                document.addEventListener('click', (e) => {
                  if (e.target.classList.contains('del-btn')) return;
                  
                  const el = e.target.closest('[data-edit="true"]');
                  if (el) {
                    e.preventDefault();
                    e.stopPropagation();
                    activate(el);
                  } else {
                    deactivate();
                  }
                });
                
                document.addEventListener('input', (e) => {
                  if (e.target.classList.contains('active-edit')) {
                    save(e.target);
                  }
                });
                
                document.addEventListener('keydown', (e) => {
                  if (e.key === 'Escape' && activeEl) {
                    deactivate();
                  }
                });
              }
              
              function activate(el) {
                if (activeEl) deactivate();
                
                activeEl = el;
                el.classList.add('active-edit');
                el.contentEditable = true;
                
                if (panel) {
                  panel.classList.add('show');
                  
                  const fontSize = parseInt(getComputedStyle(el).fontSize);
                  const fontSelect = panel.querySelector('select');
                  if (fontSelect) fontSelect.value = fontSize;
                  
                  const headSelect = panel.querySelectorAll('select')[1];
                  if (headSelect && el.tagName.match(/H[1-6]/)) {
                    headSelect.value = el.tagName;
                  }
                }
                
                el.focus();
                save(el);
              }
              
              function deactivate() {
                if (activeEl) {
                  activeEl.classList.remove('active-edit');
                  activeEl.contentEditable = false;
                  activeEl = null;
                }
                if (panel) panel.classList.remove('show');
              }
              
              function fmt(cmd) {
                if (!activeEl) return;
                document.execCommand(cmd, false, null);
                save(activeEl);
              }
              
              function fontSize(size) {
                if (!activeEl) return;
                activeEl.style.fontSize = size + 'px';
                save(activeEl);
              }
              
              function heading(level) {
                if (!activeEl || !level) return;
                
                const newEl = document.createElement(level.toLowerCase());
                newEl.innerHTML = activeEl.innerHTML;
                newEl.className = activeEl.className;
                newEl.setAttribute('data-edit', 'true');
                newEl.setAttribute('data-orig', activeEl.getAttribute('data-orig'));
                newEl.style.cssText = activeEl.style.cssText;
                
                activeEl.parentNode.replaceChild(newEl, activeEl);
                activate(newEl);
              }
              
              function color(c) {
                if (!activeEl) return;
                activeEl.style.color = c;
                save(activeEl);
              }
              
              function ai() {
                if (!activeEl) return;
                
                const text = activeEl.textContent;
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'AI_CHAT_REQUEST',
                    message: \`Improve this text: "\${text}"\`,
                    context: 'editor'
                  }, '*');
                }
              }
              
              function save(el) {
                if (timer) clearTimeout(timer);
                
                timer = setTimeout(async () => {
                  const id = getId(el);
                  const orig = el.getAttribute('data-orig') || '';
                  const edited = el.textContent || '';
                  
                  try {
                    const res = await fetch('/api/save-page-edit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        pageId: '${previewId}',
                        elementId: id,
                        editType: 'text',
                        originalContent: orig,
                        editedContent: edited
                      })
                    });
                    
                    if (res.ok) {
                      el.setAttribute('data-orig', edited);
                      console.log('✅ Saved');
                    } else {
                      console.log('❌ Save failed');
                    }
                  } catch (e) {
                    console.log('❌ Save error');
                  }
                }, 1000);
              }
              
              function getId(el) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className.replace(/\\s+/g, '-') || 'no-cls';
                const txt = el.textContent.trim().substring(0, 20).replace(/\\s+/g, '-') || 'no-txt';
                const idx = [...document.querySelectorAll(tag)].indexOf(el);
                return \`\${tag}-\${cls}-\${txt}-\${idx}\`.toLowerCase();
              }
              
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
              } else {
                init();
              }
              
              setTimeout(init, 1000);
            })();
          `;
          
          // DISABLED: frameDoc.head.appendChild(script); // Preventing duplicate editor systems
          console.log('🔧 CleanTemplatePreview editor injection DISABLED to prevent double delete buttons');
          console.log('✅ Clean editor injected');
          
          if (onReady) onReady();
        }, 1000);
        
      } catch (error) {
        console.error('❌ Editor injection failed:', error);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [previewId, onReady]);

  return (
    <iframe
      ref={iframeRef}
      src={`/t/v1/${previewId}`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px'
      }}
      title="Template Preview"
    />
  );
};

export default CleanTemplatePreview;