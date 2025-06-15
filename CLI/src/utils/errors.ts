/**
 * Error handling utilities for AgentPM CLI
 */

import chalk from 'chalk';

export class AgentPMError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentPMError';
  }
}

export class AgentCommunicationError extends AgentPMError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'AGENT_COMMUNICATION_ERROR');
    this.name = 'AgentCommunicationError';
  }
}

export class ConfigurationError extends AgentPMError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends AgentPMError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export function handleError(error: unknown, verbose: boolean = false): void {
  if (error instanceof AgentPMError) {
    console.error(chalk.red('❌ Error:'), error.message);
    
    if (error.code) {
      console.error(chalk.gray(`Code: ${error.code}`));
    }
    
    if (verbose && error.details) {
      console.error(chalk.gray('Details:'), JSON.stringify(error.details, null, 2));
    }
  } else if (error instanceof Error) {
    console.error(chalk.red('❌ Unexpected error:'), error.message);
    
    if (verbose && error.stack) {
      console.error(chalk.gray(error.stack));
    }
  } else {
    console.error(chalk.red('❌ Unknown error:'), String(error));
  }
  
  if (!verbose) {
    console.error(chalk.gray('Use --verbose for more details'));
  }
}

export function wrapAsyncHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await handler(...args);
    } catch (error) {
      handleError(error);
      process.exit(1);
    }
  };
}
