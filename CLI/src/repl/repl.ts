/**
 * REPL (Read-Eval-Print Loop) for AgentPM
 * 
 * Interactive conversational interface inspired by Codex CLI
 */

import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import { parseShortCommand, validateCommandArgs } from './commands.js';
import { AgentClient } from '../client/agent-client.js';
import { OutputManager } from '../utils/output.js';
import { handleError, AgentCommunicationError } from '../utils/errors.js';

interface REPLOptions {
  approvalMode: 'suggest' | 'auto-edit' | 'full-auto';
  verbose?: boolean;
}

export async function startREPL(options: REPLOptions) {
  const client = new AgentClient(options);
  const output = new OutputManager(options.verbose);
  
  output.info('Connected to AgentPRD cloud agent');
  console.log(chalk.dim('Approval mode:'), chalk.cyan(options.approvalMode));
  console.log();
  
  // REPL loop
  while (true) {
    try {
      const userInput = await input({
        message: chalk.blue('AgentPM>'),
        theme: {
          prefix: ''
        }
      });
      
      // Handle exit
      if (userInput.toLowerCase().trim() === 'exit' || userInput.toLowerCase().trim() === 'quit') {
        console.log(chalk.gray('👋 Goodbye!'));
        break;
      }
      
      // Handle empty input
      if (!userInput.trim()) {
        continue;
      }
      
      // Check for short commands
      if (userInput.startsWith('/')) {
        await handleShortCommand(userInput, client, output);
      } else {
        // Regular conversation with agent
        await handleConversation(userInput, client, output);
      }
      
      console.log(); // Add spacing between interactions
      
    } catch (error) {
      if (error instanceof Error && error.message === 'User force closed the prompt with ctrl+c') {
        console.log(chalk.gray('\n👋 Goodbye!'));
        break;
      }
      handleError(error, options.verbose);
    }
  }
}

async function handleShortCommand(command: string, client: AgentClient, output: OutputManager) {
  const parsedCommand = parseShortCommand(command);
  
  if (!parsedCommand) {
    output.error('Unknown command. Type /help for available commands.');
    return;
  }
  
  // Validate command arguments
  const validation = validateCommandArgs(parsedCommand);
  if (!validation.valid) {
    output.error(validation.error || 'Invalid command arguments');
    return;
  }
  
  const spinner = output.startSpinner(`Processing ${parsedCommand.name}...`);
  
  try {
    // Use actual agent communication
    const response = await client.sendMessage(parsedCommand.rawArgs, parsedCommand.name);
    output.succeedSpinner('Complete');
    
    // Display agent response
    console.log('\n' + response.content);
    
    // Show files if any
    if (response.files && response.files.length > 0) {
      console.log(chalk.gray('\n📁 Generated files:'));
      for (const file of response.files) {
        console.log(chalk.gray(`  • ${file.name} (${file.type})`));
        if (file.description) {
          console.log(chalk.gray(`    ${file.description}`));
        }
      }
    }
    
    // Show approval status
    if (response.needsApproval) {
      console.log(chalk.yellow('\n⚠️  Actions require approval (approval mode: suggest)'));
      console.log(chalk.gray('Use agentpm --approval-mode auto-edit to reduce prompting'));
    }
  } catch (error) {
    output.failSpinner('Command failed');
    handleError(error);
  }
}

async function handleConversation(message: string, client: AgentClient, output: OutputManager) {
  try {
    // Use streaming agent response
    const response = await client.streamMessage(message, undefined, (chunk) => {
      process.stdout.write(chunk);
    });
    
    console.log(); // New line after streaming
    
    // Show files if any
    if (response.files && response.files.length > 0) {
      console.log(chalk.gray('\n📁 Generated files:'));
      for (const file of response.files) {
        console.log(chalk.gray(`  • ${file.name} (${file.type})`));
        if (file.description) {
          console.log(chalk.gray(`    ${file.description}`));
        }
      }
    }
    
    // Show approval status
    if (response.needsApproval) {
      console.log(chalk.yellow('\n⚠️  Actions require approval (approval mode: suggest)'));
    }
    
  } catch (error) {
    output.error(`Agent communication failed: ${error instanceof Error ? error.message : error}`);
  }
}

function showHelp() {
  console.log(chalk.blue('📖 AgentPM Commands:'));
  console.log();
  console.log(chalk.cyan('Short Commands:'));
  console.log(chalk.gray('  /help                    - Show this help'));
  console.log(chalk.gray('  /templates               - List available templates'));
  console.log(chalk.gray('  /template <name>         - Use a specific template'));
  console.log(chalk.gray('  /create-prd <idea>       - Create a new PRD'));
  console.log(chalk.gray('  /brainstorm <topic>      - Start brainstorming session'));
  console.log(chalk.gray('  /export <format>         - Export current work'));
  console.log(chalk.gray('  /coach                   - Get PM coaching'));
  console.log();
  console.log(chalk.cyan('Conversation:'));
  console.log(chalk.gray('  Just type naturally! Ask me to create PRDs, brainstorm ideas,'));
  console.log(chalk.gray('  review your work, or get product management coaching.'));
  console.log();
  console.log(chalk.cyan('Examples:'));
  console.log(chalk.gray('  "Help me create a PRD for a mobile task management app"'));
  console.log(chalk.gray('  "Brainstorm features to improve user retention"'));
  console.log(chalk.gray('  "Review my PRD and suggest improvements"'));
  console.log();
  console.log(chalk.cyan('Control:'));
  console.log(chalk.gray('  exit, quit, Ctrl+C       - Exit AgentPM'));
}
