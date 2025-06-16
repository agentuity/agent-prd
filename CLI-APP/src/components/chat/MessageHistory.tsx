import React from 'react';
import { Box, Text } from 'ink';
import { useChatContext } from '../../context/ChatContext.js';
import { MarkdownRenderer } from '../output/MarkdownRenderer.js';
import { ToolCallIndicator } from '../tools/ToolCallIndicator.js';

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
        <Box key={message.id} marginBottom={1}>
          <Box flexDirection="column">
            {message.type === 'tool-call' ? null : (
              <Box>
                <Text color={
                  message.type === 'user' ? 'blue' : 
                  message.type === 'system' ? 'yellow' : 'green'
                } bold>
                  {message.type === 'user' ? '👤 You' : 
                   message.type === 'system' ? 'ℹ️  System' : '🤖 Agent'}
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
            )}
            {message.type === 'tool-call' && message.toolEvent ? (
              <ToolCallIndicator toolEvent={message.toolEvent} />
            ) : (
              <Box paddingLeft={2}>
                {message.type === 'agent' ? (
                  <Box flexDirection="column">
                    <MarkdownRenderer content={message.content} />
                    {message.isStreaming && (
                      <Text color="green">{'█'}</Text>
                    )}
                  </Box>
                ) : message.type === 'system' ? (
                  <Text color="yellow">{message.content}</Text>
                ) : (
                  <Text>{message.content}</Text>
                )}
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
