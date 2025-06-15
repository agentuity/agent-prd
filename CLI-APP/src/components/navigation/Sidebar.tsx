import React from 'react';
import { Box, Text } from 'ink';
import { useChatContext } from '../../context/ChatContext.js';
import { useAgent } from '../../hooks/useAgent.js';

interface SidebarProps {
  width?: number;
  visible?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ width = 25, visible = true }) => {
  const { messages } = useChatContext();

  if (!visible) return null;

  const getConversationSummary = () => {
    const summaries = [];
    let currentTopic = '';
    
    for (let i = 0; i < messages.length; i += 2) {
      const userMsg = messages[i];
      if (userMsg && userMsg.type === 'user') {
        const preview = userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? '...' : '');
        const timestamp = userMsg.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        summaries.push({
          preview,
          timestamp,
          type: userMsg.content.startsWith('/') ? 'command' : 'chat'
        });
      }
    }
    
    return summaries.slice(-10); // Show last 10 interactions
  };

  const getSessionStats = () => {
    const userMessages = messages.filter(m => m.type === 'user').length;
    const agentMessages = messages.filter(m => m.type === 'agent').length;
    const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
    
    return {
      userMessages,
      agentMessages,
      totalChars,
      sessionTime: '15m' // TODO: Calculate actual session time
    };
  };

  const conversationHistory = getConversationSummary();
  const stats = getSessionStats();

  return (
    <Box 
      width={width} 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="gray"
      paddingX={1}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          📋 Session Info
        </Text>
      </Box>
      
      {/* Session Stats */}
      <Box flexDirection="column" marginBottom={2}>
        <Text color="blue" bold>Statistics:</Text>
        <Text color="gray">
          Messages: {stats.userMessages}/{stats.agentMessages}
        </Text>
        <Text color="gray">
          Characters: {stats.totalChars.toLocaleString()}
        </Text>
        <Text color="gray">
          Duration: {stats.sessionTime}
        </Text>
      </Box>
      
      {/* Conversation History */}
      <Box flexDirection="column" flexGrow={1}>
        <Text color="green" bold marginBottom={1}>
          Recent Activity:
        </Text>
        
        {conversationHistory.length === 0 ? (
          <Text color="gray" italic>
            No conversation yet
          </Text>
        ) : (
          <Box flexDirection="column">
            {conversationHistory.map((item, index) => (
              <Box key={index} marginBottom={1}>
                <Box>
                  <Text color={item.type === 'command' ? 'yellow' : 'white'}>
                    {item.type === 'command' ? '/' : '💬'}
                  </Text>
                  <Text color="gray" marginLeft={1}>
                    {item.timestamp}
                  </Text>
                </Box>
                <Box paddingLeft={2}>
                  <Text color="gray">
                    {item.preview}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Quick Actions */}
      <Box flexDirection="column" borderTop borderColor="gray" paddingTop={1}>
        <Text color="magenta" bold>Quick Actions:</Text>
        <Text color="gray">Ctrl+L - Clear</Text>
        <Text color="gray">Ctrl+E - Export</Text>
        <Text color="gray">? - Help</Text>
      </Box>
    </Box>
  );
};
