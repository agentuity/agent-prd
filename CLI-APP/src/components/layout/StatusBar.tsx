import React from 'react';
import { Box, Text } from 'ink';
import type { AppOptions } from '../../types.js';

interface StatusBarProps {
  options?: AppOptions;
  showHelp?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ showHelp }) => {
  return (
    <Box paddingX={1} paddingTop={1} paddingBottom={1}>
      <Text color="gray" dimColor>
        {showHelp ? 'Press ESC to close help' : '/help • /clear • /quit • Ctrl+C to exit'}
      </Text>
    </Box>
  );
};
