/**
 * MESSAGE HANDLER FOR UNDO/REDO OPERATIONS
 * Listens for messages from the dashboard iframe and connects them to React state
 */

import React, { useEffect } from 'react';
import { useSiteDataActions } from '../context/SiteDataProvider';

export const UndoRedoMessageHandler = () => {
  const { undo, redo, canUndo, canRedo, historySize, currentIndex } = useSiteDataActions();

  useEffect(() => {
    const handleMessage = (event) => {
      // Only handle messages from the dashboard iframe
      if (event.origin !== window.location.origin) return;

      switch (event.data.type) {
        case 'undo':
          console.log('🔄 Undo request received from dashboard');
          undo();
          break;
        case 'redo':
          console.log('🔄 Redo request received from dashboard');
          redo();
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