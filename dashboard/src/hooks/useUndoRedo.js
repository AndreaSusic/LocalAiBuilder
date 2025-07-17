import { useCallback, useRef } from 'react';

// Function to notify iframe about state updates
function notifyIframeOfStateUpdate(newState) {
  const iframe = document.querySelector('iframe');
  if (iframe && iframe.contentWindow) {
    console.log('📤 Sending state update to iframe');
    iframe.contentWindow.postMessage({
      type: 'stateUpdate',
      newState: newState
    }, '*');
  } else {
    console.log('⚠️ No iframe found to notify about state update');
  }
}

// Function to update iframe with new bootstrap data
function updateIframeWithNewData(newState) {
  const iframe = document.querySelector('iframe');
  if (iframe && iframe.contentWindow && newState) {
    console.log('🔄 Updating iframe with new state:', newState);
    
    // Send the updated state to the iframe
    iframe.contentWindow.postMessage({
      type: 'updateBootstrapData',
      newData: newState
    }, '*');
    
    // Also try to update the iframe's bootstrap data directly
    try {
      if (iframe.contentWindow.bootstrapData) {
        iframe.contentWindow.bootstrapData = { ...iframe.contentWindow.bootstrapData, ...newState };
        console.log('📊 Updated iframe bootstrap data directly');
      }
    } catch (error) {
      console.log('⚠️ Could not access iframe bootstrap data directly:', error.message);
    }
  }
}

export function useUndoRedo(siteData, setSiteData) {
  const historyRef = useRef({
    undoStack: [],
    redoStack: []
  });

  // Add current state to undo stack
  const saveState = useCallback(() => {
    const currentState = JSON.parse(JSON.stringify(siteData));
    // Remove history metadata to avoid recursive nesting
    delete currentState._undoHistory;
    delete currentState._redoHistory;
    
    historyRef.current.undoStack.push(currentState);
    historyRef.current.redoStack = []; // Clear redo stack when new action is performed
    
    // Limit history size to prevent memory issues
    if (historyRef.current.undoStack.length > 50) {
      historyRef.current.undoStack.shift();
    }
    
    console.log(`💾 State saved - Undo stack: ${historyRef.current.undoStack.length}`);
  }, [siteData]);

  // Undo operation
  const undo = useCallback(() => {
    if (historyRef.current.undoStack.length === 0) {
      console.log('↶ Cannot undo - no history available');
      return false;
    }
    
    // Save current state to redo stack
    const currentState = JSON.parse(JSON.stringify(siteData));
    delete currentState._undoHistory;
    delete currentState._redoHistory;
    historyRef.current.redoStack.push(currentState);
    
    // Restore previous state
    const previousState = historyRef.current.undoStack.pop();
    
    console.log(`↶ Undo successful - ${historyRef.current.undoStack.length} states remaining`);
    console.log(`↷ Redo stack: ${historyRef.current.redoStack.length} states available`);
    
    setSiteData(previousState);
    
    // Update iframe with restored state
    updateIframeWithNewData(previousState);
    
    // Send updated state immediately after undo
    setTimeout(() => {
      const iframe = document.querySelector('iframe') || document.getElementById('previewIframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'updateBootstrapData', 
          data: previousState 
        }, '*');
        console.log('[dashboard] sent updateBootstrapData to iframe after undo', previousState);
      }
    }, 50);
    
    // Notify parent about updated undo/redo state
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'undoRedoStateChanged',
        canUndo: historyRef.current.undoStack.length > 1,
        canRedo: historyRef.current.redoStack.length > 0
      }, '*');
    }
    
    return true;
  }, [siteData, setSiteData]);

  // Redo operation
  const redo = useCallback(() => {
    if (historyRef.current.redoStack.length === 0) {
      console.log('↷ Cannot redo - no redo history available');
      return false;
    }
    
    // Save current state to undo stack
    const currentState = JSON.parse(JSON.stringify(siteData));
    delete currentState._undoHistory;
    delete currentState._redoHistory;
    historyRef.current.undoStack.push(currentState);
    
    // Restore next state
    const nextState = historyRef.current.redoStack.pop();
    
    console.log(`↷ Redo successful - ${historyRef.current.redoStack.length} redo states remaining`);
    console.log(`↶ Undo stack: ${historyRef.current.undoStack.length} states available`);
    
    setSiteData(nextState);
    
    // Update iframe with restored state
    updateIframeWithNewData(nextState);
    
    // Send updated state immediately after redo
    setTimeout(() => {
      const iframe = document.querySelector('iframe') || document.getElementById('previewIframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'updateBootstrapData', 
          data: nextState 
        }, '*');
        console.log('[dashboard] sent updateBootstrapData to iframe after redo', nextState);
      }
    }, 50);
    
    // Notify parent about updated undo/redo state
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'undoRedoStateChanged',
        canUndo: historyRef.current.undoStack.length > 1,
        canRedo: historyRef.current.redoStack.length > 0
      }, '*');
    }
    
    return true;
  }, [siteData, setSiteData]);

  // Delete element by path
  const deleteElementByPath = useCallback((elementPath, elementType, reason) => {
    console.log(`🗑️ Deleting element at path: ${elementPath} (${elementType})`);
    
    // Save current state before deletion
    saveState();
    
    setSiteData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // Parse path and navigate to the element
      const pathParts = elementPath.split('.');
      let current = newData;
      
      // Navigate to parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (current[part] === undefined) {
          // Create object if it doesn't exist
          current[part] = {};
        }
        current = current[part];
      }
      
      const finalPart = pathParts[pathParts.length - 1];
      
      if (Array.isArray(current)) {
        // Handle array deletion
        const index = parseInt(finalPart);
        if (!isNaN(index) && index >= 0 && index < current.length) {
          current.splice(index, 1);
          console.log(`✅ Array element deleted at index ${index}`);
        }
      } else if (current && typeof current === 'object') {
        // Handle object property deletion
        if (current[finalPart] !== undefined) {
          current[finalPart] = null;
          console.log(`✅ Object property deleted: ${finalPart}`);
        }
      }
      
      return newData;
    });
    
    // Notify parent about updated undo/redo state after deletion
    setTimeout(() => {
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
          type: 'undoRedoStateChanged',
          canUndo: historyRef.current.undoStack.length > 1,
          canRedo: historyRef.current.redoStack.length > 0
        }, '*');
      }
    }, 100);
  }, [saveState, setSiteData]);

  // Update element by path
  const updateElementByPath = useCallback((elementPath, newValue, elementType, reason) => {
    console.log(`📝 Updating element at path: ${elementPath} with value: ${newValue}`);
    
    // Save current state before update
    saveState();
    
    setSiteData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // Parse path and navigate to the element
      const pathParts = elementPath.split('.');
      let current = newData;
      
      // Navigate to parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (current[part] === undefined) {
          // Create object if it doesn't exist
          current[part] = {};
        }
        current = current[part];
      }
      
      const finalPart = pathParts[pathParts.length - 1];
      
      if (current && typeof current === 'object') {
        current[finalPart] = newValue;
        console.log(`✅ Element updated at ${elementPath}`);
      }
      
      return newData;
    });
  }, [saveState, setSiteData]);

  // Initialize history with current state
  const initializeHistory = useCallback(() => {
    if (historyRef.current.undoStack.length === 0 && siteData) {
      const initialState = JSON.parse(JSON.stringify(siteData));
      delete initialState._undoHistory;
      delete initialState._redoHistory;
      historyRef.current.undoStack.push(initialState);
      console.log('📝 History initialized with current state');
    }
  }, [siteData]);

  return {
    undo,
    redo,
    saveState,
    deleteElementByPath,
    updateElementByPath,
    initializeHistory,
    canUndo: historyRef.current.undoStack.length > 1,
    canRedo: historyRef.current.redoStack.length > 0
  };
}