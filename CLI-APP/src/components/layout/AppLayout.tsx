import React, { useState } from 'react';
import { Box, useInput } from 'ink';
import { ChatContainer } from '../chat/ChatContainer.js';
import { StatusBar } from './StatusBar.js';
import type { AppOptions } from '../../types.js';

interface AppLayoutProps {
  initialPrompt?: string;
  options?: AppOptions;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ initialPrompt, options }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Keep only essential keyboard shortcuts
  useInput((input, key) => {
    if (key.escape) {
      if (showHelp) setShowHelp(false);
      return;
    }
    
    if (key.ctrl && input === 'c') {
      process.exit(0);
    }
  });

  return (
    <Box flexDirection="column">
      {/* Main Content Area */}
      <Box flexDirection="row" paddingBottom={1}>        
        {/* Chat Area */}
        <Box flexGrow={1}>
          <ChatContainer 
            initialPrompt={initialPrompt} 
            onInputFocus={setIsInputFocused}
            showHelp={showHelp}
            onShowHelp={() => setShowHelp(true)}
            onCloseHelp={() => setShowHelp(false)}
          />
        </Box>
      </Box>
      
      <Box width="100%">
        <StatusBar options={options} showHelp={showHelp} />
      </Box>
    </Box>
  );
};
