import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ChatContainer } from '../chat/ChatContainer.js';
import { StatusBar } from './StatusBar.js';
import { HelpOverlay } from '../navigation/HelpOverlay.js';
import { Sidebar } from '../navigation/Sidebar.js';
import { ExportDialog } from '../common/ExportDialog.js';
import { useKeyboard } from '../../hooks/useKeyboard.js';
import { useExport } from '../../hooks/useExport.js';
import type { AppOptions } from '../../types.js';

interface AppLayoutProps {
  initialPrompt?: string;
  options?: AppOptions;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ initialPrompt, options }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { exportConversation } = useExport();

  // Keep only essential keyboard shortcuts
  useInput((input, key) => {
    if (key.escape) {
      if (showHelp) setShowHelp(false);
      if (showExport) setShowExport(false);
      if (showSidebar) setShowSidebar(false);
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
        {/* Sidebar */}
        {showSidebar && (
          <Box width={25} flexShrink={0}>
            <Sidebar width={25} visible={true} />
          </Box>
        )}
        
        {/* Chat Area */}
        <Box flexGrow={1}>
          <ChatContainer 
            initialPrompt={initialPrompt} 
            onInputFocus={setIsInputFocused}
            showHelp={showHelp}
            showExport={showExport}
            showSidebar={showSidebar}
            onShowHelp={() => setShowHelp(true)}
            onShowExport={() => setShowExport(true)}
            onShowSidebar={() => setShowSidebar(true)}
            onCloseHelp={() => setShowHelp(false)}
            onCloseExport={() => setShowExport(false)}
            onCloseSidebar={() => setShowSidebar(false)}
            onExport={(format, options) => {
              const result = exportConversation(format, options);
              console.log(result.success ? `Exported to ${result.filename}` : `Export failed: ${result.error}`);
            }}
          />
        </Box>
      </Box>
      
      {/* Fixed Status Bar at bottom */}
      <Box position="absolute" bottom={0} left={0} width="100%">
        <StatusBar options={options} showHelp={showHelp} />
      </Box>
    </Box>
  );
};
