/**
 * Enhanced streaming handler with reasoning detection and tool call events for CLI-APP
 */

export interface ToolEvent {
  type: 'tool-call-start' | 'tool-call' | 'tool-result' | 'step-finish';
  toolName?: string;
  args?: any;
  result?: any;
  toolCallId?: string;
  isContinued?: boolean;
  timestamp: number;
}

export interface StreamingState {
  buffer: string;
  inReasoningBlock: boolean;
  reasoningBuffer: string;
  isFirstChunk: boolean;
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

  private onChunkCallback?: (chunk: string) => void;
  private onReasoningCallback?: (reasoning: string) => void;
  private onToolEventCallback?: (event: ToolEvent) => void;

  constructor(
    onChunk?: (chunk: string) => void,
    onReasoning?: (reasoning: string) => void,
    onToolEvent?: (event: ToolEvent) => void
  ) {
    this.onChunkCallback = onChunk;
    this.onReasoningCallback = onReasoning;
    this.onToolEventCallback = onToolEvent;
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
      return;
    }

    // Regular content processing
    this.processRegularContent(chunk);
  }

  private startReasoningBlock() {
    // Notify about reasoning start
    this.onReasoningCallback?.('🧠 Agent is thinking...');
  }

  private finishReasoningBlock() {
    // Show reasoning if enabled
    if (process.env.AGENTPM_SHOW_REASONING === 'true') {
      this.onReasoningCallback?.(this.state.reasoningBuffer);
    }

    this.state.inReasoningBlock = false;
    this.state.reasoningBuffer = '';
  }

  private processRegularContent(chunk: string) {
    this.state.buffer += chunk;
    
    // Pass chunk to callback for real-time display
    if (this.onChunkCallback) {
      this.onChunkCallback(chunk);
    }
  }

  finish(): void {
    // Don't reset state here - we need the buffer for displaying content
  }

  getBuffer(): string {
    return this.state.buffer;
  }

  hasContent(): boolean {
    return this.state.buffer.length > 0 || this.state.reasoningBuffer.length > 0;
  }

  // Process tool events
  processToolEvent(event: ToolEvent): void {
    this.onToolEventCallback?.(event);
  }

  // Enable/disable reasoning display
  static setReasoningDisplay(enabled: boolean): void {
    process.env.AGENTPM_SHOW_REASONING = enabled.toString();
  }

  static isReasoningEnabled(): boolean {
    return process.env.AGENTPM_SHOW_REASONING === 'true';
  }
}

// Helper function for backward compatibility
export function createStreamingCallback(): (chunk: string) => void {
  const handler = new StreamingHandler();
  
  return (chunk: string) => {
    handler.processChunk(chunk);
  };
}
