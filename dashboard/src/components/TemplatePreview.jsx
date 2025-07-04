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