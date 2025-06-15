import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout.js';
import { ChatContext } from './context/ChatContext.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import type { Message } from './types.js';

interface AppProps {
  initialPrompt?: string;
  options?: Record<string, any>;
}

export const App: React.FC<AppProps> = ({ initialPrompt, options }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  return (
    <ErrorBoundary>
      <ChatContext.Provider value={{
        messages,
        setMessages,
        isStreaming,
        setIsStreaming
      }}>
        <AppLayout initialPrompt={initialPrompt} options={options} />
      </ChatContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
