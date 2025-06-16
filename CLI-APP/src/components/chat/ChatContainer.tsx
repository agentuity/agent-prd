import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import { MessageHistory } from './MessageHistory.js';
import { CommandInput } from '../input/CommandInput.js';
import { ApprovalDialog } from '../approval/ApprovalDialog.js';
import { CommandPreview } from '../approval/CommandPreview.js';
import { HelpOverlay } from '../navigation/HelpOverlay.js';
import { useChatContext } from '../../context/ChatContext.js';
import { useAgent } from '../../hooks/useAgent.js';
import { useApproval } from '../../hooks/useApproval.js';
import { generateId } from '../../utils/helpers.js';
import { parseSlashCommand, executeSlashCommand, type SlashCommandContext } from '../../utils/slashCommands.js';
import type { ToolEvent } from '../../types.js';

interface ChatContainerProps {
  initialPrompt?: string;
  onInputFocus?: (focused: boolean) => void;
  showHelp?: boolean;
  onShowHelp?: () => void;
  onCloseHelp?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  initialPrompt, 
  onInputFocus,
  showHelp,
  onShowHelp,
  onCloseHelp
}) => {
  const { messages, setMessages, toolEvents, setToolEvents } = useChatContext();
  const { approvalState, showApproval, handleApprove, handleDeny, handleEdit } = useApproval();

  // Clean up old tool events (keep last 50)
  useEffect(() => {
    if (toolEvents.length > 50) {
      setToolEvents(prev => prev.slice(-50));
    }
  }, [toolEvents, setToolEvents]);
  
  const { sendMessage, isLoading, error } = useAgent({
    approvalMode: 'suggest',
    verbose: false,
    onApprovalRequired: (response) => {
      if (response.actions && response.actions.length > 0) {
        showApproval(response.actions, 'The agent wants to perform the following actions:');
      }
    },
    onToolEvent: (toolEvent: ToolEvent) => {
      setToolEvents(prev => [...prev, toolEvent]);
    }
  });

  useEffect(() => {
    if (initialPrompt) {
      handleSubmit(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSubmit = async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Parse slash commands first
    const { command, args, isSlashCommand } = parseSlashCommand(input);
    
    if (isSlashCommand) {
      // Create slash command context
      const slashContext: SlashCommandContext = {
        setShowHelp: () => onShowHelp?.(),
        clearMessages: () => setMessages([]),
        showMessage: (message: string) => {
          // Add system message to show command response
          const systemMessage = {
            id: generateId(),
            type: 'system' as const,
            content: message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, systemMessage]);
        }
      };

      // Try to execute slash command locally first
      const wasHandled = executeSlashCommand(command, args, slashContext);
      
      if (wasHandled) {
        return; // Command was handled locally
      }
      
      // Handle UI commands locally
      if (['help', 'h', '?'].includes(command)) {
        onShowHelp?.();
        return;
      }
      
      if (['clear', 'c'].includes(command)) {
        setMessages([]);
        setToolEvents([]);
        return;
      }
      
      
      if (['quit', 'exit', 'q'].includes(command)) {
        process.exit(0);
        return;
      }
    }

    // Add user message for regular messages or agent-handled slash commands
    const userMessage = {
      id: generateId(),
      type: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      if (isSlashCommand) {
        // Send full slash command to agent
        await sendMessage(input, command);
      } else {
        // Send regular message
        await sendMessage(input);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <Box flexDirection="column">
      {/* Message Area */}
      <MessageHistory />
      
      
      {/* Show approval dialog if needed */}
      {approvalState.isShowingApproval && (
        <Box>
          <CommandPreview actions={approvalState.pendingActions} />
          <ApprovalDialog
            actions={approvalState.pendingActions}
            onApprove={handleApprove}
            onDeny={handleDeny}
            onEdit={handleEdit}
            showEdit={true}
            showAlways={false}
          />
        </Box>
      )}
      
      {/* Show help dialog at bottom */}
      {showHelp && onCloseHelp && (
        <HelpOverlay onClose={onCloseHelp} />
      )}
      
      {/* Input Area */}
      <CommandInput 
        onSubmit={handleSubmit} 
        placeholder={
          approvalState.isShowingApproval 
            ? "Waiting for approval..." 
            : showHelp 
            ? "Help open - type to continue or ESC to close"
            : "Type your message or /help for commands..."
        }
        onFocus={onInputFocus}
      />
    </Box>
  );
};
