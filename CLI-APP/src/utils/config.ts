/**
 * Configuration management for AgentPM CLI
 * 
 * Handles loading and saving user preferences, agent URLs, API keys, etc.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Config {
  agentUrl?: string;
  agentId?: string;
  agentApiKey?: string;
  approvalMode?: 'suggest' | 'auto-edit' | 'full-auto';
  defaultTemplate?: string;
  exportFormat?: string;
  verbose?: boolean;
  userId?: string;
  sessionTimeout?: number;
}

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config: Config;
  
  constructor() {
    this.configDir = join(homedir(), '.agentpm');
    this.configPath = join(this.configDir, 'config.json');
    this.config = this.loadConfig();
  }
  
  private loadConfig(): Config {
    try {
      if (existsSync(this.configPath)) {
        const configData = readFileSync(this.configPath, 'utf-8');
        return JSON.parse(configData);
      }
    } catch (error) {
      console.warn('Warning: Could not load config file, using defaults');
    }
    
    return this.getDefaultConfig();
  }
  
  private getDefaultConfig(): Config {
    return {
      approvalMode: 'suggest',
      exportFormat: 'markdown',
      verbose: false,
      sessionTimeout: 3600 // 1 hour in seconds
    };
  }
  
  get(key: keyof Config): any {
    // Check environment variables first (they override config file)
    const envVar = this.getEnvVarName(key);
    const envValue = process.env[envVar];
    
    if (envValue !== undefined) {
      return this.parseEnvValue(key, envValue);
    }
    
    return this.config[key];
  }
  
  set(key: keyof Config, value: any): void {
    this.config[key] = value;
    this.saveConfig();
  }
  
  getAll(): Config {
    return { ...this.config };
  }
  
  private saveConfig(): void {
    try {
      // Ensure config directory exists
      if (!existsSync(this.configDir)) {
        mkdirSync(this.configDir, { recursive: true });
      }
      
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }
  
  private getEnvVarName(key: string): string {
    // Convert camelCase to UPPER_SNAKE_CASE with AGENTPM_ prefix
    const snakeCase = key.replace(/([A-Z])/g, '_$1').toUpperCase();
    return `AGENTPM_${snakeCase}`;
  }
  
  private parseEnvValue(key: keyof Config, value: string): any {
    // Parse environment variable values based on the expected type
    switch (key) {
      case 'verbose':
        return value.toLowerCase() === 'true';
      case 'approvalMode':
        if (['suggest', 'auto-edit', 'full-auto'].includes(value)) {
          return value;
        }
        return 'suggest';
      case 'sessionTimeout':
        return parseInt(value, 10) || 3600;
      default:
        return value;
    }
  }
  
  reset(): void {
    this.config = this.getDefaultConfig();
    this.saveConfig();
  }
  
  getConfigPath(): string {
    return this.configPath;
  }
  
  // Check if this is the first time setup
  isFirstTimeSetup(): boolean {
    return !existsSync(this.configPath) || !this.get('agentUrl');
  }
  
  // Validate if configuration is complete
  isConfigured(): boolean {
    const url = this.get('agentUrl');
    return !!(url && url.trim());
  }
}

// Singleton instance
export const config = new ConfigManager();
