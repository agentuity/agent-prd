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
  const { exportConversation } = useExport();

  // Set up global keyboard shortcuts
  useKeyboard({
    onToggleHelp: () => setShowHelp(prev => !prev),
    onClearHistory: () => console.log('History cleared'),
    onExport: () => setShowExport(true),
    onExit: () => process.exit(0)
  });

  useInput((input, key) => {
    // Non-Ctrl shortcuts
    if (input === '?') {
      setShowHelp(prev => !prev);
      return;
    }
    
    if (input === 's' && key.ctrl) {
      setShowSidebar(prev => !prev);
      return;
    }
    
    if (key.escape) {
      setShowHelp(false);
      setShowExport(false);
      return;
    }
  });

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="round" borderColor="blue" paddingX={1}>
        <Text bold color="blue">
          🤖 AgentPM - AI-Powered Product Management CLI
        </Text>
      </Box>
      
      {/* Main Content Area */}
      <Box flexGrow={1} flexDirection="row">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar width={25} visible={true} />
        )}
        
        {/* Chat Area */}
        <Box flexGrow={1} flexDirection="column">
          <ChatContainer initialPrompt={initialPrompt} />
        </Box>
      </Box>
      
      {/* Help Overlay */}
      {showHelp && (
        <HelpOverlay onClose={() => setShowHelp(false)} />
      )}
      
      {/* Export Dialog */}
      {showExport && (
        <ExportDialog 
          onClose={() => setShowExport(false)}
          onExport={(format, options) => {
            const result = exportConversation(format, options);
            console.log(result.success ? `Exported to ${result.filename}` : `Export failed: ${result.error}`);
          }}
        />
      )}
      
      {/* Enhanced Status Bar */}
      <StatusBar options={options} showHelp={showHelp} />
    </Box>
  );
};
