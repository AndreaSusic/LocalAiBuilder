import React, { useEffect, useState } from 'react';
import HomepageV1 from '../templates/HomePageV1.jsx';

export default function TemplatePreview({ templateData, error, loading, previewId }) {
  console.log('🔍 TemplatePreview rendering with templateData:', !!templateData);

  // Mount InlineEditorInjector once the template is rendered
  useEffect(() => {
    if (!templateData || loading) return;

    const timer = setTimeout(() => {
      // guard – never inject twice
      if (window.__editorInjected) {
        console.log('⚠️ Editor already injected, skipping');
        return;
      }
      window.__editorInjected = true;

      import('../components/InlineEditorInjector').then(({ default: inject }) => {
        inject(document);  // pass current document
        console.log('🟢 InlineEditorInjector injected successfully');
      }).catch(error => {
        console.error('❌ Failed to load InlineEditorInjector:', error);
      });

      // Set autoSavePageId to prevent runtime errors
      window.autoSavePageId = previewId || 'preview';
      console.log('🆔 Set autoSavePageId:', window.autoSavePageId);

    }, 1000); // Wait 1 second for template to render

    return () => clearTimeout(timer);
  }, [templateData, loading, previewId]);

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