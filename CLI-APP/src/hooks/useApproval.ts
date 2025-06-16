import { useState, useCallback } from 'react';
import type { Action } from '../client/agent-client.js';

export interface ApprovalState {
  isShowingApproval: boolean;
  pendingActions: Action[];
  approvalMessage?: string;
}

export const useApproval = () => {
  const [approvalState, setApprovalState] = useState<ApprovalState>({
    isShowingApproval: false,
    pendingActions: [],
  });

  const showApproval = useCallback((actions: Action[], message?: string) => {
    setApprovalState({
      isShowingApproval: true,
      pendingActions: actions,
      approvalMessage: message,
    });
  }, []);

  const hideApproval = useCallback(() => {
    setApprovalState({
      isShowingApproval: false,
      pendingActions: [],
      approvalMessage: undefined,
    });
  }, []);

  const handleApprove = useCallback(() => {
    // Execute the pending actions
    const { pendingActions } = approvalState;
    
    // Here you would normally execute each action
    // For now, we'll just simulate execution
    pendingActions.forEach((action) => {
      console.log(`Executing action: ${action.type} - ${action.description}`);
      // TODO: Implement actual action execution
    });

    hideApproval();
    return Promise.resolve();
  }, [approvalState, hideApproval]);

  const handleDeny = useCallback(() => {
    console.log('Actions denied by user');
    hideApproval();
  }, [hideApproval]);

  const handleEdit = useCallback(() => {
    // TODO: Implement edit functionality
    console.log('Edit functionality not yet implemented');
    hideApproval();
  }, [hideApproval]);

  const handleAlways = useCallback(() => {
    // TODO: Implement auto-approval for similar actions
    console.log('Auto-approval functionality not yet implemented');
    handleApprove();
  }, [handleApprove]);

  return {
    approvalState,
    showApproval,
    hideApproval,
    handleApprove,
    handleDeny,
    handleEdit,
    handleAlways,
  };
};
