/**
 * MESSAGE HANDLER FOR UNDO/REDO OPERATIONS
 * Listens for messages from the dashboard iframe and connects them to React state
 */

import React, { useEffect } from 'react';
import { useSiteDataActions } from '../context/SiteDataProvider';

export const UndoRedoMessageHandler = () => {
  const { undo, redo, canUndo, canRedo, historySize, currentIndex, updateField, updateNestedField, removeService, deleteElementByPath } = useSiteDataActions();

  useEffect(() => {
    const handleMessage = (event) => {
      // Only handle messages from the dashboard iframe
      if (event.origin !== window.location.origin) return;

      switch (event.data.type) {
        case 'undo':
        case 'reactUndo':
          console.log('🔄 Undo request received from dashboard');
          undo();
          break;
        case 'redo':
        case 'reactRedo':
          console.log('🔄 Redo request received from dashboard');
          redo();
          break;
        case 'deleteElement':
          console.log('🗑️ Delete element request received:', event.data.elementPath);
          // Handle element deletion through React state
          const { elementPath, elementType, originalElement } = event.data;
          
          // Use the new deleteElementByPath function for comprehensive handling
          deleteElementByPath(elementPath, originalElement);
          break;
        
        case 'updateElement':
          console.log('✏️ Update element request received:', event.data.elementPath);
          // Handle element updates through React state
          const { elementPath: updatePath, newValue, elementType: updateType } = event.data;
          
          if (updatePath.includes('.')) {
            // For nested paths
            const [parentField, childField] = updatePath.split('.');
            updateNestedField(parentField, childField, newValue);
          } else {
            // For direct fields
            updateField(updatePath, newValue);
          }
          break;
          
        case 'showWarning':
          console.warn('⚠️ Warning from inline editor:', event.data.message);
          console.warn('Element details:', event.data.element);
          // You could show a toast notification or modal here
          alert(`Warning: ${event.data.message}`);
          break;
        case 'saveReactState':
          console.log('💾 Save React state request received');
          // State is automatically saved when updateField/updateNestedField is called
          break;
        case 'getHistoryStatus':
          // Send current history status to dashboard
          event.source.postMessage({
            type: 'historyUpdate',
            canUndo,
            canRedo,
            historySize,
            currentIndex
          }, '*');
          break;
      }
    };

    // Listen for messages from parent dashboard
    window.addEventListener('message', handleMessage);

    // Send initial history status to dashboard
    const sendHistoryUpdate = () => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'historyUpdate',
          canUndo,
          canRedo,
          historySize,
          currentIndex
        }, '*');
      }
    };

    // Send initial status and whenever history changes
    sendHistoryUpdate();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [undo, redo, canUndo, canRedo, historySize, currentIndex]);

  // Send history updates whenever the state changes
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'historyUpdate',
        canUndo,
        canRedo,
        historySize,
        currentIndex
      }, '*');
    }
  }, [canUndo, canRedo, historySize, currentIndex]);

  // This component doesn't render anything, it just handles messages
  return null;
};

export default UndoRedoMessageHandler;