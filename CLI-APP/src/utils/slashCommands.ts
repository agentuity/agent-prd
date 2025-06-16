import { StreamingHandler } from './streaming.js';

export interface SlashCommand {
  name: string;
  description: string;
  aliases?: string[];
  handler: (args: string[], context: SlashCommandContext) => Promise<boolean | void> | boolean | void;
}

export interface SlashCommandContext {
  setShowHelp: (show: boolean) => void;
  clearMessages: () => void;
  showMessage: (message: string) => void;
}

export const slashCommands: SlashCommand[] = [
  {
    name: 'help',
    description: 'Show available commands and keyboard shortcuts',
    aliases: ['h', '?'],
    handler: (args, context) => {
      context.setShowHelp(true);
    }
  },
  {
    name: 'export',
    description: 'Export conversation to file',
    aliases: ['e'],
    handler: (args, context) => {
      // This should be handled by the agent
      return false; // Send to agent
    }
  },
  {
    name: 'clear',
    description: 'Clear conversation history',
    aliases: ['c'],
    handler: (args, context) => {
      context.clearMessages();
    }
  },
  {
    name: 'prd',
    description: 'Work with a specific PRD (show/delete/export)',
    handler: (args, context) => {
      return handlePRDCommand(args, context);
    }
  },
  {
    name: 'brainstorm',
    description: 'Start a brainstorming session',
    handler: (args, context) => {
      // This will be handled by the agent
      return;
    }
  },
  {
    name: 'coach',
    description: 'Get product management coaching',
    handler: (args, context) => {
      // This will be handled by the agent
      return;
    }
  },
  {
    name: 'context',
    description: 'Manage work context and goals',
    handler: (args, context) => {
      // This should be handled by the agent, not locally
      return false; // Send to agent
    }
  },
  {
    name: 'create-prd',
    description: 'Interactive PRD creation with custom structure',
    handler: (args, context) => {
      // This should be handled by the agent
      return false; // Send to agent
    }
  },
  {
    name: 'prds',
    description: 'List and manage your PRDs',
    handler: (args, context) => {
      // This should be handled by the agent, not locally
      return false; // Send to agent
    }
  },
  {
    name: 'history',
    description: 'Show past PRDs and work',
    handler: (args, context) => {
      handleHistoryCommand(args, context);
    }
  },
  {
    name: 'reasoning',
    description: 'Toggle display of AI reasoning process',
    handler: (args, context) => {
      handleReasoningToggle(args, context);
    }
  }
];

export const parseSlashCommand = (input: string): { command: string; args: string[]; isSlashCommand: boolean } => {
  if (!input.startsWith('/')) {
    return { command: '', args: [], isSlashCommand: false };
  }

  const parts = input.slice(1).split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args, isSlashCommand: true };
};

export const executeSlashCommand = (command: string, args: string[], context: SlashCommandContext): boolean => {
  const slashCommand = slashCommands.find(cmd =>
    cmd.name === command || (cmd.aliases && cmd.aliases.includes(command))
  );

  if (slashCommand) {
    const result = slashCommand.handler(args, context);
    // If handler returns false, command should be sent to agent
    if (result === false) {
      return false;
    }
    return true;
  }

  return false;
};



// PRD command handlers
function handlePRDCommand(args: string[], context: SlashCommandContext): boolean {
  const [action, id] = args;
  
  if (!action) {
    context.showMessage('Please specify an action: /prd <show|delete|export> [id]');
    return true;
  }
  
  switch (action.toLowerCase()) {
    case 'show':
      if (!id) {
        context.showMessage('Please specify a PRD ID: /prd show <id>');
        return true;
      }
      context.showMessage(`📋 PRD #${id}:
Retrieving PRD from storage...

PRD display functionality coming soon!`);
      return true;
      
    case 'delete':
      if (!id) {
        context.showMessage('Please specify a PRD ID: /prd delete <id>');
        return true;
      }
      context.showMessage(`⚠️ Delete PRD #${id}? This cannot be undone.
Delete functionality coming soon!`);
      return true;
      
    case 'export':
      if (!id) {
        context.showMessage('Please specify a PRD ID: /prd export <id>');
        return true;
      }
      // Let the agent handle the export - return false to send to agent
      return false;
      
    default:
      context.showMessage(`Unknown action: ${action}. Use: show, delete, or export`);
      return true;
  }
}

// History command handler
function handleHistoryCommand(args: string[], context: SlashCommandContext): void {
  context.showMessage(`📚 Work History:
(History management coming soon - will show past PRDs, brainstorms, and coaching sessions)

For now, check your conversation history above.`);
}

// Reasoning toggle handler
function handleReasoningToggle(args: string[], context: SlashCommandContext): void {
  const currentSetting = process.env.AGENTPM_SHOW_REASONING === 'true';
  const newSetting = !currentSetting;
  
  // Toggle the environment variable
  process.env.AGENTPM_SHOW_REASONING = newSetting.toString();
  
  if (newSetting) {
    context.showMessage('✓ Reasoning display enabled\nYou will now see the AI\'s thinking process');
  } else {
    context.showMessage('○ Reasoning display disabled\nOnly final responses will be shown');
  }
}

export const getSlashCommandHelp = (): string => {
  return slashCommands.map(cmd => {
    const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
    return `/${cmd.name}${aliases} - ${cmd.description}`;
  }).join('\n');
};
