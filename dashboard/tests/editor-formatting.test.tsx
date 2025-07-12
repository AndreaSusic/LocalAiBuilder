import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRichText } from '../src/hooks/useRichText';
import { renderHook, act } from '@testing-library/react';

// Mock execCommand
const mockExecCommand = vi.fn();
Object.defineProperty(document, 'execCommand', {
  value: mockExecCommand,
  configurable: true,
});

// Mock querySelector for iframe
const mockIframe = {
  contentWindow: {
    postMessage: vi.fn(),
  },
};

Object.defineProperty(document, 'querySelector', {
  value: vi.fn().mockReturnValue(mockIframe),
  configurable: true,
});

// Test component that uses the hook
function TestComponent() {
  const richText = useRichText();
  
  return (
    <div>
      <div contentEditable="true" data-testid="editor">
        Test content
      </div>
      <button onClick={richText.bold} data-testid="bold-btn">Bold</button>
      <button onClick={richText.italic} data-testid="italic-btn">Italic</button>
      <button onClick={richText.underline} data-testid="underline-btn">Underline</button>
      <button onClick={richText.undo} data-testid="undo-btn">Undo</button>
      <button onClick={() => richText.fontSize('3')} data-testid="font-size-btn">Font Size</button>
    </div>
  );
}

describe('Editor Formatting', () => {
  beforeEach(() => {
    mockExecCommand.mockClear();
    mockIframe.contentWindow.postMessage.mockClear();
  });

  it('should execute bold command when bold button is clicked', async () => {
    render(<TestComponent />);
    
    const boldButton = screen.getByTestId('bold-btn');
    fireEvent.click(boldButton);
    
    expect(mockExecCommand).toHaveBeenCalledWith('bold', false, undefined);
  });

  it('should execute italic command when italic button is clicked', async () => {
    render(<TestComponent />);
    
    const italicButton = screen.getByTestId('italic-btn');
    fireEvent.click(italicButton);
    
    expect(mockExecCommand).toHaveBeenCalledWith('italic', false, undefined);
  });

  it('should execute underline command when underline button is clicked', async () => {
    render(<TestComponent />);
    
    const underlineButton = screen.getByTestId('underline-btn');
    fireEvent.click(underlineButton);
    
    expect(mockExecCommand).toHaveBeenCalledWith('underline', false, undefined);
  });

  it('should execute undo command when undo button is clicked', async () => {
    render(<TestComponent />);
    
    const undoButton = screen.getByTestId('undo-btn');
    fireEvent.click(undoButton);
    
    expect(mockExecCommand).toHaveBeenCalledWith('undo', false, undefined);
  });

  it('should execute fontSize command with correct value', async () => {
    render(<TestComponent />);
    
    const fontSizeButton = screen.getByTestId('font-size-btn');
    fireEvent.click(fontSizeButton);
    
    expect(mockExecCommand).toHaveBeenCalledWith('fontSize', false, '3');
  });

  it('should handle keyboard shortcuts correctly', async () => {
    render(<TestComponent />);
    
    const editor = screen.getByTestId('editor');
    editor.focus();
    
    // Test Ctrl+B for bold
    fireEvent.keyDown(document, { key: 'b', ctrlKey: true });
    expect(mockExecCommand).toHaveBeenCalledWith('bold', false, undefined);
    
    // Test Ctrl+I for italic  
    fireEvent.keyDown(document, { key: 'i', ctrlKey: true });
    expect(mockExecCommand).toHaveBeenCalledWith('italic', false, undefined);
    
    // Test Ctrl+U for underline
    fireEvent.keyDown(document, { key: 'u', ctrlKey: true });
    expect(mockExecCommand).toHaveBeenCalledWith('underline', false, undefined);
    
    // Test Ctrl+Z for undo
    fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
    expect(mockExecCommand).toHaveBeenCalledWith('undo', false, undefined);
  });

  it('should send messages to preview iframe', async () => {
    render(<TestComponent />);
    
    const boldButton = screen.getByTestId('bold-btn');
    fireEvent.click(boldButton);
    
    expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith({
      type: 'contentChanged',
      command: 'bold',
      value: undefined
    }, '*');
  });

  it('should handle useRichText hook independently', () => {
    const { result } = renderHook(() => useRichText());
    
    expect(result.current.bold).toBeInstanceOf(Function);
    expect(result.current.italic).toBeInstanceOf(Function);
    expect(result.current.underline).toBeInstanceOf(Function);
    expect(result.current.undo).toBeInstanceOf(Function);
    expect(result.current.redo).toBeInstanceOf(Function);
    
    act(() => {
      result.current.bold();
    });
    
    expect(mockExecCommand).toHaveBeenCalledWith('bold', false, undefined);
  });
});