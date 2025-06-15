/**
 * Enhanced input handler with multi-line support and better UX
 */

import { input } from '@inquirer/prompts';
import chalk from 'chalk';

export interface EnhancedInputOptions {
  prompt?: string;
  multiline?: boolean;
  submitKey?: 'ctrl+enter' | 'cmd+enter';
  placeholder?: string;
}

// Simple function for enhanced input (simplified for now)
export async function getEnhancedInput(options: EnhancedInputOptions = {}): Promise<string> {
  const prompt = String(options.prompt || 'AgentPM>'); // Ensure it's a string
  
  // Show multi-line instructions
  if (options.multiline) {
    console.log(chalk.dim('💡 Tip: End with \\\\ for multi-line, or press Enter for single line'));
  }
  
  const userInput = await input({
    message: chalk.blue(prompt),
    theme: {
      prefix: ''
    }
  });
  
  // Check if user wants multi-line mode
  if (userInput.endsWith('\\\\')) {
    console.log(chalk.dim('Multi-line mode: Type your message, then type END on a new line to submit'));
    const lines = [userInput.slice(0, -2)]; // Remove the \\
    
    while (true) {
      const line = await input({
        message: '  ',
        theme: { prefix: '' }
      });
      
      if (line.trim().toUpperCase() === 'END') {
        break;
      }
      
      lines.push(line);
    }
    
    return lines.join('\n');
  }
  
  return userInput;
}
