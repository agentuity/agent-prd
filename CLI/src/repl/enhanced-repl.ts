/**
 * Enhanced REPL with slash command hints, autocompletion, and improved UX
 */

import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { AgentClient } from '../client/agent-client.js';
import { OutputManager } from '../utils/output.js';
import { handleError, AgentCommunicationError } from '../utils/errors.js';
import { 
  handleSlashCommand, 
  getCommandHints, 
  completeCommand,
  SLASH_COMMANDS 
} from './slash-commands.js';

interface REPLOptions {
  approvalMode: 'suggest' | 'auto-edit' | 'full-auto';
  verbose?: boolean;
}

export async function startEnhancedREPL(options: REPLOptions) {
  const client = new AgentClient(options);
  const output = new OutputManager(options.verbose);
  
  // Setup Ctrl+C handler
  process.on('SIGINT', () => {
    console.log(chalk.gray('\n👋 Goodbye!'));
    process.exit(0);
  });
  
  output.info('Connected to AgentPRD cloud agent');
  console.log(chalk.dim('Approval mode:'), chalk.cyan(options.approvalMode));
  console.log(chalk.dim('Type /help for commands, Tab for completion, Ctrl+C to exit'));
  console.log();
  
  // Show welcome hints
  console.log(chalk.dim('Quick start:'));
  console.log(chalk.dim('  /create-prd mobile analytics app'));
  console.log(chalk.dim('  /brainstorm user onboarding'));
  console.log(chalk.dim('  /coach prioritization frameworks'));
  console.log();
  
  // REPL loop
  while (true) {
    try {
      const userInput = await getInputWithHints();
      
      // Handle empty input
      if (!userInput.trim()) {
        continue;
      }
      
      // Handle slash commands
      if (userInput.startsWith('/')) {
        const wasHandled = await handleSlashCommand(userInput, client, output);
        if (wasHandled) {
          continue; // Command was handled locally
        }
        // If not handled locally, continue to send to agent
      }
      
      // Send to agent with streaming
      console.log();
      console.log(chalk.blue('🤖 AgentPRD:'));
      console.log(chalk.dim('─'.repeat(50)));
      
      try {
        let isFirstChunk = true;
        await client.streamMessage(userInput, getCommandFromInput(userInput), (chunk) => {
          if (isFirstChunk) {
            isFirstChunk = false;
          }
          process.stdout.write(chunk);
        });
        
        console.log(); // New line after streaming
        console.log();
        
      } catch (error) {
        if (error instanceof AgentCommunicationError) {
          handleError(error, output);
        } else {
          output.error(`Unexpected error: ${error}`);
        }
        console.log();
      }
      
    } catch (error) {
      if ((error as any).name === 'ExitPromptError') {
        console.log(chalk.gray('\n👋 Goodbye!'));
        break;
      }
      output.error(`REPL error: ${error}`);
    }
  }
}

async function getInputWithHints(): Promise<string> {
  const userInput = await input({
    message: chalk.blue('AgentPM>'),
    theme: {
      prefix: ''
    }
  });
  
  // Show hints if the input looks like it needs help
  if (userInput === '/') {
    showAvailableCommands();
    return await getInputWithHints(); // Ask again
  }
  
  // Show command completion hints for partial commands
  if (userInput.startsWith('/') && !userInput.includes(' ')) {
    const hints = getCommandHints(userInput);
    if (hints.length > 1 && hints.length < 10) {
      console.log(chalk.dim('💡 Available: ' + hints.join(', ')));
    }
  }
  
  return userInput;
}

function showAvailableCommands() {
  console.log();
  console.log(chalk.bold('Available Commands:'));
  
  const commands = Object.values(SLASH_COMMANDS)
    .filter(cmd => !['quit', 'exit'].includes(cmd.name)) // Hide exit commands from hints
    .slice(0, 6); // Show top 6 most useful commands
  
  commands.forEach(cmd => {
    const usage = `/${cmd.name}` + (cmd.args ? ` ${cmd.args[0] || ''}` : '');
    console.log(`  ${chalk.cyan(usage.padEnd(20))} ${chalk.dim(cmd.description)}`);
  });
  
  console.log(chalk.dim('  Type /help for full list'));
  console.log();
}

function getCommandFromInput(input: string): string | undefined {
  if (!input.startsWith('/')) return undefined;
  
  const parts = input.slice(1).split(' ');
  return parts[0] || undefined;
}

// Enhanced input function with hints (placeholder for future implementation)
async function getEnhancedInput(prompt: string): Promise<string> {
  // This could be enhanced with:
  // - Real-time hint display
  // - Tab completion
  // - Command history
  // - Better cursor handling
  
  // For now, fall back to basic input
  return await input({
    message: prompt,
    theme: { prefix: '' }
  });
}
