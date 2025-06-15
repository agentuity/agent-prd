import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import { MessageHistory } from './MessageHistory.js';
import { CommandInput } from '../input/CommandInput.js';
import { ApprovalDialog } from '../approval/ApprovalDialog.js';
import { CommandPreview } from '../approval/CommandPreview.js';
import { useChatContext } from '../../context/ChatContext.js';
import { useAgent } from '../../hooks/useAgent.js';
import { useApproval } from '../../hooks/useApproval.js';
import { generateId } from '../../utils/helpers.js';

interface ChatContainerProps {
  initialPrompt?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ initialPrompt }) => {
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

    // Add user message
    const userMessage = {
      id: generateId(),
      type: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Parse slash commands
      let command: string | undefined;
      let message = input;
      
      if (input.startsWith('/')) {
        const [cmd, ...args] = input.slice(1).split(' ');
        command = cmd;
        message = args.join(' ');
      }

      // Send to agent (useAgent hook handles streaming and message updates)
      await sendMessage(message, command);
    } catch (err) {
      // Error is already handled by useAgent hook
      console.error('Failed to send message:', err);
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      <Box flexGrow={1}>
        <MessageHistory />
      </Box>
      
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
      
      <Box>
        <CommandInput 
          onSubmit={handleSubmit} 
          placeholder={approvalState.isShowingApproval ? "Waiting for approval..." : "Type your message..."}
        />
      </Box>
    </Box>
  );
};
