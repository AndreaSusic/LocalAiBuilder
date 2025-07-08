import React, { useEffect, useState } from 'react';
import HomepageV1 from '../templates/homepage/v1/index.jsx';

export default function TemplatePreview({ templateData, error, loading, previewId, fallbackBootstrap }) {
  console.log('🔍 TemplatePreview rendering with templateData:', !!templateData);
  console.log('🔍 TemplatePreview previewId:', previewId);

  // Delete button injection system
  useEffect(() => {
    if (!templateData || loading) return;

    console.log('🚀 TemplatePreview: Injecting simple delete buttons directly');

    const timer = setTimeout(() => {
      const iframe = document.querySelector('iframe#preview-iframe');
      if (!iframe) {
        console.log('❌ No iframe found for delete button injection');
        return;
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const iframeWindow = iframe.contentWindow;

      if (!iframeDoc || !iframeWindow) {
        console.log('❌ Cannot access iframe content');
        return;
      }

      // Prevent double initialization 
      if (iframeWindow.__DELETE_BUTTONS_LOADED__) {
        console.log('⚠️ Delete buttons already loaded, skipping');
        return;
      }
      iframeWindow.__DELETE_BUTTONS_LOADED__ = true;
      
      console.log('✅ Injecting delete buttons...');

      // Add styles
      if (!iframeDoc.getElementById('delete-button-styles')) {
        const style = iframeDoc.createElement('style');
        style.id = 'delete-button-styles';
        style.textContent = `
          .editor-element {
            position: relative !important;
            outline: 2px dotted transparent !important;
            transition: outline 0.2s ease !important;
          }
          .editor-element:hover {
            outline: 2px dotted red !important;
          }
          .editor-element.active {
            outline: 2px solid #ffc000 !important;
          }
          .delete-btn {
            position: absolute !important;
            top: -8px !important;
            right: -8px !important;
            width: 20px !important;
            height: 20px !important;
            background: red !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            font-size: 12px !important;
            cursor: pointer !important;
            display: none !important;
            z-index: 9999 !important;
            line-height: 1 !important;
          }
          .editor-element:hover .delete-btn {
            display: block !important;
          }
        `;
        iframeDoc.head.appendChild(style);
        console.log('💄 Added delete button styles');
      }

      // Find all editable elements and add delete buttons
      const editableElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, button, span');
      let deleteButtonCount = 0;

      editableElements.forEach((element) => {
        // Skip if element already has a delete button
        if (element.querySelector('.delete-btn')) {
          return;
        }

        // Add editor class and make editable
        element.classList.add('editor-element');
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(element.tagName.toLowerCase())) {
          element.setAttribute('contenteditable', 'true');
        }

        // Ensure parent has relative positioning
        const computedStyle = iframeWindow.getComputedStyle(element);
        if (computedStyle.position === 'static') {
          element.style.position = 'relative';
        }

        // Create delete button
        const deleteBtn = iframeDoc.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        
        deleteBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm('Delete this element?')) {
            element.remove();
            console.log('🗑️ Element deleted:', element.tagName);
          }
        };

        element.appendChild(deleteBtn);
        deleteButtonCount++;
        
        console.log(`🎯 Delete button added for ${element.tagName} (${element.className || 'no class'})`);
      });

      console.log(`✅ Added ${deleteButtonCount} delete buttons successfully`);

      // Set global variables to prevent errors
      iframeWindow.autoSavePageId = previewId || 'preview';
      console.log('🆔 Set autoSavePageId in iframe:', iframeWindow.autoSavePageId);

    }, 3000); // Wait 3 seconds for iframe to fully load
    
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

  function processBootstrap(b) {
    if (!b) return {};
    return {
      ...b,
      // guarantee array shape
      services: Array.isArray(b.services)
                  ? b.services
                  : (b.services ? [b.services] : []),
    };
  }

  const fallbackBootstrapData = processBootstrap(fallbackBootstrap);

  console.log('📋 TemplatePreview about to render HomepageV1 with bootstrap:', !!templateData);
  console.log('🔍 Bootstrap data preview:', (templateData || fallbackBootstrapData)?.company_name || 'No company name');
  console.log('🔍 Bootstrap services debug:', (templateData || fallbackBootstrapData)?.services);
  console.log('🔍 Bootstrap full data keys:', Object.keys(templateData || fallbackBootstrapData || {}));

  try {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <HomepageV1 bootstrap={templateData || fallbackBootstrapData} />
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