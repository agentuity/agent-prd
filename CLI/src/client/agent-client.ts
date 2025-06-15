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
  private baseUrl: string;
  
  constructor(options: ClientOptions) {
    this.options = options;
    this.baseUrl = this.getAgentUrl();
  }
  
  private getAgentUrl(): string {
    return config.get('agentUrl') || process.env.AGENTPM_AGENT_URL || 'http://127.0.0.1:3500';
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
      const apiKey = this.getApiKey();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add auth header if API key is configured (for production)
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/agent_6e3e7cfcfa122e1b5bfc5a930489e552`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const agentResponse: AgentResponse = await response.json();
      
      // Store session ID for continuity
      if (!this.sessionId) {
        this.sessionId = agentResponse.sessionId;
      }
      
      return agentResponse;
      
    } catch (error) {
      throw new Error(`Failed to communicate with AgentPRD: ${error}`);
    }
  }
  
  async streamMessage(message: string, command?: string, onChunk?: (chunk: string) => void): Promise<AgentResponse> {
    // For now, use sendMessage and simulate streaming with the response
    // TODO: Implement proper streaming when AgentPRD supports Server-Sent Events
    
    const response = await this.sendMessage(message, command);
    
    if (onChunk) {
      // Simulate streaming by breaking response into chunks
      const words = response.content.split(' ');
      for (const word of words) {
        onChunk(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 30)); // Faster streaming
      }
    }
    
    return response;
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
