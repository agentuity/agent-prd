export interface SlashCommand {
  name: string;
  description: string;
  aliases?: string[];
  handler: (args: string[], context: SlashCommandContext) => Promise<void> | void;
}

export interface SlashCommandContext {
  setShowHelp: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  clearMessages: () => void;
  exportConversation: (format: string, options: any) => any;
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
      context.setShowExport(true);
    }
  },
  {
    name: 'sidebar',
    description: 'Toggle sidebar with session info',
    aliases: ['s', 'info'],
    handler: (args, context) => {
      context.setShowSidebar(true);
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
    description: 'Create a Product Requirements Document',
    handler: (args, context) => {
      // This will be handled by the agent
      return;
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
      handleContextCommand(args, context);
    }
  },
  {
    name: 'create-prd',
    description: 'Interactive PRD creation with custom structure',
    handler: (args, context) => {
      // This will be handled by the agent
      return;
    }
  },
  {
    name: 'prds',
    description: 'List and manage your PRDs',
    handler: (args, context) => {
      handlePrdsCommand(args, context);
    }
  },
  {
    name: 'history',
    description: 'Show past PRDs and work',
    handler: (args, context) => {
      handleHistoryCommand(args, context);
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
    slashCommand.handler(args, context);
    return true;
  }

  return false;
};

// Context management storage (in-memory for now)
interface WorkContext {
  id: string;
  name: string;
  description: string;
  goals: string[];
  created: Date;
  lastUsed: Date;
}

let currentContext: WorkContext | null = null;
let contexts: WorkContext[] = [];

// Context command handlers
function handleContextCommand(args: string[], context: SlashCommandContext): void {
  const [action, ...rest] = args;
  
  if (!action) {
    context.showMessage(`Context commands:
/context set <description> - Set current work context
/context get - Show current context
/context list - List all contexts
/context switch <name> - Switch to a context

Current context: ${currentContext ? currentContext.name : 'None'}`);
    return;
  }
  
  switch (action.toLowerCase()) {
    case 'set':
      const description = rest.join(' ');
      if (!description) {
        context.showMessage('Please provide a context description: /context set <description>');
        return;
      }
      
      currentContext = {
        id: `ctx-${Date.now()}`,
        name: description.slice(0, 30) + (description.length > 30 ? '...' : ''),
        description,
        goals: [],
        created: new Date(),
        lastUsed: new Date()
      };
      
      // Add to contexts list if not already there
      const existingIndex = contexts.findIndex(c => c.description === description);
      if (existingIndex >= 0) {
        contexts[existingIndex] = currentContext;
      } else {
        contexts.push(currentContext);
      }
      
      context.showMessage(`✓ Context set: ${currentContext.name}`);
      break;
      
    case 'get':
      if (!currentContext) {
        context.showMessage('No active context. Use /context set <description> to set one.');
      } else {
        context.showMessage(`Current context: ${currentContext.name}
Description: ${currentContext.description}
Created: ${currentContext.created.toLocaleDateString()}`);
      }
      break;
      
    case 'list':
      if (contexts.length === 0) {
        context.showMessage('No contexts saved. Use /context set <description> to create one.');
      } else {
        const list = contexts.map((ctx, i) => `${i + 1}. ${ctx.name} (${ctx.created.toLocaleDateString()})`).join('\n');
        context.showMessage(`Saved contexts:\n${list}`);
      }
      break;
      
    case 'switch':
      const targetName = rest.join(' ');
      if (!targetName) {
        context.showMessage('Please specify context name: /context switch <name>');
        return;
      }
      
      const targetContext = contexts.find(c => c.name.toLowerCase().includes(targetName.toLowerCase()));
      if (!targetContext) {
        context.showMessage(`Context not found: ${targetName}`);
      } else {
        currentContext = targetContext;
        currentContext.lastUsed = new Date();
        context.showMessage(`✓ Switched to context: ${targetContext.name}`);
      }
      break;
      
    default:
      context.showMessage(`Unknown context action: ${action}. Use /context for help.`);
  }
}

// PRDs command handlers
function handlePrdsCommand(args: string[], context: SlashCommandContext): void {
  const [action] = args;
  
  switch (action?.toLowerCase()) {
    case 'list':
      context.showMessage('📋 Recent PRDs:\n(PRD management coming soon - will integrate with agent history)');
      break;
      
    case 'recent':
      context.showMessage('📋 Recent PRDs:\n(PRD management coming soon - will integrate with agent history)');
      break;
      
    case 'search':
      context.showMessage('🔍 PRD Search:\n(PRD search coming soon - will integrate with agent history)');
      break;
      
    default:
      context.showMessage(`PRD commands:
/prds list - List all PRDs
/prds recent - Show recent PRDs
/prds search <term> - Search PRDs

(Full PRD management coming soon)`);
  }
}

// History command handler
function handleHistoryCommand(args: string[], context: SlashCommandContext): void {
  context.showMessage(`📚 Work History:
(History management coming soon - will show past PRDs, brainstorms, and coaching sessions)

For now, use the sidebar to see current session information.`);
}

export const getSlashCommandHelp = (): string => {
  return slashCommands.map(cmd => {
    const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
    return `/${cmd.name}${aliases} - ${cmd.description}`;
  }).join('\n');
};
