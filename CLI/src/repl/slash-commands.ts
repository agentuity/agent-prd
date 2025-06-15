/**
 * Enhanced slash command system with hints, autocompletion, and local handling
 */

import { AgentClient } from '../client/agent-client.js';
import { OutputManager } from '../utils/output.js';
import chalk from 'chalk';

export interface SlashCommand {
  name: string;
  description: string;
  args?: string[];
  examples?: string[];
  local?: boolean; // If true, handle locally without calling LLM
  handler?: (args: string[], client: AgentClient, output: OutputManager) => Promise<void>;
}

export const SLASH_COMMANDS: Record<string, SlashCommand> = {
  'help': {
    name: 'help',
    description: 'Show available commands and usage',
    examples: ['/help', '/help create-prd'],
    local: true,
    handler: handleHelpCommand
  },
  'create-prd': {
    name: 'create-prd',
    description: 'Interactive PRD creation (custom structure)',
    args: ['[product description]'],
    examples: ['/create-prd mobile analytics app', '/create-prd']
  },
  'brainstorm': {
    name: 'brainstorm',
    description: 'Feature ideation and prioritization',
    args: ['[topic]'],
    examples: ['/brainstorm user onboarding', '/brainstorm']
  },
  'coach': {
    name: 'coach',
    description: 'Strategic product management advice',
    args: ['[question]'],
    examples: ['/coach prioritization frameworks', '/coach']
  },
  'context': {
    name: 'context',
    description: 'Manage work context and goals',
    args: ['<action>', '[details]'],
    examples: [
      '/context set We\'re building user authentication',
      '/context get',
      '/context list',
      '/context switch auth-prd'
    ]
  },
  'history': {
    name: 'history',
    description: 'Show past PRDs and work',
    examples: ['/history']
  },
  'export': {
    name: 'export',
    description: 'Export current work to file',
    args: ['[format]'],
    examples: ['/export markdown', '/export pdf', '/export']
  },
  'quit': {
    name: 'quit',
    description: 'Exit AgentPM',
    local: true,
    handler: handleQuitCommand
  },
  'exit': {
    name: 'exit',
    description: 'Exit AgentPM (alias for quit)',
    local: true,
    handler: handleQuitCommand
  },
  'clear': {
    name: 'clear',
    description: 'Clear conversation history',
    local: true,
    handler: handleClearCommand
  }
};

async function handleHelpCommand(args: string[], client: AgentClient, output: OutputManager): Promise<void> {
  const specificCommand = args[0];
  
  if (specificCommand && SLASH_COMMANDS[specificCommand]) {
    const cmd = SLASH_COMMANDS[specificCommand];
    console.log();
    console.log(chalk.cyan(`/${cmd.name}`) + (cmd.args ? ` ${cmd.args.join(' ')}` : ''));
    console.log(chalk.dim(cmd.description));
    
    if (cmd.examples) {
      console.log();
      console.log(chalk.bold('Examples:'));
      cmd.examples.forEach(example => {
        console.log(chalk.dim('  ' + example));
      });
    }
    console.log();
  } else {
    console.log();
    console.log(chalk.bold('Available Commands:'));
    console.log();
    
    Object.values(SLASH_COMMANDS).forEach(cmd => {
      const usage = `/${cmd.name}` + (cmd.args ? ` ${cmd.args.join(' ')}` : '');
      console.log(`  ${chalk.cyan(usage.padEnd(25))} ${chalk.dim(cmd.description)}`);
    });
    
    console.log();
    console.log(chalk.dim('Use /help <command> for detailed help on a specific command'));
    console.log(chalk.dim('Press Tab for command completion, Ctrl+C or /quit to exit'));
    console.log();
  }
}

async function handleQuitCommand(args: string[], client: AgentClient, output: OutputManager): Promise<void> {
  console.log(chalk.gray('👋 Goodbye!'));
  process.exit(0);
}

async function handleClearCommand(args: string[], client: AgentClient, output: OutputManager): Promise<void> {
  client.clearSession();
  console.log(chalk.green('✓ Conversation history cleared'));
}

export function getCommandHints(input: string): string[] {
  const hints: string[] = [];
  
  if (input === '/') {
    // Show all commands when just "/" is typed
    return Object.keys(SLASH_COMMANDS).map(cmd => `/${cmd}`);
  }
  
  if (input.startsWith('/') && !input.includes(' ')) {
    // Command name completion
    const partial = input.slice(1).toLowerCase();
    return Object.keys(SLASH_COMMANDS)
      .filter(cmd => cmd.toLowerCase().startsWith(partial))
      .map(cmd => `/${cmd}`);
  }
  
  if (input.startsWith('/') && input.includes(' ')) {
    // Argument hints
    const [cmdPart, ...argParts] = input.split(' ');
    const cmdName = cmdPart.slice(1);
    const cmd = SLASH_COMMANDS[cmdName];
    
    if (cmd && cmd.args) {
      const currentArgIndex = argParts.length - 1;
      const expectedArg = cmd.args[currentArgIndex];
      
      if (expectedArg) {
        // Special handling for context command
        if (cmdName === 'context' && currentArgIndex === 0) {
          const contextActions = ['set', 'get', 'list', 'switch'];
          const partial = argParts[0]?.toLowerCase() || '';
          return contextActions
            .filter(action => action.startsWith(partial))
            .map(action => `${cmdPart} ${action}`);
        }
        
        hints.push(`Expected: ${expectedArg}`);
      }
    }
  }
  
  return hints;
}

export function completeCommand(input: string): string | null {
  if (!input.startsWith('/')) return null;
  
  if (!input.includes(' ')) {
    // Complete command name
    const partial = input.slice(1).toLowerCase();
    const matches = Object.keys(SLASH_COMMANDS)
      .filter(cmd => cmd.toLowerCase().startsWith(partial));
    
    if (matches.length === 1) {
      return `/${matches[0]}`;
    }
  } else {
    // Complete arguments
    const [cmdPart, ...argParts] = input.split(' ');
    const cmdName = cmdPart.slice(1);
    
    if (cmdName === 'context' && argParts.length === 1) {
      const contextActions = ['set', 'get', 'list', 'switch'];
      const partial = argParts[0]?.toLowerCase() || '';
      const matches = contextActions.filter(action => action.startsWith(partial));
      
      if (matches.length === 1) {
        return `${cmdPart} ${matches[0]}`;
      }
    }
  }
  
  return null;
}

export async function handleSlashCommand(
  input: string, 
  client: AgentClient, 
  output: OutputManager
): Promise<boolean> {
  const [cmdPart, ...args] = input.split(' ');
  const cmdName = cmdPart.slice(1);
  const command = SLASH_COMMANDS[cmdName];
  
  if (!command) {
    output.error(`Unknown command: ${cmdName}`);
    console.log(chalk.dim('Use /help to see available commands'));
    return true; // Handled (even if invalid)
  }
  
  if (command.local && command.handler) {
    // Handle locally without calling LLM
    await command.handler(args, client, output);
    return true;
  }
  
  // For non-local commands, return false to let REPL send to agent
  return false;
}
