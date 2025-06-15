#!/usr/bin/env bun

/**
 * AgentPM CLI - AI-powered product management assistant
 * 
 * A lightweight CLI that communicates with the AgentPRD cloud agent
 * to help with PRD creation, brainstorming, and PM coaching.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { startREPL } from './repl/repl.js';
import { handleConfigCommand } from './commands/config.js';
import { OutputManager } from './utils/output.js';
import { AgentClient } from './client/agent-client.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const version = packageJson.version;

const program = new Command();

// Configure the main program
program
  .name('agentpm')
  .description('AI-powered product management assistant')
  .version(version)
  .option('-v, --verbose', 'verbose output')
  .option('--approval-mode <mode>', 'approval mode: suggest, auto-edit, full-auto', 'suggest');

// Main command - start REPL if no arguments
program
  .argument('[prompt]', 'initial prompt to send to agent')
  .action(async (prompt, options) => {
    if (prompt) {
      // Direct command mode - process single command and exit
      console.log(chalk.blue('🤖 AgentPM processing your request...'));
      await processSingleCommand(prompt, options);
      return;
    }
    
    // Welcome message
    console.log(boxen(
      chalk.bold.blue('🚀 AgentPM CLI') + '\n\n' +
      chalk.gray('AI-powered product management assistant') + '\n' +
      chalk.gray('Type /help for commands or just start chatting!'),
      {
        padding: 1,
        borderColor: 'blue',
        borderStyle: 'round'
      }
    ));
    
    // Start the REPL
    await startREPL(options);
  });

// Configuration command
program
  .command('config')
  .description('manage configuration')
  .argument('[action]', 'config action: list, set, get, reset')
  .argument('[key]', 'configuration key')
  .argument('[value...]', 'configuration value')
  .option('-v, --verbose', 'verbose output')
  .action(async (action, key, value, options) => {
    const output = new OutputManager(options.verbose);
    const args = [action, key, ...(value || [])].filter(Boolean);
    await handleConfigCommand(args, output);
  });

program
  .command('templates')
  .description('manage templates')
  .action(() => {
    console.log(chalk.yellow('⚠️  Template management not implemented yet'));
  });

// Single command processing function
async function processSingleCommand(prompt: string, options: any) {
  try {
    const output = new OutputManager(options.verbose);
    const client = new AgentClient({
      approvalMode: options.approvalMode,
      verbose: options.verbose
    });

    // Show connection status
    output.info('Connected to AgentPRD cloud agent');
    
    // Process the command
    let command: string | undefined;
    let message = prompt;
    
    if (prompt.startsWith('/')) {
      const [cmd, ...args] = prompt.slice(1).split(' ');
      command = cmd;
      message = args.join(' ');
    }

    // Show typing indicator
    const spinner = output.startSpinner('Processing...');
    
    try {
      const response = await client.sendMessage(message, command);
      output.succeedSpinner('Complete');
      
      // Display response
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
        console.log(chalk.gray('Use --approval-mode auto-edit or full-auto to reduce prompting'));
      }
    } catch (error) {
      output.failSpinner('Failed');
      output.error(`Agent error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    } 
  } catch (error) {
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}

// Parse arguments
await program.parseAsync();
