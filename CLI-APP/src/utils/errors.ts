/**
 * Enhanced error handling for CLI-APP
 */

export class AgentPMError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AgentPMError';
  }
}

export class ConfigurationError extends AgentPMError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends AgentPMError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AgentCommunicationError extends AgentPMError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'AGENT_COMM_ERROR');
    this.name = 'AgentCommunicationError';
  }
}

export function handleError(error: unknown, context?: string): string {
  let message = 'An unexpected error occurred';
  
  if (error instanceof AgentPMError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  if (context) {
    message = `${context}: ${message}`;
  }
  
  return message;
}

export function createErrorMessage(error: unknown, context?: string): {
  id: string;
  type: 'system';
  content: string;
  timestamp: Date;
} {
  return {
    id: `error-${Date.now()}`,
    type: 'system',
    content: `❌ Error: ${handleError(error, context)}`,
    timestamp: new Date()
  };
}

// Async wrapper for better error handling
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ result?: T; error?: string }> {
  try {
    const result = await operation();
    return { result };
  } catch (error) {
    return { error: handleError(error, context) };
  }
}
