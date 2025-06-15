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
    { cmd: '/help', description: 'Show available commands' },
    { cmd: '/clear', description: 'Clear conversation history' },
    { cmd: '/export', description: 'Export conversation' },
    { cmd: '/config', description: 'Show configuration' },
    { cmd: '/session', description: 'Manage session' },
    { cmd: '/prd <topic>', description: 'Create a PRD document' },
    { cmd: '/brainstorm <idea>', description: 'Brainstorm session' },
    { cmd: '/coach <question>', description: 'PM coaching' },
  ];

  const approvalKeys = [
    { key: 'Y', description: 'Approve all pending actions' },
    { key: 'N', description: 'Deny all pending actions' },
    { key: 'E', description: 'Edit actions before approval' },
    { key: 'A', description: 'Always approve similar actions' },
    { key: '↑/↓', description: 'Navigate through actions' },
  ];

  return (
    <Box 
      position="absolute" 
      top={2} 
      left={2} 
      right={2} 
      bottom={2}
      borderStyle="double" 
      borderColor="yellow" 
      backgroundColor="black"
      padding={1}
      flexDirection="column"
    >
      {/* Header */}
      <Box marginBottom={1} justifyContent="center">
        <Text color="yellow" bold>
          📚 AgentPM CLI Help & Reference
        </Text>
      </Box>
      
      <Box flexDirection="row" flexGrow={1}>
        {/* Left Column - Keyboard Shortcuts */}
        <Box flexDirection="column" flexBasis="33%" marginRight={2}>
          <Text color="cyan" bold underline marginBottom={1}>
            Keyboard Shortcuts
          </Text>
          {shortcuts.map((shortcut, index) => (
            <Box key={index} marginBottom={0}>
              <Text color="green" bold>
                {shortcut.key.padEnd(8)}
              </Text>
              <Text color="white">
                {shortcut.description}
              </Text>
            </Box>
          ))}
        </Box>
        
        {/* Middle Column - Slash Commands */}
        <Box flexDirection="column" flexBasis="33%" marginRight={2}>
          <Text color="blue" bold underline marginBottom={1}>
            Slash Commands
          </Text>
          {slashCommands.map((command, index) => (
            <Box key={index} marginBottom={0}>
              <Text color="blue" bold>
                {command.cmd}
              </Text>
              <Box marginTop={0} paddingLeft={2}>
                <Text color="gray">
                  {command.description}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
        
        {/* Right Column - Approval Keys */}
        <Box flexDirection="column" flexBasis="33%">
          <Text color="yellow" bold underline marginBottom={1}>
            Approval Mode
          </Text>
          {approvalKeys.map((key, index) => (
            <Box key={index} marginBottom={0}>
              <Text color="yellow" bold>
                {key.key.padEnd(8)}
              </Text>
              <Text color="white">
                {key.description}
              </Text>
            </Box>
          ))}
          
          <Box marginTop={2} borderStyle="single" borderColor="gray" padding={1}>
            <Text color="gray" bold>
              Tips:
            </Text>
            <Text color="gray">
              • Start typing to begin a conversation
            </Text>
            <Text color="gray">
              • Use /prd, /brainstorm, /coach for specific modes
            </Text>
            <Text color="gray">
              • Approval dialogs appear for file operations
            </Text>
          </Box>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} justifyContent="center" borderTop borderColor="gray" paddingTop={1}>
        <Text color="gray" italic>
          Press ESC, Q, or ? to close this help overlay
        </Text>
      </Box>
    </Box>
  );
};
