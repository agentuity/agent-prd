#!/usr/bin/env bun

/**
 * AgentPM CLI - AI-powered product management assistant (Ink TUI Version)
 * 
 * A modern terminal UI that communicates with the AgentPRD cloud agent
 * to help with PRD creation, brainstorming, and PM coaching.
 */

import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import App from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const version = packageJson.version;

const program = new Command();

// Configure the main program
program
  .name('agentpm')
  .description('AI-powered product management assistant with modern TUI')
  .version(version)
  .option('-v, --verbose', 'verbose output')
  .option('--approval-mode <mode>', 'approval mode: suggest, auto-edit, full-auto', 'suggest');

// Main command - start TUI
program
  .argument('[prompt]', 'initial prompt to send to agent')
  .action(async (prompt, options) => {
    // Start the Ink TUI app
    render(<App initialPrompt={prompt} options={options} />);
  });

// Parse arguments
await program.parseAsync();
