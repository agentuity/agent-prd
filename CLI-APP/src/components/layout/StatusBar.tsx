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
    <Text backgroundColor="gray" color="white">
      {isStreaming ? '⏳ Processing...' : '✅ Ready'} • {getConnectionStatus()} • Messages: {getMessageCount()} • {showHelp ? '📖 Help Mode - Press ESC to close' : '/help for commands • /export • /sidebar • /clear • Ctrl+C = Exit'} • {getSessionInfo()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  );
};
