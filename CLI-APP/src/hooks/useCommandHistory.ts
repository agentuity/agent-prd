import { useState, useCallback } from 'react';

export const useCommandHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');

  const addToHistory = useCallback((command: string) => {
    if (command.trim() && command !== history[history.length - 1]) {
      setHistory(prev => [...prev, command.trim()]);
    }
    setHistoryIndex(-1);
    setCurrentInput('');
  }, [history]);

  const navigateHistory = useCallback((direction: 'up' | 'down', currentValue: string) => {
    if (history.length === 0) return currentValue;

    let newIndex = historyIndex;

    if (direction === 'up') {
      if (historyIndex === -1) {
        // First time going up, store current input and go to last item
        setCurrentInput(currentValue);
        newIndex = history.length - 1;
      } else if (historyIndex > 0) {
        newIndex = historyIndex - 1;
      }
    } else if (direction === 'down') {
      if (historyIndex === -1) {
        // Already at current input
        return currentValue;
      } else if (historyIndex < history.length - 1) {
        newIndex = historyIndex + 1;
      } else {
        // Going past last history item, return to current input
        setHistoryIndex(-1);
        return currentInput;
      }
    }

    setHistoryIndex(newIndex);
    return history[newIndex] || currentValue;
  }, [history, historyIndex, currentInput]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setCurrentInput('');
  }, []);

  return {
    history,
    addToHistory,
    navigateHistory,
    clearHistory,
    historyIndex
  };
};
