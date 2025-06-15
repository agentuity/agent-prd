/**
 * Short command parsing for AgentPM REPL
 * 
 * Handles commands like /create-prd, /template, /export, etc.
 */

export interface ParsedCommand {
  name: string;
  args: string[];
  rawArgs: string;
}

export function parseShortCommand(input: string): ParsedCommand | null {
  // Remove leading slash and trim
  const cleaned = input.slice(1).trim();
  
  if (!cleaned) {
    return null;
  }
  
  // Split into command and arguments
  const parts = cleaned.split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);
  const rawArgs = args.join(' ');
  
  // Validate known commands
  const validCommands = [
    'help',
    'templates',
    'template',
    'create-prd',
    'brainstorm',
    'export',
    'coach',
    'config',
    'history'
  ];
  
  if (!validCommands.includes(name)) {
    return null;
  }
  
  return {
    name,
    args,
    rawArgs
  };
}

export function getCommandHelp(commandName: string): string {
  const helpText: Record<string, string> = {
    'help': 'Show available commands and usage examples',
    'templates': 'List all available PRD templates',
    'template': 'Select and use a specific template (e.g., /template saas-product)',
    'create-prd': 'Start creating a new PRD (e.g., /create-prd mobile task app)',
    'brainstorm': 'Start a brainstorming session (e.g., /brainstorm user retention)',
    'export': 'Export current work in specified format (e.g., /export pdf)',
    'coach': 'Get personalized product management coaching',
    'config': 'Manage AgentPM configuration settings',
    'history': 'Show conversation history and past PRDs'
  };
  
  return helpText[commandName] || 'Unknown command';
}

export function validateCommandArgs(command: ParsedCommand): { valid: boolean; error?: string } {
  switch (command.name) {
    case 'template':
      if (command.args.length === 0) {
        return { valid: false, error: 'Template name is required. Use /templates to see available options.' };
      }
      break;
    case 'create-prd':
      if (command.args.length === 0) {
        return { valid: false, error: 'PRD idea/description is required.' };
      }
      break;
    case 'brainstorm':
      if (command.args.length === 0) {
        return { valid: false, error: 'Brainstorming topic is required.' };
      }
      break;
    case 'export':
      if (command.args.length === 0) {
        return { valid: false, error: 'Export format is required (e.g., pdf, md, confluence).' };
      }
      break;
  }
  
  return { valid: true };
}
