/**
 * FROZEN UI - INLINE EDITOR
 * Enhanced inline editing system with delete buttons and formatting
 */

console.log('🎨 frozen-ui.js loading...');

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing inline editor');

  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-links');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('open');
    });
  }
  
  // Enhanced inline editor for all editable elements
  const elements = document.querySelectorAll('h1, h2, h3, h4, p, nav, .contact-phone, .cta, .btn-primary, .btn-accent, footer, .nav-links li a, .logo');
  
  elements.forEach(el => {
    // Store reference to delete button
    let deleteBtn = null;
    
    // Add hover styles
    el.addEventListener('mouseenter', () => {
      if (el.isContentEditable) return; // Skip if already editing
      
      // Add red dotted outline
      el.style.outline = '2px dotted #e53935';
      el.style.outlineOffset = '2px';
      
      // Create delete button if it doesn't exist
      if (!deleteBtn && !el.querySelector('.delete-btn')) {
        deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = 'Delete element';
        
        // Position relative to element
        el.style.position = 'relative';
        el.appendChild(deleteBtn);
        
        // Delete button click handler
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          // Confirm deletion
          if (confirm('Delete this element?')) {
            // Notify parent dashboard
            window.parent.postMessage({
              type: 'elementDeleted',
              element: el.tagName,
              text: el.textContent?.substring(0, 50) + '...'
            }, '*');
            
            // Remove the element
            el.remove();
          }
        });
        
        console.log('🗑️ Delete button added to', el.tagName);
      }
    });
    
    el.addEventListener('mouseleave', () => {
      if (el.isContentEditable) return; // Skip if editing
      
      // Remove red outline
      el.style.outline = '';
      el.style.outlineOffset = '';
      
      // Remove delete button
      if (deleteBtn) {
        deleteBtn.remove();
        deleteBtn = null;
      }
    });
    
    // Click to edit
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Make element editable
      el.contentEditable = true;
      el.focus();
      
      // Add yellow editing outline
      el.style.outline = '2px solid #ffc000';
      el.style.outlineOffset = '2px';
      
      // Remove red outline and delete button
      if (deleteBtn) {
        deleteBtn.remove();
        deleteBtn = null;
      }
      
      // Notify parent dashboard
      window.parent.postMessage({
        type: 'elementSelected',
        element: el.tagName,
        text: el.textContent
      }, '*');
      
      console.log('📝 Element selected for editing:', el.tagName);
    });
    
    // Blur to finish editing
    el.addEventListener('blur', () => {
      el.contentEditable = false;
      el.style.outline = '';
      el.style.outlineOffset = '';
      
      console.log('✅ Editing finished for:', el.tagName);
    });
    
    // Handle Enter key
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
    });
  });
  
  console.log('✅ Inline editor initialized for', elements.length, 'elements');
});