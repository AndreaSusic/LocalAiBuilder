import React, { useEffect, useContext } from 'react';
import { SiteDataContext } from '../context/SiteDataContext';
import { useUndoRedo } from '../hooks/useUndoRedo';

const UndoRedoMessageHandler = () => {
  const { siteData, setSiteData } = useContext(SiteDataContext);
  const { undo, redo, deleteElementByPath, updateElementByPath, initializeHistory } = useUndoRedo(siteData, setSiteData);

  // Initialize history on component mount
  useEffect(() => {
    initializeHistory();
  }, [initializeHistory]);

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
          undo();
          break;
        case 'redo':
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