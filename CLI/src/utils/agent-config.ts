/**
 * Dynamic agent configuration detection
 * Works with any developer's Agentuity setup
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const execAsync = promisify(exec);

interface AgentConfig {
  id: string;
  name: string;
}

interface AgentuityAgentInfo {
  agent: {
    id: string;
    name: string;
    io_types: string[];
  };
  filename: string;
  foundLocal: boolean;
  foundRemote: boolean;
}

interface AgentuityAgentList {
  [key: string]: AgentuityAgentInfo;
}

// Get agent configurations using Agentuity CLI
export async function getAgentConfigs(): Promise<{ productOrchestrator: AgentConfig; port: number }> {
  try {
    // Use official Agentuity CLI to get agent list
    const { stdout } = await execAsync('agentuity agent list --format json');
    const agentList: AgentuityAgentList = JSON.parse(stdout);
    
    // Find ProductOrchestrator agent
    const productOrchestratorKey = Object.keys(agentList).find(key => 
      agentList[key]?.agent?.name?.toLowerCase() === 'productorchestrator'
    );
    
    if (!productOrchestratorKey) {
      throw new Error('ProductOrchestrator agent not found. Run "agentuity agent list" to see available agents.');
    }
    
    const productOrchestrator = agentList[productOrchestratorKey]?.agent;
    
    if (!productOrchestrator) {
      throw new Error('Could not load agent details. Please check agent configuration.');
    }
    
    // Get port from agentuity.yaml if available
    let port = 3500;
    try {
      const yamlContent = await readFile('agentuity.yaml', 'utf-8');
      const config = parse(yamlContent);
      port = config.development?.port || 3500;
    } catch {
      // Use default port if YAML not readable
    }
    
    return { 
      productOrchestrator: { id: productOrchestrator.id, name: productOrchestrator.name },
      port 
    };
  } catch (error) {
    // Fallback to CLI check if JSON parsing failed
    if (error instanceof Error && error.message.includes('JSON')) {
      console.warn('Could not parse agentuity agent list. Falling back to defaults.');
    } else {
      console.warn('Agentuity CLI not available or no agents found. Using fallback values.');
    }
    
    return {
      productOrchestrator: { id: 'agent_6e3e7cfcfa122e1b5bfc5a930489e552', name: 'ProductOrchestrator' },
      port: 3500
    };
  }
}

// Generate agent URL based on mode and configuration
export async function generateAgentUrl(mode: 'local' | 'cloud'): Promise<string> {
  const { productOrchestrator, port } = await getAgentConfigs();
  
  if (mode === 'local') {
    return `http://127.0.0.1:${port}/${productOrchestrator.id}`;
  }
  
  // For cloud mode, use the actual Agentuity cloud URL
  return `https://agentuity.ai/api/${productOrchestrator.id}`;
}

// Dynamic agent URL configuration - works for any developer's agent IDs
export async function getAgentUrl(mode = 'auto'): Promise<string> {
  // If explicitly set via environment, use that
  if (process.env.AGENTPM_AGENT_URL) {
    return process.env.AGENTPM_AGENT_URL;
  }

  // Use dynamic config detection to work for any developer
  try {
    const url = await generateAgentUrl(mode === 'auto' ? 'local' : mode as 'local' | 'cloud');
    return url;
  } catch (error) {
    console.warn('Could not detect agent configuration. Using fallback.');
    // Fallback for development - this will only work in this specific project
    const fallbackId = 'agent_6e3e7cfcfa122e1b5bfc5a930489e552';
    switch (mode) {
      case 'local':
        return `http://127.0.0.1:3500/${fallbackId}`;
      case 'cloud':
        return `https://your-deployment.agentuity.cloud/${fallbackId}`;
      default:
        return `http://127.0.0.1:3500/${fallbackId}`;
    }
  }
}
