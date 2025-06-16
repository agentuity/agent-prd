import React from 'react';
import { Box, Text } from 'ink';
import { useChatContext } from '../../context/ChatContext.js';
import { MarkdownRenderer } from '../output/MarkdownRenderer.js';

export const MessageHistory: React.FC = () => {
  const { messages, isStreaming } = useChatContext();

  if (messages.length === 0) {
    return (
      <Box justifyContent="center" alignItems="center" height="100%">
        <Text color="gray">
          Welcome! Start a product conversation below. /help for commands.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {messages.map((message) => (
        <Box key={message.id} marginY={1}>
          <Box flexDirection="column">
            <Box>
              <Text color={message.type === 'user' ? 'blue' : 'green'} bold>
                {message.type === 'user' ? '👤 You' : '🤖 Agent'}
              </Text>
              <Text color="gray" dimColor>
                {' '}• {message.timestamp.toLocaleTimeString()}
              </Text>
              {message.isStreaming && (
                <Text color="yellow" dimColor>
                  {' '}• streaming...
                </Text>
              )}
            </Box>
            <Box paddingLeft={2}>
              {message.type === 'agent' ? (
                <Box flexDirection="column">
                  <MarkdownRenderer content={message.content} />
                  {message.isStreaming && (
                    <Text color="green">{'█'}</Text>
                  )}
                </Box>
              ) : (
                <Text>{message.content}</Text>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
