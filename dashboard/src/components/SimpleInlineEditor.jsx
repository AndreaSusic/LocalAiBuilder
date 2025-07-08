import React, { useEffect } from 'react';

const SimpleInlineEditor = ({ previewId }) => {
  console.log('🚀 SimpleInlineEditor STARTING - Clean simple version with previewId:', previewId);

  useEffect(() => {
    // Wait for iframe to be fully loaded
    const timer = setTimeout(() => {
      const iframe = document.querySelector('iframe');
      if (!iframe) {
        console.log('❌ SimpleInlineEditor: No iframe found');
        return;
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const iframeWindow = iframe.contentWindow;
      
      if (!iframeDoc || !iframeWindow) {
        console.log('❌ SimpleInlineEditor: Cannot access iframe document or window');
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
    const editableElements = iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, button, span, div[class*="section"], section');
    let deleteButtonCount = 0;

    editableElements.forEach((element) => {
      // Skip if element already has a delete button or is too small
      if (element.querySelector('.delete-btn') || element.offsetWidth < 20 || element.offsetHeight < 20) {
        return;
      }

      // Add editor class and make editable
      element.classList.add('editor-element');
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(element.tagName.toLowerCase())) {
        element.setAttribute('contenteditable', 'true');
      }

      // Create delete button
      const deleteBtn = iframeDoc.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.style.cssText = `
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
      `;
      
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Delete this element?')) {
          element.remove();
          console.log('🗑️ Element deleted:', element.tagName);
        }
      };

      // Ensure parent has relative positioning
      const computedStyle = iframeWindow.getComputedStyle(element);
      if (computedStyle.position === 'static') {
        element.style.position = 'relative';
      }

      element.appendChild(deleteBtn);
      deleteButtonCount++;
      
      console.log(`🎯 Delete button added for ${element.tagName} (${element.className || 'no class'})`);
    });

    console.log(`✅ SimpleInlineEditor: Added ${deleteButtonCount} delete buttons`);

      // Set global variables to prevent errors
      iframeWindow.autoSavePageId = previewId || 'preview';
      console.log('🆔 Set autoSavePageId in iframe:', iframeWindow.autoSavePageId);

    }, 2000); // Wait 2 seconds for iframe to fully load
    
    return () => clearTimeout(timer);
  }, [previewId]);

  // This component doesn't render anything - it just injects functionality
  return null;
};

export default SimpleInlineEditor;