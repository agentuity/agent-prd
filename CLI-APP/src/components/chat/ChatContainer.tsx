import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import { MessageHistory } from './MessageHistory.js';
import { CommandInput } from '../input/CommandInput.js';
import { ApprovalDialog } from '../approval/ApprovalDialog.js';
import { CommandPreview } from '../approval/CommandPreview.js';
import { HelpOverlay } from '../navigation/HelpOverlay.js';
import { ExportDialog } from '../common/ExportDialog.js';
import { useChatContext } from '../../context/ChatContext.js';
import { useAgent } from '../../hooks/useAgent.js';
import { useApproval } from '../../hooks/useApproval.js';
import { generateId } from '../../utils/helpers.js';
import { parseSlashCommand, executeSlashCommand, type SlashCommandContext } from '../../utils/slashCommands.js';

interface ChatContainerProps {
  initialPrompt?: string;
  onInputFocus?: (focused: boolean) => void;
  showHelp?: boolean;
  showExport?: boolean;
  showSidebar?: boolean;
  onShowHelp?: () => void;
  onShowExport?: () => void;
  onShowSidebar?: () => void;
  onCloseHelp?: () => void;
  onCloseExport?: () => void;
  onCloseSidebar?: () => void;
  onExport?: (format: string, options: any) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  initialPrompt, 
  onInputFocus,
  showHelp,
  showExport,
  showSidebar,
  onShowHelp,
  onShowExport,
  onShowSidebar,
  onCloseHelp,
  onCloseExport,
  onCloseSidebar,
  onExport
}) => {
  const { messages, setMessages } = useChatContext();
  const { approvalState, showApproval, handleApprove, handleDeny, handleEdit } = useApproval();
  
  const { sendMessage, isLoading, error } = useAgent({
    approvalMode: 'suggest',
    verbose: false,
    onApprovalRequired: (response) => {
      if (response.actions && response.actions.length > 0) {
        showApproval(response.actions, 'The agent wants to perform the following actions:');
      }
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
        setShowHelp: () => {}, // Will be handled by parent
        setShowExport: () => {},
        setShowSidebar: () => {},
        clearMessages: () => setMessages([]),
        exportConversation: onExport || (() => ({}))
      };

      // Handle UI commands locally
      if (['help', 'h', '?'].includes(command)) {
        onShowHelp?.();
        return;
      }
      
      if (['export', 'e'].includes(command)) {
        onShowExport?.();
        return;
      }
      
      if (['sidebar', 's', 'info'].includes(command)) {
        onShowSidebar?.();
        return;
      }
      
      if (['clear', 'c'].includes(command)) {
        setMessages([]);
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
        // Send slash command to agent
        await sendMessage(args.join(' '), command);
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
      
      {/* Show export dialog at bottom */}
      {showExport && onCloseExport && onExport && (
        <ExportDialog 
          onClose={onCloseExport}
          onExport={onExport}
        />
      )}
      
      {/* Input Area */}
      <CommandInput 
        onSubmit={handleSubmit} 
        placeholder={
          approvalState.isShowingApproval 
            ? "Waiting for approval..." 
            : showHelp || showExport 
            ? "Dialog open - type to continue or ESC to close"
            : "Type your message or /help for commands..."
        }
        onFocus={onInputFocus}
      />
    </Box>
  );
};
