/**
 * Enhanced streaming handler with reasoning token detection
 */

import chalk from 'chalk';
import ora from 'ora';
import { renderMarkdown, renderStreamingText, finishStreamingText, isReasoningContent, renderReasoningContent } from './markdown-renderer.js';

export interface StreamingState {
  buffer: string;
  inReasoningBlock: boolean;
  reasoningBuffer: string;
  isFirstChunk: boolean;
  spinner?: any;
  hasStartedOutput: boolean;
}

export class StreamingHandler {
  private state: StreamingState = {
    buffer: '',
    inReasoningBlock: false,
    reasoningBuffer: '',
    isFirstChunk: true,
    hasStartedOutput: false
  };

  private thinkingSpinner?: any;
  private loadingSpinner?: any;
  private lastPreviewLength = 0;

  constructor() {
    this.resetState();
  }

  resetState() {
    this.state = {
      buffer: '',
      inReasoningBlock: false,
      reasoningBuffer: '',
      isFirstChunk: true,
      hasStartedOutput: false
    };
    
    if (this.thinkingSpinner) {
      this.thinkingSpinner.stop();
      this.thinkingSpinner = undefined;
    }
    
    if (this.loadingSpinner) {
      this.loadingSpinner.stop();
      this.loadingSpinner = undefined;
    }
    
    this.lastPreviewLength = 0;
  }

  processChunk(chunk: string): void {
    // Check for reasoning/thinking blocks
    if (chunk.toLowerCase().includes('<thinking>') || 
        chunk.toLowerCase().includes('thinking through') ||
        chunk.toLowerCase().includes('let me think')) {
      
      if (!this.state.inReasoningBlock) {
        this.startReasoningBlock();
      }
      this.state.inReasoningBlock = true;
      this.state.reasoningBuffer += chunk;
      return;
    }

    if (this.state.inReasoningBlock && 
        (chunk.toLowerCase().includes('</thinking>') || 
         chunk.toLowerCase().includes('based on this analysis') ||
         chunk.toLowerCase().includes('now i\'ll'))) {
      
      this.state.reasoningBuffer += chunk;
      this.finishReasoningBlock();
      return;
    }

    if (this.state.inReasoningBlock) {
      this.state.reasoningBuffer += chunk;
      this.updateReasoningSpinner();
      return;
    }

    // Regular content processing
    this.processRegularContent(chunk);
  }

  private startReasoningBlock() {
    if (!this.state.hasStartedOutput) {
      this.showHeader();
    }
    
    this.thinkingSpinner = ora({
      text: chalk.yellow('Thinking...'),
      color: 'yellow',
      spinner: 'dots12'
    }).start();
  }

  private updateReasoningSpinner() {
    if (this.thinkingSpinner) {
      // Update spinner text with some reasoning context
      const words = this.state.reasoningBuffer.toLowerCase();
      let context = 'Thinking...';
      
      if (words.includes('analyzing')) context = 'Analyzing...';
      else if (words.includes('considering')) context = 'Considering options...';
      else if (words.includes('planning')) context = 'Planning approach...';
      else if (words.includes('research')) context = 'Researching...';
      else if (words.includes('structure')) context = 'Structuring response...';
      
      this.thinkingSpinner.text = chalk.yellow(context);
    }
  }

  private finishReasoningBlock() {
    if (this.thinkingSpinner) {
      this.thinkingSpinner.succeed(chalk.gray('Reasoning complete'));
      this.thinkingSpinner = undefined;
    }

    // Optionally show reasoning content (for verbose mode)
    if (process.env.AGENTPM_SHOW_REASONING === 'true') {
      console.log(renderReasoningContent(this.state.reasoningBuffer));
    }

    this.state.inReasoningBlock = false;
    this.state.reasoningBuffer = '';
  }

  private processRegularContent(chunk: string) {
    this.state.buffer += chunk;
    
    // Show loading indicator with preview on first chunk
    if (this.state.isFirstChunk) {
      this.startLoadingIndicator();
      this.state.isFirstChunk = false;
    }
    
    // Update the preview line with content
    this.updatePreview();
  }

  private showHeader() {
    console.log();
    console.log(chalk.blue('🤖 AgentPRD'));
    this.state.hasStartedOutput = true;
  }

  finish(): void {
    if (this.thinkingSpinner) {
      this.thinkingSpinner.stop();
    }
    
    if (this.loadingSpinner) {
      this.loadingSpinner.stop();
      this.clearPreviewLine();
    }

    // Don't reset state here - we need the buffer for displaying content
  }

  getBuffer(): string {
    return this.state.buffer;
  }

  hasContent(): boolean {
    return this.state.buffer.length > 0 || this.state.reasoningBuffer.length > 0;
  }

  private startLoadingIndicator(): void {
    this.loadingSpinner = ora({
      text: chalk.gray('Generating response...'),
      color: 'cyan',
      spinner: 'dots'
    }).start();
  }

  private updatePreview(): void {
    if (!this.loadingSpinner) return;
    
    // Get first meaningful line as preview
    const lines = this.state.buffer.split('\n');
    let preview = '';
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine && !cleanLine.startsWith('#') && cleanLine.length > 10) {
        preview = cleanLine.substring(0, 60) + (cleanLine.length > 60 ? '...' : '');
        break;
      }
    }
    
    if (preview) {
      this.loadingSpinner.text = chalk.gray('Generating: ') + chalk.dim(preview);
    }
  }

  private clearPreviewLine(): void {
    // Clear the current line
    process.stdout.write('\r' + ' '.repeat(this.lastPreviewLength + 20) + '\r');
  }
}

// Global streaming handler instance
export const streamingHandler = new StreamingHandler();

// Helper function for backward compatibility
export function createStreamingCallback(): (chunk: string) => void {
  const handler = new StreamingHandler();
  
  return (chunk: string) => {
    handler.processChunk(chunk);
  };
}
