import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { ToolCallIndicator } from './ToolCallIndicator.js';
import type { ToolEvent } from '../../utils/streaming.js';

interface ToolCallHistoryProps {
  toolEvents: ToolEvent[];
  maxVisible?: number;
  showHistory?: boolean;
}

export const ToolCallHistory: React.FC<ToolCallHistoryProps> = ({ 
  toolEvents, 
  maxVisible = 5,
  showHistory = true 
}) => {
  const [visibleEvents, setVisibleEvents] = useState<ToolEvent[]>([]);

  useEffect(() => {
    if (showHistory) {
      // Show recent events, with most recent first
      const recentEvents = toolEvents
        .slice(-maxVisible)
        .reverse();
      setVisibleEvents(recentEvents);
    } else {
      // Show recently completed events (last 3 completed tool results)
      const completedEvents = toolEvents.filter(event => 
        event.type === 'tool-result'
      );
      setVisibleEvents(completedEvents.slice(-maxVisible).reverse());
    }
  }, [toolEvents, maxVisible, showHistory]);

  if (visibleEvents.length === 0) {
    return null;
  }

  const getActiveToolCount = (): number => {
    const activeCalls = new Set<string>();
    
    for (const event of toolEvents) {
      if (event.type === 'tool-call-start' || event.type === 'tool-call') {
        if (event.toolCallId) {
          activeCalls.add(event.toolCallId);
        }
      } else if (event.type === 'tool-result' && event.toolCallId) {
        activeCalls.delete(event.toolCallId);
      }
    }
    
    return activeCalls.size;
  };

  const activeCount = getActiveToolCount();

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="blue" bold>
          🔧 Tool Activity
        </Text>
        {activeCount > 0 && (
          <Text color="yellow">
            {' '}({activeCount} active)
          </Text>
        )}
      </Box>
      
      {/* Tool events */}
      <Box flexDirection="column">
        {visibleEvents.map((event, index) => (
          <ToolCallIndicator key={`${event.timestamp}-${index}`} toolEvent={event} />
        ))}
      </Box>
      
      {/* Summary */}
      {toolEvents.length > maxVisible && (
        <Box>
          <Text color="gray" italic>
            ... and {toolEvents.length - maxVisible} more tool calls
          </Text>
        </Box>
      )}
    </Box>
  );
};