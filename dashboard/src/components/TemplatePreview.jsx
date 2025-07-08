import React, { useEffect, useState } from 'react';
import HomepageV1 from '../templates/HomePageV1.jsx';

export default function TemplatePreview({ templateData, error, loading, previewId, fallbackBootstrap }) {
  const [loadedData, setLoadedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  console.log('🔍 TemplatePreview rendering with templateData:', !!templateData);
  console.log('🔍 TemplatePreview previewId:', previewId);
  console.log('🔍 TemplatePreview fallbackBootstrap:', !!fallbackBootstrap);

  // Fetch preview data if we have a previewId
  useEffect(() => {
    const fetchPreviewData = async () => {
      if (previewId) {
        try {
          console.log('📡 Fetching preview data for ID:', previewId);
          const response = await fetch(`/api/preview/${previewId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('📋 Successfully loaded preview data:', data.company_name);
            setLoadedData(data);
          } else {
            console.warn('⚠️ Failed to fetch preview data, using fallback');
            setLoadedData(fallbackBootstrap || templateData);
          }
        } catch (error) {
          console.error('❌ Error fetching preview data:', error);
          setLoadedData(fallbackBootstrap || templateData);
          setLoadError(error.message);
        }
      } else {
        // No previewId, use fallback data
        setLoadedData(fallbackBootstrap || templateData);
      }
      setIsLoading(false);
    };

    fetchPreviewData();
  }, [previewId, fallbackBootstrap, templateData]);

  // Use the loaded data or fallback
  const bootstrapData = loadedData || fallbackBootstrap || templateData;

  // The WorkingInlineEditor React component handles its own mounting
  // No additional mounting logic needed here

  if (loading || isLoading) {
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

  if ((error || loadError) && !bootstrapData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: '#333',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ff4444', marginBottom: '16px' }}>
          Template Loading Error
        </h2>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          {error || loadError || 'Failed to load template data'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '12px 24px',
            background: '#ffc000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Retry Loading
        </button>
      </div>
    );
  }

  console.log('📋 TemplatePreview about to render HomepageV1 with bootstrap:', !!bootstrapData);
  console.log('🔍 Bootstrap data preview:', bootstrapData?.company_name || 'No company name');
  console.log('🔍 HomepageV1 component check:', HomepageV1);

  try {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <HomepageV1 bootstrap={bootstrapData} />
      </div>
    );
  } catch (renderError) {
    console.error('❌ HomepageV1 render error:', renderError);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        color: '#333',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ff4444', marginBottom: '16px' }}>
          Template Render Error
        </h2>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          {renderError.message || 'Failed to render template'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '12px 24px',
            background: '#ffc000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reload Dashboard
        </button>
      </div>
    );
  }
}