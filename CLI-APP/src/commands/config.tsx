/**
 * Configuration management commands for CLI-APP
 */

import React, { useState, useEffect } from 'react';
import { Text, Box, useInput, useApp } from 'ink';
import { config } from '../utils/config.js';

interface ConfigCommandProps {
  args?: string[];
  onComplete?: () => void;
}

export const ConfigCommand: React.FC<ConfigCommandProps> = ({ args = [], onComplete }) => {
  const { exit } = useApp();
  const [action, setAction] = useState<string>('');
  const [currentView, setCurrentView] = useState<'menu' | 'list' | 'set' | 'get' | 'reset'>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState('');

  const menuOptions = [
    { label: 'Show current configuration', value: 'list' },
    { label: 'Set a configuration value', value: 'set' },
    { label: 'Get a configuration value', value: 'get' },
    { label: 'Reset to defaults', value: 'reset' },
    { label: 'Exit', value: 'exit' }
  ];

  useEffect(() => {
    if (args.length > 0) {
      const [actionArg] = args;
      handleAction(actionArg);
    }
  }, [args]);

  useInput((input, key) => {
    if (currentView === 'menu') {
      if (key.upArrow && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (key.downArrow && selectedIndex < menuOptions.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      } else if (key.return) {
        const selected = menuOptions[selectedIndex];
        handleAction(selected.value);
      }
    }
    
    if (input === 'q' || key.escape) {
      onComplete?.();
    }
  });

  const handleAction = (actionValue: string) => {
    switch (actionValue) {
      case 'list':
      case 'show':
        setCurrentView('list');
        break;
      case 'exit':
        onComplete?.();
        break;
      default:
        setMessage(`Action "${actionValue}" not yet implemented in TUI mode`);
    }
  };

  const renderMenu = () => (
    <Box flexDirection="column">
      <Text color="blue" bold>AgentPM Configuration</Text>
      <Text color="gray">Use arrow keys to navigate, Enter to select</Text>
      <Text> </Text>
      {menuOptions.map((option, index) => (
        <Text key={option.value} color={index === selectedIndex ? 'cyan' : 'white'}>
          {index === selectedIndex ? '▶ ' : '  '}{option.label}
        </Text>
      ))}
      <Text> </Text>
      <Text color="gray">Press 'q' or Esc to exit</Text>
    </Box>
  );

  const renderList = () => {
    const currentConfig = config.getAll();
    
    return (
      <Box flexDirection="column">
        <Text color="blue" bold>Current Configuration:</Text>
        <Text> </Text>
        {Object.entries(currentConfig).map(([key, value]) => {
          let displayValue = String(value || 'not set');
          
          // Mask API key for security
          if (key === 'agentApiKey' && value) {
            displayValue = value.length > 8 
              ? `${value.slice(0, 4)}...${value.slice(-4)}`
              : '***';
          }
          
          return (
            <Text key={key}>
              <Text color="cyan">{key}:</Text> <Text color="white">{displayValue}</Text>
            </Text>
          );
        })}
        <Text> </Text>
        <Text color="gray">Config file: {config.getConfigPath()}</Text>
        <Text> </Text>
        <Text color="gray">Press 'q' to return to menu</Text>
      </Box>
    );
  };

  if (message) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">{message}</Text>
        <Text color="gray">Press 'q' to exit</Text>
      </Box>
    );
  }

  return (
    <Box padding={1}>
      {currentView === 'menu' && renderMenu()}
      {currentView === 'list' && renderList()}
    </Box>
  );
};

export default ConfigCommand;
