/**
 * ASCII art and visual elements for better CLI UX
 */

import chalk from 'chalk';

export const AGENT_ICONS = {
  // Simple animated thinking dots
  thinking: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  
  // Agent avatar options
  agent: '🧠',
  user: '👤',
  
  // Status indicators
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  
  // Fancy ASCII art
  logo: `
    ╔═══════════════════════════════════════╗
    ║           🧠 AgentPRD CLI             ║
    ║     AI-Powered Product Management     ║
    ╚═══════════════════════════════════════╝
  `,
  
  // Compact logo for regular use
  compactLogo: `
  ┌─────────────────────────────────────┐
  │   🧠 AgentPRD - AI Product Manager  │
  └─────────────────────────────────────┘
  `,
  
  // Conversation separators
  userPrefix: '┌─ You',
  agentPrefix: '┌─ 🧠 AgentPRD',
  separator: '│',
  endMarker: '└─'
};

export function showWelcome(): void {
  console.log(chalk.cyan(AGENT_ICONS.compactLogo));
  console.log();
  console.log(chalk.dim('Connected and ready to help with product management!'));
  console.log(chalk.dim('Type /help for commands, Ctrl+C to exit'));
  console.log();
  
  // Quick start hints
  console.log(chalk.bold('Quick start:'));
  console.log(chalk.dim('  /create-prd mobile analytics app'));
  console.log(chalk.dim('  /brainstorm user retention features'));
  console.log(chalk.dim('  /coach product strategy'));
  console.log();
}

export function showUserMessage(message: string): void {
  console.log();
  console.log(chalk.blue('─ You ') + chalk.blue('─'.repeat(60)));
  console.log(message);
}

export function showAgentHeader(): void {
  console.log();
  console.log(chalk.green('─ 🧠 AgentPRD'));
}

export function showFormattedAgentContent(content: string): void {
  const terminalWidth = process.stdout.columns || 80;
  const boxWidth = Math.min(terminalWidth - 4, 76); // Leave some margin
  
  // Apply basic markdown-like formatting
  const formattedContent = formatMarkdownForTerminal(content);
  
  // Split content into lines and format each one
  const lines = formattedContent.split('\n');
  lines.forEach(line => {
    // Handle long lines by wrapping them
    if (line.length > boxWidth - 4) {
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        if ((currentLine + word).length > boxWidth - 4) {
          if (currentLine) {
            const padding = ' '.repeat(Math.max(0, boxWidth - 4 - currentLine.length));
            console.log(chalk.green('│ ') + currentLine + padding + chalk.green(' │'));
            currentLine = word;
          } else {
            // Word is too long, just truncate it
            const padding = ' '.repeat(Math.max(0, boxWidth - 4 - word.length));
            console.log(chalk.green('│ ') + word.substring(0, boxWidth - 4) + padding + chalk.green(' │'));
          }
        } else {
          currentLine += (currentLine ? ' ' : '') + word;
        }
      });
      
      if (currentLine) {
        const padding = ' '.repeat(Math.max(0, boxWidth - 4 - currentLine.length));
        console.log(chalk.green('│ ') + currentLine + padding + chalk.green(' │'));
      }
    } else {
      const padding = ' '.repeat(Math.max(0, boxWidth - 4 - line.length));
      console.log(chalk.green('│ ') + line + padding + chalk.green(' │'));
    }
  });
}

// Simple markdown formatting for terminal
function formatMarkdownForTerminal(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gm, chalk.bold.cyan('$1'))
    .replace(/^## (.*$)/gm, chalk.bold.blue('$1'))
    .replace(/^# (.*$)/gm, chalk.bold.magenta('$1'))
    // Bold
    .replace(/\*\*(.*?)\*\*/g, chalk.bold('$1'))
    // Italic
    .replace(/\*(.*?)\*/g, chalk.italic('$1'))
    // Code spans
    .replace(/`(.*?)`/g, chalk.yellow('$1'))
    // Lists
    .replace(/^- (.*$)/gm, '• $1')
    .replace(/^\d+\. (.*$)/gm, (match, content, offset, string) => {
      const lineNumber = string.substring(0, offset).split('\n').length;
      return `${lineNumber}. ${content}`;
    });
}

export function showAgentFooter(): void {
  console.log(chalk.gray('─'.repeat(40)));
  console.log();
}

export function showThinking(): void {
  process.stdout.write(chalk.yellow('🧠 Thinking'));
}

export function clearThinking(): void {
  process.stdout.write('\r' + ' '.repeat(20) + '\r');
}

export function showError(message: string): void {
  console.log();
  console.log(chalk.red(AGENT_ICONS.error + ' Error: ') + message);
  console.log();
}

export function showSuccess(message: string): void {
  console.log();
  console.log(chalk.green(AGENT_ICONS.success + ' ') + message);
  console.log();
}

export function showInfo(message: string): void {
  console.log();
  console.log(chalk.blue(AGENT_ICONS.info + ' ') + message);
  console.log();
}

export function showWarning(message: string): void {
  console.log();
  console.log(chalk.yellow(AGENT_ICONS.warning + ' ') + message);
  console.log();
}

// Animated typing effect for better UX
export function typeWriter(text: string, delay: number = 30): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        process.stdout.write(text[index]);
        index++;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}

// Progress indicators
export function showProgress(current: number, total: number, label: string = ''): void {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * current) / total);
  
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  
  process.stdout.write(`\r${label} [${chalk.green(bar)}] ${percentage}%`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}
