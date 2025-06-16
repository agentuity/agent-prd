import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useChatContext } from '../../context/ChatContext.js';
import { useCommandHistory } from '../../hooks/useCommandHistory.js';

interface CommandInputProps {
  onSubmit: (command: string) => void;
  placeholder?: string;
  onFocus?: (focused: boolean) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ 
  onSubmit, 
  placeholder = "Type your message...",
  onFocus
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isStreaming } = useChatContext();
  const { addToHistory, navigateHistory } = useCommandHistory();

  useInput((inputChar, key) => {
    // Disable input while streaming or if other overlays are active
    if (isStreaming) return;

    // Set focus state when user starts typing
    if (!isFocused && inputChar && !key.ctrl && !key.meta) {
      setIsFocused(true);
      onFocus?.(true);
    }

    if (key.return) {
      if (input.trim()) {
        addToHistory(input);
        onSubmit(input);
        setInput('');
        setIsFocused(false);
        onFocus?.(false);
      }
      return;
    }

    if (key.upArrow) {
      const historyItem = navigateHistory('up', input);
      setInput(historyItem);
      return;
    }

    if (key.downArrow) {
      const historyItem = navigateHistory('down', input);
      setInput(historyItem);
      return;
    }

    if (key.escape) {
      setIsFocused(false);
      onFocus?.(false);
      return;
    }

    if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    // Handle regular character input
    if (!key.ctrl && !key.meta && inputChar) {
      setInput(prev => prev + inputChar);
    }
  });

  const displayPlaceholder = !input && !isStreaming ? placeholder : '';
  const statusText = isStreaming ? 'Agent is typing...' : '';

  return (
    <Box borderStyle="round" borderColor={isStreaming ? "yellow" : "cyan"} paddingX={1}>
      <Text>
        <Text color={isStreaming ? "yellow" : "cyan"} bold>{'> '}</Text>
        {input && <Text>{input}</Text>}
        {displayPlaceholder && <Text color="gray" dimColor>{displayPlaceholder}</Text>}
        {statusText && <Text color="yellow" dimColor>{statusText}</Text>}
        {!isStreaming && <Text color="cyan">{'█'}</Text>}
      </Text>
    </Box>
  );
};
