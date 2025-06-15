import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useChatContext } from '../../context/ChatContext.js';
import { useAgent } from '../../hooks/useAgent.js';
import type { AppOptions } from '../../types.js';

interface StatusBarProps {
  options?: AppOptions;
  showHelp?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ options, showHelp }) => {
  const { messages, isStreaming } = useChatContext();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getConnectionStatus = () => {
    return '🟢 Connected'; // TODO: Get actual connection status
  };

  const getMessageCount = () => {
    const userMessages = messages.filter(m => m.type === 'user').length;
    const agentMessages = messages.filter(m => m.type === 'agent').length;
    return `${userMessages}/${agentMessages}`;
  };

  const getSessionInfo = () => {
    // TODO: Get actual session ID from agent
    return 'Session: Active';
  };

  return (
    <Box borderStyle="single" borderColor={showHelp ? "yellow" : "gray"} paddingX={1}>
      <Box flexGrow={1}>
        {/* Left side - Status and info */}
        <Box>
          <Text color={isStreaming ? "yellow" : "green"}>
            {isStreaming ? '⏳ Processing...' : '✅ Ready'}
          </Text>
          <Text color="gray" marginLeft={2}>
            •
          </Text>
          <Text color="blue" marginLeft={1}>
            {getConnectionStatus()}
          </Text>
          <Text color="gray" marginLeft={2}>
            •
          </Text>
          <Text color="cyan" marginLeft={1}>
            Messages: {getMessageCount()}
          </Text>
        </Box>
      </Box>
      
      {/* Center - Shortcuts hint */}
      <Box justifyContent="center" flexGrow={1}>
        {showHelp ? (
          <Text color="yellow" bold>
            📖 Help Mode - Press ESC to close
          </Text>
        ) : (
          <Text color="gray">
            ? = Help • Ctrl+S = Sidebar • Ctrl+E = Export • Ctrl+L = Clear • Ctrl+C = Exit
          </Text>
        )}
      </Box>
      
      {/* Right side - Session and time info */}
      <Box>
        <Text color="magenta">
          {getSessionInfo()}
        </Text>
        <Text color="gray" marginLeft={2}>
          •
        </Text>
        <Text color="gray" marginLeft={1}>
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </Box>
    </Box>
  );
};
