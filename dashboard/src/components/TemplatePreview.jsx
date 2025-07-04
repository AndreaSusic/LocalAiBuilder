import React, { useState, useEffect, Component } from 'react';
import SiteDataProvider from '../context/SiteDataProvider.jsx';
import HomepageV1 from '../templates/homepage/v1/index.jsx';

console.log('🔍 HomepageV1 import:', HomepageV1);
console.log('🔍 HomepageV1 is function:', typeof HomepageV1 === 'function');

class TemplateErrorBoundary extends Component {
  state = { err: null };
  
  static getDerivedStateFromError(err) { 
    return { err }; 
  }
  
  componentDidCatch(err, info) { 
    console.error('💥 Template crash:', err, info); 
  }
  
  render() {
    if (this.state.err) {
      return (
        <pre style={{
          color: 'red',
          background: '#ffebee',
          padding: '20px',
          margin: '20px',
          border: '2px solid red',
          fontSize: '14px',
          whiteSpace: 'pre-wrap'
        }}>
          💥 Template Error:
          {String(this.state.err)}
          
          Stack: {this.state.err.stack}
        </pre>
      );
    }
    return this.props.children;
  }
}

export default function TemplatePreview({ previewId, fallbackBootstrap }) {
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        console.log('🔍 Fetching preview data for ID:', previewId);
        
        const response = await fetch(`/api/preview/${previewId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded cached preview data for:', data.company_name || 'Unknown Company');
          console.log('📊 Data includes reviews:', !!data.reviews?.length);
          console.log('📊 Data includes photos:', !!data.images?.length);
          setTemplateData(data);
        } else if (response.status === 404) {
          console.log('⚠️ Preview not found, using fallback data');
          setTemplateData(fallbackBootstrap);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.error('❌ Error fetching preview data:', err);
        setError(err.message);
        setTemplateData(fallbackBootstrap);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [previewId, fallbackBootstrap]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading template preview...
      </div>
    );
  }

  if (error && !templateData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
          Preview Not Available
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          The template preview has expired or could not be loaded.
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ffc000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Render the template with the fetched data
  console.log('🎨 Rendering template with data for:', templateData?.company_name || 'Unknown Company');
  console.log('📋 TemplatePreview about to render HomepageV1 with bootstrap:', !!templateData);
  console.log('🔍 HomepageV1 component check:', HomepageV1);
  
  // If HomepageV1 is null, render error instead of crashing
  if (!HomepageV1) {
    console.error('❌ HomepageV1 is null, cannot render');
    return (
      <div style={{ padding: '20px', background: '#ffebee' }}>
        <h2 style={{ color: '#c62828' }}>HomepageV1 Import Error</h2>
        <p>HomepageV1 component failed to import properly</p>
        <p>Import result: {String(HomepageV1)}</p>
      </div>
    );
  }
  
  useEffect(() => {
    // Inject the inline editor after template renders
    const injectEditor = () => {
      if (window.universalEditorInjected) return;
      
      const script = document.createElement('script');
      script.innerHTML = `
        console.log('🔧 Injecting Universal Editor for template preview...');
        
        // Add editor styles
        const style = document.createElement('style');
        style.textContent = \`
          .editor-highlight {
            outline: 2px dotted #ff0000 !important;
            outline-offset: 2px !important;
          }
          .editor-active {
            outline: 2px solid #ffc000 !important;
            outline-offset: 2px !important;
          }
          .editor-toolbar {
            position: fixed !important;
            background: white !important;
            border: 2px solid #333 !important;
            border-radius: 8px !important;
            padding: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            z-index: 99999 !important;
            display: none !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
            min-width: 300px !important;
          }
          .editor-btn {
            padding: 6px 12px !important;
            border: 1px solid #ddd !important;
            background: white !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 12px !important;
          }
          .editor-btn:hover {
            background: #f0f0f0 !important;
          }
          .delete-btn {
            position: absolute !important;
            top: -10px !important;
            right: -10px !important;
            width: 24px !important;
            height: 24px !important;
            background: #ff4444 !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            font-size: 14px !important;
            display: none !important;
            z-index: 10000 !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Make all text elements editable
        const textSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'a', 'button', 'li'];
        let activeElement = null;
        
        textSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            if (el.closest('.editor-toolbar') || el.classList.contains('delete-btn')) return;
            
            el.addEventListener('mouseenter', () => {
              if (activeElement !== el) {
                el.classList.add('editor-highlight');
              }
            });
            
            el.addEventListener('mouseleave', () => {
              if (activeElement !== el) {
                el.classList.remove('editor-highlight');
              }
            });
            
            el.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Clear previous active element
              if (activeElement) {
                activeElement.classList.remove('editor-active');
                activeElement.querySelector('.delete-btn')?.remove();
              }
              
              // Set new active element
              activeElement = el;
              el.classList.add('editor-active');
              el.classList.remove('editor-highlight');
              
              // Add delete button
              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'delete-btn';
              deleteBtn.innerHTML = '×';
              deleteBtn.style.display = 'block';
              deleteBtn.onclick = (e) => {
                e.stopPropagation();
                el.remove();
              };
              el.style.position = 'relative';
              el.appendChild(deleteBtn);
              
              // Make element editable
              el.contentEditable = true;
              el.focus();
              
              console.log('✅ Element activated for editing:', el.tagName);
            });
          });
        });
        
        // Click outside to deactivate
        document.addEventListener('click', (e) => {
          if (!e.target.closest('[contenteditable="true"]') && activeElement) {
            activeElement.classList.remove('editor-active');
            activeElement.contentEditable = false;
            activeElement.querySelector('.delete-btn')?.remove();
            activeElement = null;
          }
        });
        
        window.universalEditorInjected = true;
        console.log('✅ Universal Editor injected successfully');
      `;
      document.head.appendChild(script);
    };
    
    // Inject after component mounts
    setTimeout(injectEditor, 1000);
  }, [templateData]);

  try {
    return (
      <SiteDataProvider bootstrap={templateData}>
        <TemplateErrorBoundary>
          <HomepageV1 bootstrap={templateData} />
        </TemplateErrorBoundary>
      </SiteDataProvider>
    );
  } catch (error) {
    console.error('💥 TemplatePreview render error:', error);
    return (
      <div style={{ padding: '20px', background: '#ffebee' }}>
        <h2 style={{ color: '#c62828' }}>TemplatePreview Error</h2>
        <p>Error: {error.message}</p>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
          {error.stack}
        </pre>
      </div>
    );
  }
}