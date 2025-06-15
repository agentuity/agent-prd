import React, { createContext, useContext } from 'react';
import type { ChatContextType } from '../types.js';

export const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatContext.Provider');
  }
  return context;
};
