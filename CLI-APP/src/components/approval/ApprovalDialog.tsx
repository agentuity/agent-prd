import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Action } from '../../client/agent-client.js';

interface ApprovalDialogProps {
  actions: Action[];
  onApprove: () => void;
  onDeny: () => void;
  onEdit?: () => void;
  onAlways?: () => void;
  showEdit?: boolean;
  showAlways?: boolean;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  actions,
  onApprove,
  onDeny,
  onEdit,
  onAlways,
  showEdit = true,
  showAlways = false
}) => {
  const [selectedAction, setSelectedAction] = useState(0);

  useInput((input, key) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput === 'y' || key.return) {
      onApprove();
    } else if (lowerInput === 'n' || key.escape) {
      onDeny();
    } else if (lowerInput === 'e' && onEdit && showEdit) {
      onEdit();
    } else if (lowerInput === 'a' && onAlways && showAlways) {
      onAlways();
    } else if (key.upArrow && selectedAction > 0) {
      setSelectedAction(prev => prev - 1);
    } else if (key.downArrow && selectedAction < actions.length - 1) {
      setSelectedAction(prev => prev + 1);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="yellow" padding={1} marginY={1}>
      <Box marginBottom={1}>
        <Text color="yellow" bold>
          ⚠️  Actions Require Approval
        </Text>
      </Box>
      
      <Box flexDirection="column" marginBottom={1}>
        <Text bold>The agent wants to perform these actions:</Text>
        {actions.map((action, index) => (
          <Box key={index} paddingLeft={2}>
            <Text color={index === selectedAction ? "cyan" : "white"}>
              {index === selectedAction ? "→ " : "  "}
              {action.type}: {action.description}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Show action details if available */}
      {actions[selectedAction]?.data && (
        <Box flexDirection="column" marginBottom={1} borderStyle="single" borderColor="gray" paddingX={1}>
          <Text color="gray" bold>Details:</Text>
          <Text color="gray">
            {JSON.stringify(actions[selectedAction].data, null, 2)}
          </Text>
        </Box>
      )}

      <Box flexDirection="column">
        <Text color="green" bold>Options:</Text>
        <Box>
          <Text color="green">[Y]es</Text>
          <Text color="gray"> - Execute all actions</Text>
        </Box>
        <Box>
          <Text color="red">[N]o</Text>
          <Text color="gray"> - Cancel all actions</Text>
        </Box>
        {showEdit && (
          <Box>
            <Text color="blue">[E]dit</Text>
            <Text color="gray"> - Modify before executing</Text>
          </Box>
        )}
        {showAlways && (
          <Box>
            <Text color="cyan">[A]lways</Text>
            <Text color="gray"> - Auto-approve similar actions</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text color="gray" italic>
            Use ↑↓ to navigate actions, then choose an option
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
