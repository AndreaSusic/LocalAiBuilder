/**
 * IFRAME EDITOR BRIDGE
 * Handles communication between dashboard and iframe for editing commands
 */

console.log('🔗 iframeEditorBridge.js loaded');

// Listen for messages from parent dashboard
window.addEventListener('message', (event) => {
  // Only process messages from trusted sources
  if (event.data.type === 'editor-cmd') {
    const { cmd, value } = event.data;
    console.log('📨 Received editor command:', cmd, value);
    
    try {
      // Execute the formatting command
      const success = document.execCommand(cmd, false, value);
      console.log('✅ Command executed:', cmd, 'Success:', success);
      
      // Send confirmation back to dashboard
      window.parent.postMessage({
        type: 'command-executed',
        cmd: cmd,
        success: success
      }, '*');
      
    } catch (error) {
      console.error('❌ Command execution failed:', error);
      
      // Send error back to dashboard
      window.parent.postMessage({
        type: 'command-error',
        cmd: cmd,
        error: error.message
      }, '*');
    }
  }
});

// Notify parent that bridge is ready
window.parent.postMessage({
  type: 'bridge-ready'
}, '*');

console.log('🎯 iframeEditorBridge ready for commands');