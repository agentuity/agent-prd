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

export const getSlashCommandHelp = (): string => {
  return slashCommands.map(cmd => {
    const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
    return `/${cmd.name}${aliases} - ${cmd.description}`;
  }).join('\n');
};
