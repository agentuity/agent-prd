/**
 * HTTP client for communicating with AgentPRD cloud agent
 * 
 * Handles authentication, request/response formatting, and streaming
 */

import { config } from '../utils/config.js';
import { getAgentUrl } from '../utils/agent-config.js';

export interface AgentRequest {
  userId?: string;
  channel: 'cli';
  message: string;
  context?: {
    sessionId?: string;
    files?: FileAttachment[];
    approvalMode?: 'suggest' | 'auto-edit' | 'full-auto';
    command?: string;
  };
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

  constructor(options: ClientOptions) {
    this.options = options;
  }

  private async getAgentUrl(): Promise<string> {
    const configUrl = config.get('agentUrl');
    if (configUrl) return configUrl;

    return await getAgentUrl('auto');
  }

  private getApiKey(): string {
    return config.get('agentApiKey') || process.env.AGENTPM_AGENT_API_KEY || '';
  }

  async sendMessage(message: string, command?: string): Promise<AgentResponse> {
    const request: AgentRequest = {
      channel: 'cli',
      message,
      context: {
        sessionId: this.sessionId,
        approvalMode: this.options.approvalMode,
        command
      }
    };

    try {
      const targetUrl = await this.getAgentUrl();
      const apiKey = this.getApiKey();

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

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

      const agentResponse = await response.json() as AgentResponse;

      // Store session ID for continuity
      if (!this.sessionId) {
        this.sessionId = agentResponse.sessionId;
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
    const request: AgentRequest = {
      channel: 'cli',
      message,
      context: {
        sessionId: this.sessionId,
        approvalMode: this.options.approvalMode,
        command
      }
    };

    try {
      const targetUrl = await this.getAgentUrl();
      const apiKey = this.getApiKey();

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': this.sessionId || '',
      };

      // Only add auth header if API key is configured (for production)
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      console.log('targetUrl', targetUrl);
      console.log('headers', headers);
      console.log('request', request);

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

      // Handle streaming response
      let fullResponse = '';
      let lineBuffer = '';

      if (response.body && onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          lineBuffer += chunk;

          // Process complete lines for better rendering
          const lines = lineBuffer.split('\n');
          lineBuffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim()) {
              onChunk(`${line}\n`);
            }
          }
        }

        // Process any remaining content in buffer
        if (lineBuffer.trim()) {
          onChunk(lineBuffer);
        }
      } else {
        // Fallback to non-streaming
        const text = await response.text();
        try {
          const jsonResponse = JSON.parse(text) as AgentResponse;
          fullResponse = jsonResponse.content;
          if (onChunk) {
            onChunk(fullResponse);
          }

          // Store session ID for continuity
          if (!this.sessionId) {
            this.sessionId = jsonResponse.sessionId;
          }

          return jsonResponse;
        } catch {
          fullResponse = text;
          if (onChunk) {
            onChunk(fullResponse);
          }
        }
      }

      // Return structured response
      const agentResponse: AgentResponse = {
        content: fullResponse,
        sessionId: this.sessionId || this.generateSessionId(),
        needsApproval: this.options.approvalMode === 'suggest'
      };

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
  }
}
