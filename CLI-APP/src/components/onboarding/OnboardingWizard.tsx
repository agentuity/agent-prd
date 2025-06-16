/**
 * First-time setup wizard for AgentPM CLI
 */

import React, { useState } from 'react';
import { Text, Box, useInput } from 'ink';
import { config } from '../../utils/config.js';

interface OnboardingWizardProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'agentUrl' | 'apiKey' | 'approvalMode' | 'complete';

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [agentUrl, setAgentUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [approvalMode, setApprovalMode] = useState<'suggest' | 'auto-edit' | 'full-auto'>('suggest');
  const [selectedOption, setSelectedOption] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const approvalModeOptions = [
    { value: 'suggest', label: 'Suggest (agent suggests, you approve)' },
    { value: 'auto-edit', label: 'Auto-edit (agent can edit files)' },
    { value: 'full-auto', label: 'Full-auto (agent operates autonomously)' }
  ];

  useInput((inputChar, key) => {
    if (currentStep === 'welcome') {
      if (key.return) {
        setCurrentStep('agentUrl');
      }
    } else if (currentStep === 'agentUrl') {
      if (key.return && inputValue.trim()) {
        setAgentUrl(inputValue.trim());
        setInputValue('');
        setCurrentStep('apiKey');
        return;
      }
      
      if (key.backspace || key.delete) {
        setInputValue(prev => prev.slice(0, -1));
        return;
      }
      
      // Handle regular character input
      if (!key.ctrl && !key.meta && inputChar) {
        setInputValue(prev => prev + inputChar);
      }
    } else if (currentStep === 'apiKey') {
      if (key.return) {
        setApiKey(inputValue.trim());
        setInputValue('');
        setCurrentStep('approvalMode');
        return;
      }
      
      if (key.backspace || key.delete) {
        setInputValue(prev => prev.slice(0, -1));
        return;
      }
      
      // Handle regular character input
      if (!key.ctrl && !key.meta && inputChar) {
        setInputValue(prev => prev + inputChar);
      }
    } else if (currentStep === 'approvalMode') {
      if (key.upArrow && selectedOption > 0) {
        setSelectedOption(selectedOption - 1);
      } else if (key.downArrow && selectedOption < approvalModeOptions.length - 1) {
        setSelectedOption(selectedOption + 1);
      } else if (key.return) {
        setApprovalMode(approvalModeOptions[selectedOption].value as any);
        setCurrentStep('complete');
        saveConfiguration();
      }
    } else if (currentStep === 'complete') {
      if (key.return) {
        onComplete();
      }
    }
  });

  const saveConfiguration = () => {
    config.set('agentUrl', agentUrl);
    if (apiKey) {
      config.set('agentApiKey', apiKey);
    }
    config.set('approvalMode', approvalMode);
  };

  const renderWelcome = () => (
    <Box flexDirection="column" padding={1}>
      <Text color="blue" bold>🚀 Welcome to AgentPM CLI!</Text>
      <Text> </Text>
      <Text>Let's get you set up with your AI-powered product management assistant.</Text>
      <Text> </Text>
      <Text color="gray">This setup will:</Text>
      <Text color="gray">• Configure your AgentPRD connection</Text>
      <Text color="gray">• Set up your API key (optional)</Text>
      <Text color="gray">• Choose your approval preferences</Text>
      <Text> </Text>
      <Text color="cyan">Press Enter to continue...</Text>
    </Box>
  );

  const renderAgentUrl = () => (
    <Box flexDirection="column" padding={1}>
      <Text color="blue" bold>🔗 Agent URL Configuration</Text>
      <Text> </Text>
      <Text>Enter your AgentPRD URL:</Text>
      <Text color="gray">(e.g., https://your-agent.agentuity.com or http://127.0.0.1:3500/agent_xxx)</Text>
      <Text> </Text>
      <Text color="cyan">URL: </Text>
      <Text color="white">{inputValue}</Text>
      <Text> </Text>
      <Text color="gray">Press Enter when done</Text>
    </Box>
  );

  const renderApiKey = () => (
    <Box flexDirection="column" padding={1}>
      <Text color="blue" bold>🔑 API Key (Optional)</Text>
      <Text> </Text>
      <Text>Enter your AgentPRD API key (leave empty for local development):</Text>
      <Text> </Text>
      <Text color="cyan">API Key: </Text>
      <Text color="white">{'*'.repeat(inputValue.length)}</Text>
      <Text> </Text>
      <Text color="gray">Press Enter when done (or skip with empty)</Text>
    </Box>
  );

  const renderApprovalMode = () => (
    <Box flexDirection="column" padding={1}>
      <Text color="blue" bold>⚡ Approval Mode</Text>
      <Text> </Text>
      <Text>Choose how the agent should operate:</Text>
      <Text> </Text>
      {approvalModeOptions.map((option, index) => (
        <Text key={option.value} color={index === selectedOption ? 'cyan' : 'white'}>
          {index === selectedOption ? '▶ ' : '  '}{option.label}
        </Text>
      ))}
      <Text> </Text>
      <Text color="gray">Use arrow keys to select, Enter to confirm</Text>
    </Box>
  );

  const renderComplete = () => (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>✅ Setup Complete!</Text>
      <Text> </Text>
      <Text>Your configuration has been saved to:</Text>
      <Text color="gray">{config.getConfigPath()}</Text>
      <Text> </Text>
      <Text color="blue" bold>Configuration Summary:</Text>
      <Text>• Agent URL: <Text color="cyan">{agentUrl}</Text></Text>
      <Text>• API Key: <Text color="cyan">{apiKey ? 'Configured' : 'Not set (using local mode)'}</Text></Text>
      <Text>• Approval Mode: <Text color="cyan">{approvalMode}</Text></Text>
      <Text> </Text>
      <Text color="gray">You can change these settings anytime with:</Text>
      <Text color="gray">  agentpm config</Text>
      <Text> </Text>
      <Text color="cyan">Press Enter to start using AgentPM!</Text>
    </Box>
  );

  switch (currentStep) {
    case 'welcome':
      return renderWelcome();
    case 'agentUrl':
      return renderAgentUrl();
    case 'apiKey':
      return renderApiKey();
    case 'approvalMode':
      return renderApprovalMode();
    case 'complete':
      return renderComplete();
    default:
      return renderWelcome();
  }
};

export default OnboardingWizard;
