/**
 * REACT STATE-BASED UNDO/REDO HOOK
 * Manages undo/redo functionality for React components by tracking state changes
 * instead of DOM manipulations, preventing React Virtual DOM conflicts
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useUndoRedo(initialState, maxHistorySize = 50) {
  const [currentState, setCurrentState] = useState(initialState);
  const [history, setHistory] = useState([JSON.parse(JSON.stringify(initialState))]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Track if we're in the middle of an undo/redo operation
  const isUndoRedoing = useRef(false);
  
  // Function to save a new state to history
  const saveToHistory = useCallback((newState) => {
    if (isUndoRedoing.current) return; // Don't save during undo/redo
    
    setHistory(prev => {
      // Remove any future history if we're in the middle of the stack
      const newHistory = prev.slice(0, historyIndex + 1);
      
      // Add new state (deep clone to prevent mutations)
      const stateToSave = JSON.parse(JSON.stringify(newState));
      newHistory.push(stateToSave);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex(prev => Math.max(0, prev - 1));
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });
    
    setCurrentState(newState);
    
    // Notify parent window about history state change
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'historyUpdate',
        canUndo: historyIndex > 0 || history.length > 1,
        canRedo: false // After new action, no redo available
      }, '*');
    }
    
    console.log('💾 Saved React state to history');
  }, [historyIndex, history.length, maxHistorySize]);
  
  // Function to update state and save to history
  const updateState = useCallback((newState) => {
    const stateToSave = typeof newState === 'function' ? newState(currentState) : newState;
    saveToHistory(stateToSave);
  }, [currentState, saveToHistory]);
  
  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoing.current = true;
      
      const newIndex = historyIndex - 1;
      const stateToRestore = JSON.parse(JSON.stringify(history[newIndex]));
      
      setHistoryIndex(newIndex);
      setCurrentState(stateToRestore);
      
      // Notify parent window
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'historyUpdate',
          canUndo: newIndex > 0,
          canRedo: newIndex < history.length - 1
        }, '*');
      }
      
      console.log(`↶ Undo: Restored state from index ${newIndex}`);
      
      setTimeout(() => {
        isUndoRedoing.current = false;
      }, 100);
      
      return true;
    }
    return false;
  }, [historyIndex, history]);
  
  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoing.current = true;
      
      const newIndex = historyIndex + 1;
      const stateToRestore = JSON.parse(JSON.stringify(history[newIndex]));
      
      setHistoryIndex(newIndex);
      setCurrentState(stateToRestore);
      
      // Notify parent window
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'historyUpdate',
          canUndo: newIndex > 0,
          canRedo: newIndex < history.length - 1
        }, '*');
      }
      
      console.log(`↷ Redo: Restored state from index ${newIndex}`);
      
      setTimeout(() => {
        isUndoRedoing.current = false;
      }, 100);
      
      return true;
    }
    return false;
  }, [historyIndex, history]);
  
  // Listen for undo/redo messages from parent dashboard
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'undo') {
        undo();
      } else if (event.data.type === 'redo') {
        redo();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [undo, redo]);
  
  // Initial history update to parent
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'historyUpdate',
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1
      }, '*');
    }
  }, [historyIndex, history.length]);
  
  return {
    state: currentState,
    updateState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    historySize: history.length,
    currentIndex: historyIndex
  };
}