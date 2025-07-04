// Quick fix for auto-save authentication in dashboard iframe context
// This assumes user is authenticated when accessing dashboard

(function() {
  console.log('🔧 Applying auto-save authentication fix...');
  
  // Override the schedule auto-save function to always work in dashboard
  if (window.scheduleAutoSave) {
    const originalScheduleAutoSave = window.scheduleAutoSave;
    
    window.scheduleAutoSave = function(element) {
      // Force authentication to true in dashboard context
      if (window.location.pathname.includes('/t/v1/') || window.location.pathname.includes('/preview')) {
        console.log('💾 Auto-save enabled - dashboard context detected');
        
        // Override the authentication check
        const isAuthenticated = true;
        
        if (window.autoSaveSaveTimeout) {
          clearTimeout(window.autoSaveSaveTimeout);
        }
        
        window.autoSaveSaveTimeout = setTimeout(() => {
          autoSaveElement(element, true); // Force authentication
        }, 1000);
        
        showSaveStatus('saving');
        return;
      }
      
      // Fallback to original function
      originalScheduleAutoSave(element);
    };
  }
  
  console.log('✅ Auto-save authentication fix applied');
})();