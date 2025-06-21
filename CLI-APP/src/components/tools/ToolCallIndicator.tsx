import React from 'react';
import { Box, Text } from 'ink';
import type { ToolEvent } from '../../utils/streaming.js';

interface ToolCallIndicatorProps {
  toolEvent: ToolEvent;
}

export const ToolCallIndicator: React.FC<ToolCallIndicatorProps> = ({ toolEvent }) => {
  const getToolIcon = (toolName: string): string => {
    const icons: Record<string, string> = {
      // Context tools
      'set_work_context': '🎯',
      'get_work_context': '📋',
      'list_work_contexts': '📚',
      'switch_work_context': '🔄',
      'store_prd': '💾',
      'get_prd': '📄',
      'list_prds': '📋',
      // Search tools
      'search_prds': '🔍',
      'search_all': '🔎',
      'add_note': '📝',
      'list_notes': '📒',
      'get_suggestions': '💡',
      // PRD tools
      'update_prd': '✏️',
      'get_prd_versions': '📊',
      'get_prd_diff': '📈',
      'add_prd_checklist': '☑️',
      'get_prd_completion_status': '📊',
      'delete_prd': '🗑️',
      // Visualization tools
      'create_feature_priority_chart': '📊',
      'create_timeline_chart': '📅',
      'create_metrics_dashboard': '📈',
      'create_user_journey_map': '🗺️',
      'visualize_prd_status': '📊',
    };
    return icons[toolName] || '🔧';
  };

  const getStatusColor = (type: string): string => {
    switch (type) {
      case 'tool-call-start':
        return 'yellow';
      case 'tool-call':
        return 'blue';
      case 'tool-result':
        return 'green';
      case 'step-finish':
        return 'cyan';
      default:
        return 'white';
    }
  };

  const getStatusText = (type: string): string => {
    switch (type) {
      case 'tool-call-start':
        return '🔄 Starting...';
      case 'tool-call':
        return '⚡ Executing...';
      case 'tool-result':
        return '✅ Completed';
      case 'step-finish':
        return '📍 Step finished';
      default:
        return '🔧 Processing...';
    }
  };

  const formatResult = (result: any): string => {
    if (!result) return '';
    
    if (typeof result === 'string') {
      return result.length > 100 ? result.slice(0, 100) + '...' : result;
    }
    
    if (typeof result === 'object') {
      // Handle common result patterns
      if (result.id && result.title) {
        return `Created: ${result.title} (${result.id})`;
      }
      if (result.length !== undefined) {
        return `Found ${result.length} items`;
      }
      const resultStr = JSON.stringify(result);
      return resultStr.length > 100 ? resultStr.slice(0, 100) + '...' : resultStr;
    }
    
    return String(result);
  };

  const formatArgs = (args: any): string => {
    if (!args) return '';
    
    // Extract key fields for display
    const keyFields = ['title', 'description', 'contextId', 'prdId'];
    const displayArgs: Record<string, any> = {};
    
    for (const field of keyFields) {
      if (args[field]) {
        displayArgs[field] = args[field];
      }
    }
    
    if (Object.keys(displayArgs).length === 0) {
      return JSON.stringify(args).slice(0, 80) + '...';
    }
    
    return Object.entries(displayArgs)
      .map(([key, value]) => `${key}: ${String(value).slice(0, 30)}`)
      .join(', ');
  };

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor={getStatusColor(toolEvent.type)} 
      paddingX={1}
      marginBottom={1}
    >
      <Box alignItems="center">
        <Text>
          {toolEvent.toolName ? getToolIcon(toolEvent.toolName) : '🔧'} 
        </Text>
        <Text color={getStatusColor(toolEvent.type)} bold>
          {' '}{toolEvent.toolName?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN TOOL'}
        </Text>
        <Text color={getStatusColor(toolEvent.type)}>
          {' • '}{getStatusText(toolEvent.type)}
        </Text>
        <Text color="gray" dimColor>
          {' '}{new Date(toolEvent.timestamp).toLocaleTimeString()}
        </Text>
      </Box>
      
      {/* Show arguments for tool-call events */}
      {toolEvent.type === 'tool-call' && toolEvent.args && (
        <Box paddingLeft={2}>
          <Text color="gray">
            📝 {formatArgs(toolEvent.args)}
          </Text>
        </Box>
      )}
      
      {/* Show results for tool-result events */}
      {toolEvent.type === 'tool-result' && toolEvent.result && (
        <Box paddingLeft={2}>
          <Text color="green">
            📤 {formatResult(toolEvent.result)}
          </Text>
        </Box>
      )}
      
      {/* Show step information for step-finish events */}
      {toolEvent.type === 'step-finish' && (
        <Box paddingLeft={2}>
          <Text color="cyan">
            Step completed{toolEvent.isContinued ? ' → Continuing...' : ' → Finished'}
          </Text>
        </Box>
      )}
    </Box>
  );
};