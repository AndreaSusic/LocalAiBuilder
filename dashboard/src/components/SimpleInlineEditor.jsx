import React, { useEffect } from 'react';

const SimpleInlineEditor = ({ previewId }) => {
  console.log('🚀 SimpleInlineEditor STARTING - Clean simple version with previewId:', previewId);

  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe) {
      console.log('❌ No iframe found');
      return;
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const iframeWindow = iframe.contentWindow;
    
    if (!iframeDoc || !iframeWindow) {
      console.log('❌ Cannot access iframe document or window');
      return;
    }

    // Prevent double initialization 
    if (iframeWindow.__SIMPLE_EDITOR_LOADED__) {
      console.log('⚠️ SimpleInlineEditor already loaded, skipping');
      return;
    }
    iframeWindow.__SIMPLE_EDITOR_LOADED__ = true;
    
    console.log('✅ SimpleInlineEditor initializing...');

    // Add basic editor styles
    if (!iframeDoc.getElementById('simple-editor-styles')) {
      const style = iframeDoc.createElement('style');
      style.id = 'simple-editor-styles';
      style.textContent = `
        .editor-element {
          position: relative;
          outline: 2px dotted transparent;
          transition: outline 0.2s ease;
        }
        .editor-element:hover {
          outline: 2px dotted red;
        }
        .editor-element.active {
          outline: 2px solid #ffc000;
        }
        .delete-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background: red;
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 12px;
          cursor: pointer;
          display: none;
          z-index: 9999;
        }
        .editor-element:hover .delete-btn {
          display: block;
        }
        .delete-btn-inner {
          display: none !important;
        }
      `;
      iframeDoc.head.appendChild(style);
      console.log('💄 Added simple editor styles');
    }

    // Find all editable elements and add delete buttons
    const editableElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, button, span');
    let deleteButtonCount = 0;

    editableElements.forEach((element) => {
      // Skip if element already has a delete button
      if (element.querySelector('.delete-btn-outer')) {
        return;
      }

      // Add editor class
      element.classList.add('editor-element');
      element.setAttribute('contenteditable', 'true');

      // Create delete button
      const deleteBtn = iframeDoc.createElement('button');
      deleteBtn.className = element.tagName.toLowerCase() === 'li' ? 'delete-btn delete-btn-outer' : 'delete-btn delete-btn-inner';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => {
        if (confirm('Delete this element?')) {
          element.remove();
          console.log('🗑️ Element deleted');
        }
      };

      element.appendChild(deleteBtn);
      deleteButtonCount++;
      
      console.log(`🎯 ${deleteBtn.className} added for ${element.tagName}`);
    });

    console.log(`✅ SimpleInlineEditor: Added ${deleteButtonCount} delete buttons`);

    // Set global variables to prevent errors
    iframeWindow.autoSavePageId = previewId || 'preview';
    console.log('🆔 Set autoSavePageId in iframe:', iframeWindow.autoSavePageId);

  }, [previewId]);

  // This component doesn't render anything - it just injects functionality
  return null;
};

export default SimpleInlineEditor;