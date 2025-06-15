import React from 'react';
import { Box, Text } from 'ink';
import type { Action } from '../../client/agent-client.js';

interface CommandPreviewProps {
  actions: Action[];
  title?: string;
}

export const CommandPreview: React.FC<CommandPreviewProps> = ({ 
  actions, 
  title = "Pending Actions" 
}) => {
  const getActionIcon = (type: string): string => {
    switch (type) {
      case 'create-file':
        return '📄';
      case 'update-file':
        return '✏️';
      case 'export':
        return '📤';
      case 'template-apply':
        return '📋';
      default:
        return '⚡';
    }
  };

  const getActionColor = (type: string): string => {
    switch (type) {
      case 'create-file':
        return 'green';
      case 'update-file':
        return 'yellow';
      case 'export':
        return 'blue';
      case 'template-apply':
        return 'cyan';
      default:
        return 'white';
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1} marginY={1}>
      <Box marginBottom={1}>
        <Text color="blue" bold>
          {title}
        </Text>
      </Box>
      
      {actions.length === 0 ? (
        <Text color="gray" italic>
          No actions pending
        </Text>
      ) : (
        <Box flexDirection="column">
          {actions.map((action, index) => (
            <Box key={index} marginBottom={1}>
              <Box alignItems="center">
                <Text>
                  {getActionIcon(action.type)} 
                </Text>
                <Text color={getActionColor(action.type)} bold marginLeft={1}>
                  {action.type.replace('-', ' ').toUpperCase()}
                </Text>
              </Box>
              
              <Box paddingLeft={3}>
                <Text>{action.description}</Text>
              </Box>
              
              {/* Show additional data if available */}
              {action.data && (
                <Box paddingLeft={3} marginTop={1}>
                  {action.type === 'create-file' && action.data.filename && (
                    <Text color="gray">
                      File: {action.data.filename}
                    </Text>
                  )}
                  {action.type === 'update-file' && action.data.filename && (
                    <Text color="gray">
                      File: {action.data.filename}
                    </Text>
                  )}
                  {action.type === 'export' && action.data.format && (
                    <Text color="gray">
                      Format: {action.data.format}
                    </Text>
                  )}
                  {action.data.preview && (
                    <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
                      <Text color="gray">
                        {action.data.preview}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ))}
          
          <Box borderTop borderColor="gray" paddingTop={1} marginTop={1}>
            <Text color="gray" italic>
              {actions.length} action{actions.length !== 1 ? 's' : ''} ready for execution
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
