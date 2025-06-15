import React from 'react';
import { Box, Text } from 'ink';
import { ChatContainer } from '../chat/ChatContainer.js';
import type { AppOptions } from '../../types.js';

interface AppLayoutProps {
  initialPrompt?: string;
  options?: AppOptions;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ initialPrompt, options }) => {
  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="round" borderColor="blue" paddingX={1}>
        <Text bold color="blue">
          🤖 AgentPM - AI-Powered Product Management CLI
        </Text>
      </Box>
      
      {/* Main Chat Area */}
      <Box flexGrow={1} flexDirection="column">
        <ChatContainer initialPrompt={initialPrompt} />
      </Box>
      
      {/* Status Bar */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          Ready • Type your message and press Enter • /help for commands
        </Text>
      </Box>
    </Box>
  );
};
