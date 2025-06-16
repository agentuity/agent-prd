import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout.js';
import { ChatContext } from './context/ChatContext.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard.js';
import { config } from './utils/config.js';
import type { Message, ToolEvent } from './types.js';

interface AppProps {
  initialPrompt?: string;
  options?: Record<string, any>;
}

export const App: React.FC<AppProps> = ({ initialPrompt, options }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if this is first time setup
    if (config.isFirstTimeSetup()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <ChatContext.Provider value={{
        messages,
        setMessages,
        isStreaming,
        setIsStreaming,
        toolEvents,
        setToolEvents
      }}>
        <AppLayout initialPrompt={initialPrompt} options={options} />
      </ChatContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
