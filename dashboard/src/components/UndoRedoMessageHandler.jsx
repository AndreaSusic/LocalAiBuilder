import React, { useEffect, useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';
import { useUndoRedo } from '../hooks/useUndoRedo';

const UndoRedoMessageHandler = () => {
  const { siteData, setSiteData } = useContext(SiteDataContext);
  const { undo, redo, deleteElementByPath, updateElementByPath, initializeHistory, canUndo, canRedo } = useUndoRedo(siteData, setSiteData);

  // Initialize history on component mount
  useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);

  // Register undo/redo functions with the bridge
  useEffect(() => {
    if (window.reactStateRef) {
      window.reactStateRef.current = {
        undo,
        redo,
        canUndo,
        canRedo
      };
      console.log('✅ UndoRedoMessageHandler: Functions registered with bridge');
    }

    // Notify parent dashboard about undo/redo state changes
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'undoRedoStateChanged',
        canUndo: canUndo,
        canRedo: canRedo
      }, '*');
    }
  }, [undo, redo, canUndo, canRedo]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      const { type, elementPath, newValue, elementType, reason } = event.data;
      
      console.log(`🔄 UndoRedoMessageHandler received: ${type}`, { elementPath, newValue, elementType, reason });
      
      switch (type) {
        case 'deleteElement':
          deleteElementByPath(elementPath, elementType, reason);
          break;
        case 'updateElement':
          updateElementByPath(elementPath, newValue, elementType, reason);
          break;
        case 'showWarning':
          console.warn(`⚠️ ${event.data.message}`, event.data.element);
          break;
        case 'undo':
          console.log('🔄 Undo request received');
          undo();
          break;
        case 'redo':
          console.log('🔄 Redo request received');
          redo();
          break;
        case 'dashboardUndo':
          console.log('🔄 Dashboard Undo request received');
          undo();
          break;
        case 'dashboardRedo':
          console.log('🔄 Dashboard Redo request received');
          redo();
          break;
        default:
          console.log(`🤷 Unknown message type: ${type}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [deleteElementByPath, updateElementByPath, undo, redo]);



  return null; // This component doesn't render anything
};

export default UndoRedoMessageHandler;