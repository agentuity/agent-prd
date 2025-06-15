import { useInput } from 'ink';
import { useCallback } from 'react';
import { useChatContext } from '../context/ChatContext.js';

interface KeyboardShortcuts {
  onClearHistory?: () => void;
  onExport?: () => void;
  onToggleHelp?: () => void;
  onExit?: () => void;
}

export const useKeyboard = (shortcuts: KeyboardShortcuts = {}) => {
  const { setMessages } = useChatContext();

  const handleClearHistory = useCallback(() => {
    setMessages([]);
    shortcuts.onClearHistory?.();
  }, [setMessages, shortcuts]);

  const handleExit = useCallback(() => {
    shortcuts.onExit?.();
    process.exit(0);
  }, [shortcuts]);

  useInput((input, key) => {
    // Global keyboard shortcuts
    if (key.ctrl) {
      switch (input) {
        case 'c':
          handleExit();
          break;
        case 'l':
          handleClearHistory();
          break;
        case 'h':
          shortcuts.onToggleHelp?.();
          break;
        case 'e':
          shortcuts.onExport?.();
          break;
      }
    }
  });

  return {
    clearHistory: handleClearHistory,
    exit: handleExit,
  };
};
