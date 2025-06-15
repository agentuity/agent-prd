/**
 * Output utilities for AgentPM CLI
 * 
 * Handles streaming output, formatted responses, and visual feedback
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class OutputManager {
  private currentSpinner?: Ora;
  
  constructor(private verbose: boolean = false) {}
  
  // Streaming output for AI responses
  async streamResponse(content: string, onChunk?: (chunk: string) => void): Promise<void> {
    const words = content.split(' ');
    
    process.stdout.write(chalk.green('🤖 AgentPM: '));
    
    for (const word of words) {
      const chunk = word + ' ';
      process.stdout.write(chunk);
      
      if (onChunk) {
        onChunk(chunk);
      }
      
      // Simulate realistic typing speed
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
    }
    
    process.stdout.write('\n');
  }
  
  // Show loading spinner
  startSpinner(text: string): Ora {
    this.currentSpinner = ora(text).start();
    return this.currentSpinner;
  }
  
  // Update spinner text
  updateSpinner(text: string): void {
    if (this.currentSpinner) {
      this.currentSpinner.text = text;
    }
  }
  
  // Stop spinner with success
  succeedSpinner(text?: string): void {
    if (this.currentSpinner) {
      this.currentSpinner.succeed(text);
      this.currentSpinner = undefined;
    }
  }
  
  // Stop spinner with failure
  failSpinner(text?: string): void {
    if (this.currentSpinner) {
      this.currentSpinner.fail(text);
      this.currentSpinner = undefined;
    }
  }
  
  // Stop spinner without status
  stopSpinner(): void {
    if (this.currentSpinner) {
      this.currentSpinner.stop();
      this.currentSpinner = undefined;
    }
  }
  
  // Formatted messages
  success(message: string): void {
    console.log(chalk.green('✅'), message);
  }
  
  error(message: string, error?: Error): void {
    console.error(chalk.red('❌'), message);
    if (error && this.verbose) {
      console.error(chalk.gray(error.stack || error.message));
    }
  }
  
  warning(message: string): void {
    console.log(chalk.yellow('⚠️'), message);
  }
  
  info(message: string): void {
    console.log(chalk.blue('ℹ️'), message);
  }
  
  verbose(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  }
  
  // Formatted lists
  list(items: string[], title?: string): void {
    if (title) {
      console.log(chalk.bold(title));
    }
    
    items.forEach(item => {
      console.log(chalk.gray('  •'), item);
    });
  }
  
  // Code block output
  codeBlock(content: string, language?: string): void {
    const lines = content.split('\n');
    console.log(chalk.gray('```' + (language || '')));
    lines.forEach(line => {
      console.log(chalk.gray(line));
    });
    console.log(chalk.gray('```'));
  }
  
  // Progress indication for long operations
  progress(current: number, total: number, message?: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
    
    const text = message ? `${message} ` : '';
    process.stdout.write(`\r${text}[${progressBar}] ${percentage}%`);
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }
  
  // Clear current line
  clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }
  
  // Separator line
  separator(): void {
    console.log(chalk.gray('─'.repeat(50)));
  }
}
