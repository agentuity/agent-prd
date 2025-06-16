import { useState, useCallback, useRef } from 'react';
import { AgentClient, type AgentResponse, type ClientOptions, type ToolEvent } from '../client/agent-client.js';
import { useChatContext } from '../context/ChatContext.js';
import { generateId } from '../utils/helpers.js';
import { StreamingHandler } from '../utils/streaming.js';

interface UseAgentOptions extends ClientOptions {
  onStreamChunk?: (chunk: string) => void;
  onError?: (error: Error) => void;
  onApprovalRequired?: (response: AgentResponse) => void;
  onToolEvent?: (event: ToolEvent) => void;
}

export const useAgent = (options: UseAgentOptions = { approvalMode: 'suggest' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setMessages, setIsStreaming } = useChatContext();
  const clientRef = useRef<AgentClient | null>(null);

  // Initialize client if not already created
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new AgentClient({
        approvalMode: options.approvalMode,
        verbose: options.verbose
      });
    }
    return clientRef.current;
  }, [options.approvalMode, options.verbose]);

  const sendMessage = useCallback(async (message: string, command?: string) => {
    const client = getClient();
    setIsLoading(true);
    setError(null);
    setIsStreaming(true);

    try {
      // Create a placeholder for the streaming response
      const responseId = generateId();
      const streamingMessage = {
        id: responseId,
        type: 'agent' as const,
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, streamingMessage]);

      let fullContent = '';

      // Create enhanced streaming handler with reasoning detection and tool events
      const streamingHandler = new StreamingHandler(
        (chunk: string) => {
          // Regular content chunk
          fullContent += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === responseId 
                ? { ...msg, content: fullContent }
                : msg
            )
          );
          options.onStreamChunk?.(chunk);
        },
        (reasoning: string) => {
          // Reasoning/thinking content
          if (StreamingHandler.isReasoningEnabled()) {
            // Add reasoning as a temporary system message
            const reasoningId = generateId();
            const reasoningMessage = {
              id: reasoningId,
              type: 'system' as const,
              content: reasoning,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, reasoningMessage]);
          }
        },
        (toolEvent: ToolEvent) => {
          // Filter out unwanted tool events
          const shouldHideEvent = (
            // Hide unknown tools
            !toolEvent.toolName ||
            // Hide step-finish events (they're just noise)
            toolEvent.type === 'step-finish' ||
            // Hide tool-call-start events (only show completed ones)
            toolEvent.type === 'tool-call-start'
          );

          if (shouldHideEvent) {
            // Still call the original handler for tracking
            options.onToolEvent?.(toolEvent);
            return;
          }

          // Create inline tool message for meaningful events
          const toolMessage = {
            id: generateId(),
            type: 'tool-call' as const,
            content: `Tool: ${toolEvent.toolName} - ${toolEvent.type}`,
            timestamp: new Date(),
            toolEvent: toolEvent
          };

          // Insert tool message into conversation
          setMessages(prev => {
            // Find the streaming message and insert tool message before it
            const streamingIndex = prev.findIndex(msg => msg.id === responseId);
            if (streamingIndex >= 0) {
              const newMessages = [...prev];
              newMessages.splice(streamingIndex, 0, toolMessage);
              return newMessages;
            }
            // If no streaming message found, append to end
            return [...prev, toolMessage];
          });

          // Also call the original handler
          options.onToolEvent?.(toolEvent);
        }
      );

      // Use streaming for real-time updates
      const response = await client.streamMessage(
        message,
        command,
        (chunk: string) => {
          streamingHandler.processChunk(chunk);
        },
        (toolEvent: ToolEvent) => {
          streamingHandler.processToolEvent(toolEvent);
        }
      );

      streamingHandler.finish();

      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId 
            ? { ...msg, content: response.content, isStreaming: false }
            : msg
        )
      );

      // Check if approval is required
      if (response.needsApproval && response.actions && response.actions.length > 0) {
        options.onApprovalRequired?.(response);
      }

      return response;

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      
      // Remove the streaming message on error
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      
      throw error;
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [getClient, setMessages, setIsStreaming, options]);

  const clearSession = useCallback(() => {
    const client = getClient();
    client.clearSession();
    setMessages([]);
    setError(null);
  }, [getClient, setMessages]);

  const getSessionId = useCallback(() => {
    const client = getClient();
    return client.getSessionId();
  }, [getClient]);

  const getConversationHistory = useCallback(() => {
    const client = getClient();
    return client.getConversationHistory();
  }, [getClient]);

  return {
    sendMessage,
    clearSession,
    getSessionId,
    getConversationHistory,
    isLoading,
    error,
    client: getClient()
  };
};
