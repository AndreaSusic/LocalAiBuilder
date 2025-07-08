// Inline Editor Injection Function for CSP-safe delete button setup

export default function inject(doc) {
  console.log('🟢 InlineEditorInjector starting injection...');

  // Prevent double injection
  if (doc.__editorInjected) {
    console.log('⚠️ Editor already injected, skipping');
    return;
  }
  doc.__editorInjected = true;

  // Add comprehensive editor styles
  const style = doc.createElement('style');
  style.id = 'inline-editor-styles';
  style.textContent = `
    /* CRITICAL FIX: Button classification system to prevent duplicates */
    .delete-btn-outer {
      position: absolute !important;
      top: -8px !important;
      right: -8px !important;
      width: 20px !important;
      height: 20px !important;
      background: #ff4444 !important;
      color: white !important;
      border: none !important;
      border-radius: 50% !important;
      font-size: 12px !important;
      cursor: pointer !important;
      display: none !important;
      z-index: 9999 !important;
      line-height: 1 !important;
      font-family: Arial, sans-serif !important;
    }
    
    .delete-btn-inner {
      display: none !important;
    }
    
    .editor-element {
      position: relative !important;
      transition: outline 0.2s ease !important;
    }
    
    .editor-element:hover {
      outline: 2px dotted #ff4444 !important;
      outline-offset: 2px !important;
    }
    
    .editor-element:hover .delete-btn-outer {
      display: block !important;
    }
    
    .editor-element.active {
      outline: 2px solid #ffc000 !important;
      outline-offset: 2px !important;
    }
    
    [contenteditable="true"]:focus {
      outline: 2px solid #ffc000 !important;
      outline-offset: 2px !important;
    }
  `;
  doc.head.appendChild(style);
  console.log('💄 Added editor styles');

  // Find all editable elements and add delete buttons
  const selectors = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'span', 'li', 'button', 'div',
    'nav a', 'nav span', 'nav div',
    '.menu-item', '.nav-item'
  ];

  let buttonCount = 0;

  selectors.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(element => {
      // Skip if already processed or has delete button
      if (element.querySelector('.delete-btn-outer') || 
          element.classList.contains('delete-btn-outer') ||
          element.classList.contains('delete-btn-inner')) {
        return;
      }

      const text = element.textContent?.trim();
      if (!text || text.length === 0) return;

      // Add editor class and make contenteditable
      element.classList.add('editor-element');
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(element.tagName.toLowerCase())) {
        element.setAttribute('contenteditable', 'true');
      }

      // Ensure relative positioning for delete button
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.position === 'static') {
        element.style.position = 'relative';
      }

      // Guard against duplicate buttons using specific classification
      if (element.querySelector('.delete-btn-outer')) return;

      // Create delete button with proper classification
      const deleteBtn = doc.createElement('button');
      
      // Use outer classification for LI elements, inner for nested
      if (element.tagName.toLowerCase() === 'li') {
        deleteBtn.className = 'delete-btn-outer';
        console.log('🎯 delete-btn-outer added for', element.tagName);
      } else {
        deleteBtn.className = 'delete-btn-inner delete-btn-outer'; // Both classes for flexibility
        console.log('🎯 delete-btn-inner added for', element.tagName);
      }
      
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
      buttonCount++;
    });
  });

  console.log(`✅ Added ${buttonCount} delete buttons with classification system`);

  // Set up click handlers for contenteditable
  doc.addEventListener('click', (e) => {
    const editableEl = e.target.closest('.editor-element');
    if (editableEl && !e.target.classList.contains('delete-btn-outer')) {
      // Make element active for editing
      doc.querySelectorAll('.editor-element.active').forEach(el => {
        el.classList.remove('active');
      });
      editableEl.classList.add('active');
      if (editableEl.getAttribute('contenteditable') === 'true') {
        editableEl.focus();
      }
    }
  });

  // Handle escape key to deactivate
  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      doc.querySelectorAll('.editor-element.active').forEach(el => {
        el.classList.remove('active');
        el.blur();
      });
    }
  });

  console.log('🎯 Editor injection completed successfully');
}