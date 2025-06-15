import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useChatContext } from '../../context/ChatContext.js';

interface ExportDialogProps {
  onClose: () => void;
  onExport: (format: string, options: ExportOptions) => void;
}

interface ExportOptions {
  includeTimestamps: boolean;
  includeMetadata: boolean;
  format: 'markdown' | 'json' | 'txt' | 'html';
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ onClose, onExport }) => {
  const { messages } = useChatContext();
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json' | 'txt' | 'html'>('markdown');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  const formats = [
    { key: 'markdown', label: 'Markdown (.md)', description: 'Rich text with formatting' },
    { key: 'json', label: 'JSON (.json)', description: 'Structured data format' },
    { key: 'txt', label: 'Plain Text (.txt)', description: 'Simple text file' },
    { key: 'html', label: 'HTML (.html)', description: 'Web page format' }
  ] as const;

  const options = [
    { key: 'format', label: 'Export Format' },
    { key: 'timestamps', label: 'Include Timestamps' },
    { key: 'metadata', label: 'Include Metadata' },
    { key: 'export', label: 'Export Now' },
    { key: 'cancel', label: 'Cancel' }
  ];

  useInput((input, key) => {
    if (key.escape || input.toLowerCase() === 'q') {
      onClose();
      return;
    }

    if (key.upArrow && selectedOption > 0) {
      setSelectedOption(prev => prev - 1);
      return;
    }

    if (key.downArrow && selectedOption < options.length - 1) {
      setSelectedOption(prev => prev + 1);
      return;
    }

    if (key.return || input === ' ') {
      const option = options[selectedOption];
      
      switch (option.key) {
        case 'format':
          const currentIndex = formats.findIndex(f => f.key === selectedFormat);
          const nextIndex = (currentIndex + 1) % formats.length;
          setSelectedFormat(formats[nextIndex].key);
          break;
        case 'timestamps':
          setIncludeTimestamps(prev => !prev);
          break;
        case 'metadata':
          setIncludeMetadata(prev => !prev);
          break;
        case 'export':
          onExport(selectedFormat, {
            format: selectedFormat,
            includeTimestamps,
            includeMetadata
          });
          onClose();
          break;
        case 'cancel':
          onClose();
          break;
      }
    }
  });

  const getPreview = () => {
    if (messages.length === 0) return 'No messages to export';
    
    const sampleMessage = messages[0];
    const timestamp = includeTimestamps ? `[${sampleMessage.timestamp.toLocaleString()}] ` : '';
    
    switch (selectedFormat) {
      case 'markdown':
        return `${timestamp}**${sampleMessage.type === 'user' ? 'You' : 'Agent'}**: ${sampleMessage.content.slice(0, 50)}...`;
      case 'json':
        return `{"type": "${sampleMessage.type}", "content": "${sampleMessage.content.slice(0, 30)}...", ${includeTimestamps ? `"timestamp": "${sampleMessage.timestamp.toISOString()}"` : ''}}`;
      case 'txt':
        return `${timestamp}${sampleMessage.type === 'user' ? 'You' : 'Agent'}: ${sampleMessage.content.slice(0, 50)}...`;
      case 'html':
        return `<div class="${sampleMessage.type}">${timestamp}<strong>${sampleMessage.type === 'user' ? 'You' : 'Agent'}</strong>: ${sampleMessage.content.slice(0, 50)}...</div>`;
      default:
        return '';
    }
  };

  return (
    <Box 
      borderStyle="double" 
      borderColor="green" 
      backgroundColor="black"
      padding={1}
      flexDirection="column"
      marginY={1}
    >
      {/* Header */}
      <Box marginBottom={1} justifyContent="center">
        <Text color="green" bold>
          📤 Export Conversation
        </Text>
      </Box>
      
      <Box flexDirection="row" flexGrow={1}>
        {/* Left Column - Options */}
        <Box flexDirection="column" flexBasis="50%" marginRight={2}>
          <Text color="cyan" bold underline marginBottom={1}>
            Export Options
          </Text>
          
          {options.map((option, index) => (
            <Box key={option.key} marginBottom={1}>
              <Text color={selectedOption === index ? "yellow" : "white"}>
                {selectedOption === index ? "→ " : "  "}
                {option.label}
              </Text>
              
              {/* Show current values */}
              {option.key === 'format' && (
                <Text color="gray" marginLeft={4}>
                  {formats.find(f => f.key === selectedFormat)?.label}
                </Text>
              )}
              {option.key === 'timestamps' && (
                <Text color={includeTimestamps ? "green" : "red"} marginLeft={4}>
                  {includeTimestamps ? "✓ Yes" : "✗ No"}
                </Text>
              )}
              {option.key === 'metadata' && (
                <Text color={includeMetadata ? "green" : "red"} marginLeft={4}>
                  {includeMetadata ? "✓ Yes" : "✗ No"}
                </Text>
              )}
            </Box>
          ))}
        </Box>
        
        {/* Right Column - Preview */}
        <Box flexDirection="column" flexBasis="50%">
          <Text color="blue" bold underline marginBottom={1}>
            Preview
          </Text>
          
          <Box borderStyle="single" borderColor="gray" padding={1} marginBottom={1}>
            <Text color="gray">
              {getPreview()}
            </Text>
          </Box>
          
          <Box flexDirection="column">
            <Text color="magenta" bold>Statistics:</Text>
            <Text color="gray">Messages: {messages.length}</Text>
            <Text color="gray">Characters: {messages.reduce((acc, m) => acc + m.content.length, 0).toLocaleString()}</Text>
            <Text color="gray">Est. Size: {Math.round(JSON.stringify(messages).length / 1024)}KB</Text>
          </Box>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box marginTop={1} justifyContent="center" borderTop borderColor="gray" paddingTop={1}>
        <Text color="gray" italic>
          ↑↓ Navigate • Space/Enter Select • ESC Cancel
        </Text>
      </Box>
    </Box>
  );
};
