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
    { cmd: '/create-prd <topic>', description: 'Create new PRD document' },
    { cmd: '/brainstorm <topic>', description: 'Start brainstorming session' },
    { cmd: '/coach <question>', description: 'Get PM coaching advice' },
    { cmd: '/prds', description: 'List and manage your PRDs' },
    { cmd: '/prd show <id>', description: 'Show specific PRD by ID' },
    { cmd: '/prd export <id>', description: 'Export specific PRD by ID' },
    { cmd: '/context set <desc>', description: 'Set work context' },
    { cmd: '/context get', description: 'Show current context' },
    { cmd: '/export', description: 'Export conversation to file' },
    { cmd: '/history', description: 'Show work history' },
    { cmd: '/clear', description: 'Clear conversation history' },
    { cmd: '/reasoning', description: 'Toggle AI reasoning display' },
    { cmd: '/help', description: 'Show this help dialog' },
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
