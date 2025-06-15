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
import { StreamingHandler } from '../utils/streaming-handler.js';
import { showWelcome, showUserMessage, showAgentHeader, showAgentFooter, showFormattedAgentContent } from '../utils/ascii-art.js';
import { getEnhancedInput } from '../utils/enhanced-input.js';

interface REPLOptions {
  approvalMode: 'suggest' | 'auto-edit' | 'full-auto';
  verbose?: boolean;
}

export async function startEnhancedREPL(options: REPLOptions) {
  const client = new AgentClient(options);
  const output = new OutputManager(options.verbose);
  const streamingHandler = new StreamingHandler();
  
  // Setup Ctrl+C handler
  process.on('SIGINT', () => {
    console.log(chalk.gray('\n👋 Goodbye!'));
    process.exit(0);
  });
  
  // Enable reasoning display by default if not set
  if (process.env.AGENTPM_SHOW_REASONING === undefined) {
    process.env.AGENTPM_SHOW_REASONING = 'true';
  }
  
  // Show enhanced welcome
  showWelcome();
  console.log(chalk.dim('Approval mode:'), chalk.cyan(options.approvalMode));
  if (process.env.AGENTPM_SHOW_REASONING === 'true') {
    console.log(chalk.dim('Reasoning display:'), chalk.yellow('enabled'));
  }
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
      
      // Show user message with enhanced formatting
      showUserMessage(userInput);
      
      // Send to agent with enhanced streaming
      streamingHandler.resetState();
      showAgentHeader();
      
      try {
        const response = await client.streamMessage(userInput, getCommandFromInput(userInput), (chunk) => {
          streamingHandler.processChunk(chunk);
        });
        
        streamingHandler.finish();
        
        // Now display the complete formatted response
        const content = streamingHandler.getBuffer();
        if (content.trim()) {
          showFormattedAgentContent(content);
          
          // Update the client's conversation history with the actual streamed content
          // This ensures /export and other commands have access to the real conversation
          client.updateLastAssistantMessage(content);
        }
        
        // Reset the handler state after we've used the content
        streamingHandler.resetState();
        
        // Only show export tip for substantial content (like PRDs, brainstorms, etc.)
        const isExportableContent = content.length > 500 || 
                                   content.includes('PRD') || 
                                   content.includes('brainstorm') ||
                                   userInput.startsWith('/create-prd') ||
                                   userInput.startsWith('/brainstorm');
        
        showAgentFooter(isExportableContent);
        
      } catch (error) {
        streamingHandler.finish();
        if (error instanceof AgentCommunicationError) {
          handleError(error, output);
        } else {
          output.error(`Unexpected error: ${error}`);
        }
        showAgentFooter(false); // No export tip on error
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
  // Use simple input for now to avoid issues
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
    .filter(cmd => !['quit'].includes(cmd.name)) // Hide exit commands from hints
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
