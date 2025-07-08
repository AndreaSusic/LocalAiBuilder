import React, { useEffect, useState } from 'react';
import HomepageV1 from '../templates/HomePageV1.jsx';

export default function TemplatePreview({ templateData, error, loading, previewId }) {
  console.log('🔍 TemplatePreview rendering with templateData:', !!templateData);

  // Mount WorkingInlineEditor once the template is rendered  
  useEffect(() => {
    if (window.__ezEditorMounted) return;
    window.__ezEditorMounted = true;

    import('../components/WorkingInlineEditor').then(({ default: mount }) => {
      mount(document);                         // <- passes iframe doc
      console.log('🟢 EZ editor mounted');
    });
  }, []);

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
        color: '#333',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ff4444', marginBottom: '16px' }}>
          Template Loading Error
        </h2>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          {error || 'Failed to load template data'}
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

  console.log('📋 TemplatePreview about to render HomepageV1 with bootstrap:', !!templateData);
  console.log('🔍 HomepageV1 component check:', HomepageV1);

  try {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <HomepageV1 bootstrap={templateData} />
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