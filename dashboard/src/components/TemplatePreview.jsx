import { useState, useEffect } from 'react';
import SiteDataProvider from '../context/SiteDataProvider.jsx';
import TestTemplate from '../templates/TestTemplate.jsx';

console.log('🔍 TestTemplate import:', TestTemplate);
console.log('🔍 TestTemplate is function:', typeof TestTemplate === 'function');

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
  console.log('📋 TemplatePreview about to render TestTemplate with bootstrap:', !!templateData);
  
  try {
    return (
      <SiteDataProvider bootstrap={templateData}>
        <TestTemplate bootstrap={templateData} />
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