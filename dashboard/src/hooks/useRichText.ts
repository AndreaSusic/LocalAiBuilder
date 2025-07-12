import { useCallback, useEffect } from 'react';

export interface RichTextActions {
  bold: () => void;
  italic: () => void;
  underline: () => void;
  undo: () => void;
  redo: () => void;
  insertUnorderedList: () => void;
  insertOrderedList: () => void;
  fontSize: (size: string) => void;
  foreColor: (color: string) => void;
  backColor: (color: string) => void;
}

export const useRichText = (): RichTextActions => {
  const execCommand = useCallback((command: string, showUI: boolean = false, value?: string) => {
    // Focus on the currently active contenteditable element
    const activeElement = document.activeElement;
    if (activeElement && activeElement.contentEditable === 'true') {
      activeElement.focus();
    }
    
    // Execute the command
    document.execCommand(command, showUI, value);
    
    // Notify preview iframe of changes
    const previewIframe = document.querySelector('.preview-iframe') as HTMLIFrameElement;
    if (previewIframe && previewIframe.contentWindow) {
      previewIframe.contentWindow.postMessage({
        type: 'contentChanged',
        command,
        value
      }, '*');
    }
  }, []);

  const bold = useCallback(() => {
    execCommand('bold');
  }, [execCommand]);

  const italic = useCallback(() => {
    execCommand('italic');
  }, [execCommand]);

  const underline = useCallback(() => {
    execCommand('underline');
  }, [execCommand]);

  const undo = useCallback(() => {
    execCommand('undo');
  }, [execCommand]);

  const redo = useCallback(() => {
    execCommand('redo');
  }, [execCommand]);

  const insertUnorderedList = useCallback(() => {
    execCommand('insertUnorderedList');
  }, [execCommand]);

  const insertOrderedList = useCallback(() => {
    execCommand('insertOrderedList');
  }, [execCommand]);

  const fontSize = useCallback((size: string) => {
    execCommand('fontSize', false, size);
  }, [execCommand]);

  const foreColor = useCallback((color: string) => {
    execCommand('foreColor', false, color);
  }, [execCommand]);

  const backColor = useCallback((color: string) => {
    execCommand('backColor', false, color);
  }, [execCommand]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'b':
            e.preventDefault();
            bold();
            break;
          case 'i':
            e.preventDefault();
            italic();
            break;
          case 'u':
            e.preventDefault();
            underline();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bold, italic, underline, undo, redo]);

  return {
    bold,
    italic,
    underline,
    undo,
    redo,
    insertUnorderedList,
    insertOrderedList,
    fontSize,
    foreColor,
    backColor
  };
};