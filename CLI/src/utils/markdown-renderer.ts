/**
 * Enhanced markdown renderer for CLI output
 */

import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import chalk from 'chalk';

// Configure marked for terminal output
marked.use(markedTerminal({
  // Customize the terminal renderer
  code: (code, lang) => {
    const highlighted = chalk.gray(code);
    return chalk.dim('┌─ ') + chalk.cyan(lang || 'code') + chalk.dim(' ─'.repeat(Math.max(0, 50 - (lang?.length || 4)))) + '\n' +
           highlighted.split('\n').map(line => chalk.dim('│ ') + line).join('\n') + '\n' +
           chalk.dim('└' + '─'.repeat(52));
  },
  blockquote: (quote) => {
    return quote.split('\n').map(line => chalk.dim('│ ') + chalk.italic(line)).join('\n');
  },
  html: (html) => '',
  heading: (text, level) => {
    const colors = [
      chalk.bold.magenta,      // h1
      chalk.bold.blue,         // h2  
      chalk.bold.cyan,         // h3
      chalk.bold.green,        // h4
      chalk.bold.yellow,       // h5
      chalk.bold.white         // h6
    ];
    const color = colors[level - 1] || chalk.bold.white;
    const prefix = '│ ' + '#'.repeat(level) + ' ';
    return color(prefix + text) + '\n';
  },
  hr: () => chalk.dim('├' + '─'.repeat(52) + '\n'),
  list: (body, ordered) => {
    return body;
  },
  listitem: (text) => {
    return chalk.dim('│ • ') + text;
  },
  paragraph: (text) => {
    return text.split('\n').map(line => chalk.dim('│ ') + line).join('\n') + '\n';
  },
  strong: (text) => chalk.bold.white(text),
  em: (text) => chalk.italic(text),
  codespan: (text) => chalk.yellow('`' + text + '`'),
  del: (text) => chalk.strikethrough(text),
  link: (href, title, text) => chalk.blue.underline(text) + chalk.dim(` (${href})`),
  table: (header, body) => {
    return header + body;
  },
  tablerow: (content) => {
    return chalk.dim('│ ') + content + '\n';
  },
  tablecell: (content, flags) => {
    return content + ' | ';
  }
}));

export function renderMarkdown(text: string): string {
  try {
    // Pre-process the text to handle streaming artifacts
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    if (!cleanText) {
      return '';
    }

    // Check if it's already formatted or just plain text
    const hasMarkdownFeatures = cleanText.includes('#') || 
                                cleanText.includes('**') || 
                                cleanText.includes('*') ||
                                cleanText.includes('`') ||
                                cleanText.includes('[') ||
                                cleanText.includes('|');

    if (!hasMarkdownFeatures) {
      // Plain text - just add borders
      return cleanText.split('\n').map(line => chalk.dim('│ ') + line).join('\n') + '\n';
    }

    const rendered = marked.parse(cleanText);
    
    // Add top border for formatted content
    return chalk.dim('┌' + '─'.repeat(52) + '\n') + 
           rendered + 
           chalk.dim('└' + '─'.repeat(52) + '\n');
           
  } catch (error) {
    // Fallback to plain text if markdown parsing fails
    return text.split('\n').map(line => chalk.dim('│ ') + line).join('\n') + '\n';
  }
}

export function renderStreamingText(chunk: string, isFirstChunk: boolean = false): string {
  // For streaming, we don't want to parse markdown until complete
  // Just add basic formatting
  if (isFirstChunk) {
    return chalk.dim('┌─ ') + chalk.cyan('Response') + chalk.dim(' ─'.repeat(44) + '\n') +
           chalk.dim('│ ') + chunk;
  }
  
  return chunk;
}

export function finishStreamingText(): string {
  return '\n' + chalk.dim('└' + '─'.repeat(52));
}

// Helper function to detect reasoning/thinking sections
export function isReasoningContent(text: string): boolean {
  const reasoningKeywords = [
    '<thinking>',
    '</thinking>',
    'Let me think',
    'I need to consider',
    'My reasoning',
    'Let me analyze',
    'Thinking through'
  ];
  
  return reasoningKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

export function renderReasoningContent(text: string): string {
  // Special formatting for reasoning/thinking content
  const content = text
    .replace(/<thinking>/gi, '')
    .replace(/<\/thinking>/gi, '')
    .trim();
    
  return chalk.dim('┌─ ') + chalk.yellow('🧠 Reasoning') + chalk.dim(' ─'.repeat(38) + '\n') +
         content.split('\n').map(line => chalk.dim('│ ') + chalk.italic.gray(line)).join('\n') + '\n' +
         chalk.dim('└' + '─'.repeat(52) + '\n');
}
