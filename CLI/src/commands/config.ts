/**
 * Configuration management commands
 */

import chalk from 'chalk';
import { input, select, confirm } from '@inquirer/prompts';
import { config } from '../utils/config.js';
import { OutputManager } from '../utils/output.js';

export async function handleConfigCommand(args: string[], output: OutputManager): Promise<void> {
  if (args.length === 0) {
    await showConfigMenu(output);
    return;
  }

  const [action, key, ...valueArgs] = args;
  
  switch (action.toLowerCase()) {
    case 'list':
    case 'show':
      showConfig(output);
      break;
    case 'set':
      if (!key) {
        output.error('Configuration key is required');
        return;
      }
      const value = valueArgs.join(' ');
      if (!value) {
        output.error('Configuration value is required');
        return;
      }
      await setConfig(key, value, output);
      break;
    case 'get':
      if (!key) {
        output.error('Configuration key is required');
        return;
      }
      getConfig(key, output);
      break;
    case 'reset':
      await resetConfig(output);
      break;
    default:
      output.error(`Unknown config action: ${action}`);
      showConfigHelp(output);
  }
}

async function showConfigMenu(output: OutputManager): Promise<void> {
  const action = await select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Show current configuration', value: 'show' },
      { name: 'Set a configuration value', value: 'set' },
      { name: 'Get a configuration value', value: 'get' },
      { name: 'Reset to defaults', value: 'reset' },
      { name: 'Cancel', value: 'cancel' }
    ]
  });

  switch (action) {
    case 'show':
      showConfig(output);
      break;
    case 'set':
      await interactiveSetConfig(output);
      break;
    case 'get':
      await interactiveGetConfig(output);
      break;
    case 'reset':
      await resetConfig(output);
      break;
    case 'cancel':
      output.info('Configuration unchanged');
      break;
  }
}

function showConfig(output: OutputManager): void {
  const currentConfig = config.getAll();
  
  output.info('Current Configuration:');
  console.log();
  
  Object.entries(currentConfig).forEach(([key, value]) => {
    if (key === 'agentApiKey' && value) {
      // Hide API key for security, show only first/last few chars
      const masked = value.length > 8 
        ? `${value.slice(0, 4)}...${value.slice(-4)}`
        : '***';
      console.log(`  ${chalk.cyan(key)}: ${chalk.gray(masked)}`);
    } else if (value !== undefined) {
      console.log(`  ${chalk.cyan(key)}: ${chalk.white(String(value))}`);
    }
  });
  
  console.log();
  console.log(chalk.gray(`Config file: ${config.getConfigPath()}`));
}

async function setConfig(key: string, value: string, output: OutputManager): Promise<void> {
  try {
    // Validate key
    const validKeys = ['agentUrl', 'agentApiKey', 'approvalMode', 'defaultTemplate', 'exportFormat', 'verbose', 'sessionTimeout'];
    if (!validKeys.includes(key)) {
      output.error(`Invalid configuration key: ${key}`);
      output.info(`Valid keys: ${validKeys.join(', ')}`);
      return;
    }

    // Parse value based on key type
    let parsedValue: any = value;
    
    if (key === 'verbose') {
      parsedValue = value.toLowerCase() === 'true';
    } else if (key === 'sessionTimeout') {
      parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        output.error('sessionTimeout must be a number');
        return;
      }
    } else if (key === 'approvalMode') {
      if (!['suggest', 'auto-edit', 'full-auto'].includes(value)) {
        output.error('approvalMode must be one of: suggest, auto-edit, full-auto');
        return;
      }
    }

    config.set(key as any, parsedValue);
    output.success(`Set ${key} = ${parsedValue}`);
  } catch (error) {
    output.error('Failed to set configuration', error instanceof Error ? error : undefined);
  }
}

function getConfig(key: string, output: OutputManager): void {
  const value = config.get(key as any);
  
  if (value === undefined) {
    output.warning(`Configuration key '${key}' is not set`);
  } else {
    if (key === 'agentApiKey') {
      const masked = value.length > 8 
        ? `${value.slice(0, 4)}...${value.slice(-4)}`
        : '***';
      console.log(`${chalk.cyan(key)}: ${chalk.gray(masked)}`);
    } else {
      console.log(`${chalk.cyan(key)}: ${chalk.white(String(value))}`);
    }
  }
}

async function interactiveSetConfig(output: OutputManager): Promise<void> {
  const key = await select({
    message: 'Which configuration would you like to set?',
    choices: [
      { name: 'Agent URL (agentUrl)', value: 'agentUrl' },
      { name: 'Agent API Key (agentApiKey)', value: 'agentApiKey' },
      { name: 'Approval Mode (approvalMode)', value: 'approvalMode' },
      { name: 'Default Template (defaultTemplate)', value: 'defaultTemplate' },
      { name: 'Export Format (exportFormat)', value: 'exportFormat' },
      { name: 'Verbose Output (verbose)', value: 'verbose' },
      { name: 'Session Timeout (sessionTimeout)', value: 'sessionTimeout' }
    ]
  });

  let value: any;
  
  switch (key) {
    case 'agentApiKey':
      value = await input({
        message: 'Enter the AgentPRD API key:',
        validate: (input) => input.length > 0 || 'API key cannot be empty'
      });
      break;
    case 'agentUrl':
      value = await input({
        message: 'Enter the AgentPRD URL:',
        default: 'https://your-agent.agentuity.com',
        validate: (input) => input.startsWith('http') || 'URL must start with http:// or https://'
      });
      break;
    case 'approvalMode':
      value = await select({
        message: 'Select approval mode:',
        choices: [
          { name: 'Suggest (agent suggests, you approve)', value: 'suggest' },
          { name: 'Auto-edit (agent can edit files)', value: 'auto-edit' },
          { name: 'Full-auto (agent operates autonomously)', value: 'full-auto' }
        ]
      });
      break;
    case 'verbose':
      value = await confirm({
        message: 'Enable verbose output?',
        default: false
      });
      break;
    default:
      value = await input({
        message: `Enter value for ${key}:`
      });
  }

  await setConfig(key, String(value), output);
}

async function interactiveGetConfig(output: OutputManager): Promise<void> {
  const key = await input({
    message: 'Enter configuration key to get:'
  });
  
  getConfig(key, output);
}

async function resetConfig(output: OutputManager): Promise<void> {
  const confirmed = await confirm({
    message: 'Are you sure you want to reset all configuration to defaults?',
    default: false
  });

  if (confirmed) {
    config.reset();
    output.success('Configuration reset to defaults');
  } else {
    output.info('Reset cancelled');
  }
}

function showConfigHelp(output: OutputManager): void {
  console.log(chalk.blue('Configuration Commands:'));
  console.log();
  console.log(chalk.cyan('  agentpm config list          '), 'Show current configuration');
  console.log(chalk.cyan('  agentpm config set <key> <val>'), 'Set a configuration value');
  console.log(chalk.cyan('  agentpm config get <key>     '), 'Get a configuration value');
  console.log(chalk.cyan('  agentpm config reset         '), 'Reset to defaults');
  console.log();
  console.log(chalk.blue('Configuration Keys:'));
  console.log(chalk.gray('  agentUrl, agentApiKey, approvalMode, defaultTemplate'));
  console.log(chalk.gray('  exportFormat, verbose, sessionTimeout'));
}
