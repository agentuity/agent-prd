import React from 'react';
import { Box, Text, useInput } from 'ink';

interface HelpOverlayProps {
  onClose: () => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === '?') {
      onClose();
    }
  });

  const shortcuts = [
    { key: '?', description: 'Toggle this help overlay' },
    { key: 'Ctrl+H', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl+C', description: 'Exit application' },
    { key: 'Ctrl+L', description: 'Clear chat history' },
    { key: 'ESC', description: 'Close overlays/cancel actions' },
    { key: '↑/↓', description: 'Navigate command history' },
    { key: 'Enter', description: 'Send message' },
    { key: 'Tab', description: 'Auto-complete (future)' },
  ];

  const slashCommands = [
    { cmd: '/help', description: 'Show this help dialog' },
    { cmd: '/clear', description: 'Clear conversation history' },
    { cmd: '/export', description: 'Export conversation to file' },
    { cmd: '/prd show <id>', description: 'Show specific PRD by ID' },
    { cmd: '/prd delete <id>', description: 'Delete specific PRD by ID' },
    { cmd: '/prd export <id>', description: 'Export specific PRD by ID' },
    { cmd: '/prds', description: 'List and manage PRDs' },
    { cmd: '/context set <desc>', description: 'Set work context' },
    { cmd: '/context get', description: 'Show current context' },
    { cmd: '/create-prd <topic>', description: 'Create new PRD' },
    { cmd: '/brainstorm <topic>', description: 'Start brainstorming' },
    { cmd: '/coach <question>', description: 'Get PM coaching' },
    { cmd: '/history', description: 'Show work history' },
    { cmd: '/reasoning', description: 'Toggle AI reasoning display' },
  ];



  return (
    <Box 
      borderStyle="double" 
      borderColor="yellow" 
      padding={1}
      flexDirection="column"
      marginY={1}
    >
      {/* Header */}
      <Box marginBottom={1} justifyContent="center">
        <Text color="yellow" bold>
          📚 AgentPM CLI Help & Reference
        </Text>
      </Box>
      
      {/* Simple Vertical List */}
      <Box flexDirection="column">
        
        {/* Slash Commands Section */}
        <Box marginBottom={1}>
          <Text color="blue" bold>💬 Slash Commands:</Text>
        </Box>
        
        {slashCommands.map((command, index) => (
          <Box key={index} marginBottom={1}>
            <Text color="blue" bold>{command.cmd.padEnd(20)}</Text>
            <Text color="gray">{command.description}</Text>
          </Box>
        ))}
        
        {/* Keyboard Shortcuts Section */}
        <Box marginTop={1} marginBottom={1}>
          <Text color="cyan" bold>⌨️  Keyboard Shortcuts:</Text>
        </Box>
        
        {shortcuts.slice(0, 5).map((shortcut, index) => (
          <Box key={index} marginBottom={1}>
            <Text color="green" bold>{shortcut.key.padEnd(12)}</Text>
            <Text color="white">{shortcut.description}</Text>
          </Box>
        ))}
        
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} justifyContent="center">
        <Text color="gray" italic>
          Press ESC, Q, or ? to close help • Start typing to begin conversation
        </Text>
      </Box>
    </Box>
  );
};
