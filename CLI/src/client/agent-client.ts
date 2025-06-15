/**
 * HTTP client for communicating with AgentPRD cloud agent
 * 
 * Handles authentication, request/response formatting, and streaming
 */

import { config } from '../utils/config.js';

export interface AgentRequest {
  userId?: string;
  channel: 'cli';
  message: string;
  context?: {
    sessionId?: string;
    files?: FileAttachment[];
    approvalMode?: 'suggest' | 'auto-edit' | 'full-auto';
    command?: string;
    conversationHistory?: ConversationMessage[];
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AgentResponse {
  content: string;
  actions?: Action[];
  files?: GeneratedFile[];
  needsApproval?: boolean;
  sessionId: string;
  error?: string;
}

export interface FileAttachment {
  name: string;
  content: string;
  type: 'text' | 'binary';
}

export interface GeneratedFile {
  name: string;
  content: string;
  type: 'markdown' | 'pdf' | 'json';
  description?: string;
}

export interface Action {
  type: 'create-file' | 'update-file' | 'export' | 'template-apply';
  description: string;
  data: any;
}

export interface ClientOptions {
  approvalMode: 'suggest' | 'auto-edit' | 'full-auto';
  verbose?: boolean;
}

export class AgentClient {
  private options: ClientOptions;
  private sessionId?: string;
  private baseUrl?: string;
  private conversationHistory: ConversationMessage[] = [];

  constructor(options: ClientOptions) {
    this.options = options;
  }

  private getAgentUrl(): string {
    // Check for configured URL first
    const configUrl = config.get('agentUrl');
    if (configUrl) return configUrl;

    // Check environment variable
    if (process.env.AGENTPM_AGENT_URL) {
      return process.env.AGENTPM_AGENT_URL;
    }

    // Default to local development setup
    const agentId = config.get('agentId') || 'agent_6e3e7cfcfa122e1b5bfc5a930489e552';
    return `http://127.0.0.1:3500/${agentId}`;
  }

  private getApiKey(): string {
    return config.get('agentApiKey') || process.env.AGENTPM_AGENT_API_KEY || '';
  }

  async sendMessage(message: string, command?: string): Promise<AgentResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    const request: AgentRequest = {
      channel: 'cli',
      message,
      context: {
        sessionId: this.sessionId,
        approvalMode: this.options.approvalMode,
        command,
        conversationHistory: this.conversationHistory
      }
    };

    try {
      const targetUrl = this.getAgentUrl();
      const apiKey = this.getApiKey();

      if (this.options.verbose) {
        console.log('Connecting to:', targetUrl);
      }

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': this.sessionId || '',
      };

      // Only add auth header if API key is configured (for production)
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error response');
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
      }

      // Handle both JSON and text responses
      let agentResponse: AgentResponse;
      let responseText = await response.text();
      let hasMetadata = false;

      // Remove metadata if present
      if (responseText.includes('__AGENTPRD_METADATA__')) {
        hasMetadata = true;
        const parts = responseText.split('__AGENTPRD_METADATA__');
        responseText = parts[0] || ''; // Only keep the text before metadata
        
        // Try to parse metadata if available
        if (parts[1]) {
          try {
            const metadata = JSON.parse(parts[1].trim());
            // Update session info from metadata
            if (metadata.sessionId) {
              this.sessionId = metadata.sessionId;
            }
            if (metadata.conversationHistory) {
              this.conversationHistory = metadata.conversationHistory;
            }
          } catch (e) {
            console.warn('Failed to parse metadata in non-streaming response:', e);
          }
        }
      }

      try {
        agentResponse = JSON.parse(responseText) as AgentResponse;
      } catch {
        // If not JSON, treat as plain text content
        agentResponse = {
          content: responseText.trim(),
          sessionId: this.sessionId || this.generateSessionId(),
          needsApproval: this.options.approvalMode === 'suggest'
        };
      }

      // Store session ID for continuity
      if (!this.sessionId) {
        this.sessionId = agentResponse.sessionId;
      }

      // Only add assistant response to conversation history if metadata didn't already update it
      if (!hasMetadata) {
        this.conversationHistory.push({
          role: 'assistant',
          content: agentResponse.content,
          timestamp: new Date().toISOString()
        });
      }

      return agentResponse;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. The agent may be overloaded.');
      }
      throw new Error(`Failed to communicate with AgentPRD: ${error}`);
    }
  }

  async streamMessage(message: string, command?: string, onChunk?: (chunk: string) => void): Promise<AgentResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    const request: AgentRequest = {
      channel: 'cli',
      message,
      context: {
        sessionId: this.sessionId,
        approvalMode: this.options.approvalMode,
        command,
        conversationHistory: this.conversationHistory
      }
    };

    try {
      const targetUrl = this.getAgentUrl();
      const apiKey = this.getApiKey();

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'agentpm-cli/1.0',
        'x-session-id': this.sessionId || '',
      };

      // Only add auth header if API key is configured (for production)
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error response');
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
      }

      // Handle streaming response from Agentuity agent
      let fullResponse = '';
      let metadata: any = null;
      let metadataBuffer = ''; // Buffer for collecting complete metadata JSON

      if (response.body && onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let collectingMetadata = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // Check if this chunk contains metadata start marker
          if (chunk.includes('__AGENTPRD_METADATA__') && !collectingMetadata) {
            const parts = chunk.split('__AGENTPRD_METADATA__');
            const textPart = parts[0];
            const metadataStart = parts[1] || '';
            
            // Only show the text part before the metadata marker
            if (textPart) {
              fullResponse += textPart;
              onChunk(textPart);
            }
            
            // Start collecting metadata
            collectingMetadata = true;
            metadataBuffer = metadataStart;
          } else if (collectingMetadata) {
            // Continue collecting metadata chunks
            metadataBuffer += chunk;
          } else {
            // Regular text chunk
            fullResponse += chunk;
            onChunk(chunk);
          }
        }

        // Try to parse collected metadata
        if (metadataBuffer.trim()) {
          try {
            metadata = JSON.parse(metadataBuffer.trim());
          } catch (e) {
            console.warn('Failed to parse metadata buffer:', e);
            // Try to extract JSON if there's extra content after
            const jsonMatch = metadataBuffer.match(/^({.*})/);
            if (jsonMatch && jsonMatch[1]) {
              try {
                metadata = JSON.parse(jsonMatch[1].trim());
              } catch (e2) {
                console.warn('Failed to parse extracted JSON:', e2);
              }
            }
          }
        }
      } else {
        // Fallback to non-streaming
        fullResponse = await response.text();
        if (onChunk) {
          onChunk(fullResponse);
        }
      }

      // Use metadata from stream if available, otherwise create default response
      const agentResponse: AgentResponse = {
        content: fullResponse.trim(),
        sessionId: metadata?.sessionId || this.sessionId || this.generateSessionId(),
        needsApproval: metadata?.needsApproval ?? (this.options.approvalMode === 'suggest')
      };

      // Update session ID from metadata
      if (metadata?.sessionId) {
        this.sessionId = metadata.sessionId;
      } else if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
      }

      // Update conversation history from metadata, or add assistant response
      if (metadata?.conversationHistory) {
        this.conversationHistory = metadata.conversationHistory;
      } else {
        // Add assistant response to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: agentResponse.content,
          timestamp: new Date().toISOString()
        });
      }

      return agentResponse;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. The agent may be overloaded.');
      }
      throw new Error(`Failed to communicate with AgentPRD: ${error}`);
    }
  }

  async uploadFile(file: FileAttachment): Promise<string> {
    // TODO: Implement file upload to agent
    return 'mock-file-id';
  }

  async downloadFile(fileId: string): Promise<GeneratedFile> {
    // TODO: Implement file download from agent
    return {
      name: 'mock-file.md',
      content: '# Mock File Content',
      type: 'markdown'
    };
  }

  private generateSessionId(): string {
    return `cli-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  clearSession(): void {
    this.sessionId = undefined;
    this.conversationHistory = [];
  }

  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  getConversationSummary(): Array<{ type: 'prd' | 'brainstorm' | 'coach', title: string, timestamp: Date }> {
    const summaries: Array<{ type: 'prd' | 'brainstorm' | 'coach', title: string, timestamp: Date }> = [];

    for (let i = 0; i < this.conversationHistory.length; i += 2) {
      const userMsg = this.conversationHistory[i];
      const assistantMsg = this.conversationHistory[i + 1];

      if (userMsg && userMsg.role === 'user') {
        const type = userMsg.content.includes('prd') ? 'prd' :
          userMsg.content.includes('brainstorm') ? 'brainstorm' : 'coach';
        const title = userMsg.content.slice(0, 40) + (userMsg.content.length > 40 ? '...' : '');

        summaries.push({
          type,
          title,
          timestamp: new Date(userMsg.timestamp)
        });
      }
    }

    return summaries;
  }

  updateLastAssistantMessage(content: string): void {
    // Find the last assistant message and update it with the actual streamed content
    for (let i = this.conversationHistory.length - 1; i >= 0; i--) {
      if (this.conversationHistory[i].role === 'assistant') {
        this.conversationHistory[i].content = content;
        break;
      }
    }
  }
}
