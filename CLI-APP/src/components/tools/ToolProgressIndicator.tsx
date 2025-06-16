import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { ToolEvent } from '../../utils/streaming.js';

interface ToolProgressIndicatorProps {
  toolEvents: ToolEvent[];
}

export const ToolProgressIndicator: React.FC<ToolProgressIndicatorProps> = ({ toolEvents }) => {
  const [activeTools, setActiveTools] = useState<Map<string, ToolEvent>>(new Map());
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const newActiveTools = new Map<string, ToolEvent>();
    
    // Track active tool calls by processing events in order
    for (const event of toolEvents) {
      if (event.type === 'tool-call-start' || event.type === 'tool-call') {
        if (event.toolCallId) {
          newActiveTools.set(event.toolCallId, event);
        }
      } else if (event.type === 'tool-result') {
        // Remove completed tool calls
        if (event.toolCallId) {
          newActiveTools.delete(event.toolCallId);
        }
      }
    }
    
    setActiveTools(newActiveTools);
  }, [toolEvents]);

  // Animation for loading indicators
  useEffect(() => {
    if (activeTools.size > 0) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 4);
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [activeTools.size]);

  if (activeTools.size === 0) {
    return null;
  }

  const getLoadingSpinner = (): string => {
    const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    return spinners[animationFrame] || '⠋';
  };

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="blue" 
      padding={1} 
      marginY={1}
    >
      <Box marginBottom={1}>
        <Text color="blue" bold>
          {getLoadingSpinner()} Agent Working...
        </Text>
      </Box>
      
      {Array.from(activeTools.values()).map((event, index) => (
        <Box key={event.toolCallId || index} paddingLeft={2}>
          <Text color="yellow">
            • {event.toolName?.replace(/_/g, ' ') || 'Unknown tool'}
          </Text>
        </Box>
      ))}
      
      {activeTools.size > 1 && (
        <Box paddingTop={1} paddingLeft={2}>
          <Text color="gray" italic>
            {activeTools.size} tools running in parallel
          </Text>
        </Box>
      )}
    </Box>
  );
};