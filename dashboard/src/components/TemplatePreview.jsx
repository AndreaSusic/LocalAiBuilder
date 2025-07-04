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

  // Inject inline editor script after template is rendered
  useEffect(() => {
    if (templateData && !loading) {
      console.log('🔧 Injecting inline editor for template preview...');
      
      // Create and inject the inline editor script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        console.log('🚀 Starting inline editor for template preview...');
        
        // Initialize simple inline editor
        function initInlineEditor() {
          console.log('👥 Making elements editable...');
          
          // Find all elements with data-edit attribute
          const editableElements = document.querySelectorAll('[data-edit]');
          console.log('Found editable elements:', editableElements.length);
          
          editableElements.forEach(element => {
            // Add visual feedback
            element.style.border = '2px dashed #ff4444';
            element.style.padding = '4px';
            element.style.cursor = 'text';
            
            // Make contenteditable
            element.contentEditable = true;
            
            // Add event listeners
            element.addEventListener('focus', () => {
              element.style.border = '2px solid #4CAF50';
              element.style.backgroundColor = '#f0f8ff';
            });
            
            element.addEventListener('blur', () => {
              element.style.border = '2px dashed #ff4444';
              element.style.backgroundColor = 'transparent';
              console.log('💾 Element edited:', element.dataset.edit);
            });
            
            element.addEventListener('input', () => {
              console.log('✏️ Text changed in:', element.dataset.edit);
            });
          });
          
          console.log('✅ Inline editor initialized with', editableElements.length, 'editable elements');
        }
        
        // Run immediately or wait for React to finish
        if (document.readyState === 'complete') {
          initInlineEditor();
        } else {
          window.addEventListener('load', initInlineEditor);
        }
      `;
      
      // Add to head to ensure it runs
      document.head.appendChild(script);
      
      // Also run immediately if DOM is ready
      setTimeout(() => {
        console.log('🔄 Running inline editor initialization...');
        const editableElements = document.querySelectorAll('[data-edit]');
        console.log('Found editable elements on template:', editableElements.length);
        
        editableElements.forEach(element => {
          element.style.border = '2px dashed #ff4444';
          element.style.padding = '4px';
          element.style.cursor = 'text';
          element.contentEditable = true;
          
          element.addEventListener('focus', () => {
            element.style.border = '2px solid #4CAF50';
            element.style.backgroundColor = '#f0f8ff';
          });
          
          element.addEventListener('blur', () => {
            element.style.border = '2px dashed #ff4444';
            element.style.backgroundColor = 'transparent';
          });
        });
        
        console.log('✅ Template preview inline editor ready');
      }, 1000);
    }
  }, [templateData, loading]);

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