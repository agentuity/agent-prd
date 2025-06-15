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
  if (!content || !content.trim()) {
    return;
  }
  
  // Apply markdown formatting
  const formattedContent = formatMarkdownForTerminal(content);
  
  // Output the beautifully formatted content
  console.log(formattedContent);
}

// Enhanced markdown formatting for terminal
function formatMarkdownForTerminal(text: string): string {
  return text
    // Headers with better styling
    .replace(/^### (.*$)/gm, '\n' + chalk.bold.cyan('▶ $1') + '\n')
    .replace(/^## (.*$)/gm, '\n' + chalk.bold.blue('🔹 $1') + '\n')
    .replace(/^# (.*$)/gm, '\n' + chalk.bold.magenta('🚀 $1') + '\n')
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, chalk.bold.white('$1'))
    // Italic text  
    .replace(/\*(.*?)\*/g, chalk.italic.gray('$1'))
    // Code spans with background effect
    .replace(/`(.*?)`/g, chalk.black.bgYellow(' $1 '))
    // Unordered lists with better bullets
    .replace(/^- (.*$)/gm, chalk.cyan('  • ') + '$1')
    // Ordered lists with colored numbers
    .replace(/^\d+\. (.*$)/gm, (match, content) => {
      const num = match.split('.')[0];
      return chalk.cyan(`  ${num}.`) + ' ' + content;
    })
    // Quote blocks
    .replace(/^> (.*$)/gm, chalk.dim('│ ') + chalk.italic('$1'))
    // Horizontal rules
    .replace(/^---$/gm, chalk.dim('─'.repeat(50)))
    // Code blocks (basic detection)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const langLabel = lang ? chalk.cyan(`[${lang}]`) : chalk.cyan('[code]');
      return '\n' + langLabel + '\n' + 
             code.split('\n').map(line => chalk.gray('  ' + line)).join('\n') + '\n';
    });
}

export function showAgentFooter(): void {
  console.log(chalk.gray('─'.repeat(40)));
  console.log(chalk.dim.italic('💡 Tip: Use ') + chalk.dim.cyan('/export') + chalk.dim.italic(' to save this as markdown, PDF, or other formats'));
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
