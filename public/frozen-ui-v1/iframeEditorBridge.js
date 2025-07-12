/**
 * IFRAME EDITOR BRIDGE
 * Handles communication between dashboard and iframe for editing commands
 */

(function() {
  'use strict';

  // Listen for messages from parent dashboard
  window.addEventListener('message', function(event) {
    if (event.data.type === 'editor-cmd') {
      const { cmd, value } = event.data;
      
      // Execute the command on the selected/focused element
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        document.execCommand(cmd, false, value);
      }
    }
  });

  // Send element selection info back to dashboard
  function notifyElementSelection(element) {
    window.parent.postMessage({
      type: 'elementSelected',
      tagName: element.tagName,
      content: element.textContent || element.innerText,
      className: element.className
    }, '*');
  }

  // Send delete notification to dashboard
  function notifyElementDeleted(element) {
    window.parent.postMessage({
      type: 'elementDeleted',
      tagName: element.tagName,
      content: element.textContent || element.innerText
    }, '*');
  }

  // Export functions for use in frozen-ui.js
  window.editorBridge = {
    notifyElementSelection,
    notifyElementDeleted
  };

  console.log('✅ Iframe Editor Bridge initialized');
})();