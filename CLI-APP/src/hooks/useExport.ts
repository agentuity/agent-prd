import { useCallback } from 'react';
import { useChatContext } from '../context/ChatContext.js';
import type { Message } from '../types.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ExportOptions {
  includeTimestamps: boolean;
  includeMetadata: boolean;
  format: 'markdown' | 'json' | 'txt' | 'html';
}

export const useExport = () => {
  const { messages } = useChatContext();

  const exportToMarkdown = useCallback((messages: Message[], options: ExportOptions): string => {
    let content = '# AgentPM Conversation Export\n\n';
    
    if (options.includeMetadata) {
      content += `**Exported:** ${new Date().toLocaleString()}\n`;
      content += `**Messages:** ${messages.length}\n`;
      content += `**Duration:** ${messages.length > 0 ? 'Session active' : 'No messages'}\n\n`;
      content += '---\n\n';
    }

    messages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? ` *(${message.timestamp.toLocaleString()})*` 
        : '';
      
      content += `## ${message.type === 'user' ? '👤 You' : '🤖 Agent'}${timestamp}\n\n`;
      content += `${message.content}\n\n`;
    });

    return content;
  }, []);

  const exportToJSON = useCallback((messages: Message[], options: ExportOptions): string => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      options: {
        includeTimestamps: options.includeTimestamps,
        includeMetadata: options.includeMetadata
      },
      messages: messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        ...(options.includeTimestamps && { timestamp: msg.timestamp.toISOString() })
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }, []);

  const exportToText = useCallback((messages: Message[], options: ExportOptions): string => {
    let content = 'AgentPM Conversation Export\n';
    content += '================================\n\n';
    
    if (options.includeMetadata) {
      content += `Exported: ${new Date().toLocaleString()}\n`;
      content += `Messages: ${messages.length}\n\n`;
    }

    messages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? ` [${message.timestamp.toLocaleString()}]` 
        : '';
      
      content += `${message.type === 'user' ? 'YOU' : 'AGENT'}${timestamp}:\n`;
      content += `${message.content}\n\n`;
      content += '---\n\n';
    });

    return content;
  }, []);

  const exportToHTML = useCallback((messages: Message[], options: ExportOptions): string => {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>AgentPM Conversation Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .user { background-color: #e3f2fd; border-left: 4px solid #2196f3; }
        .agent { background-color: #f1f8e9; border-left: 4px solid #4caf50; }
        .timestamp { color: #666; font-size: 0.9em; }
        .type { font-weight: bold; margin-bottom: 5px; }
        .content { white-space: pre-wrap; }
        .metadata { background-color: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>🤖 AgentPM Conversation Export</h1>`;

    if (options.includeMetadata) {
      html += `
    <div class="metadata">
        <strong>Exported:</strong> ${new Date().toLocaleString()}<br>
        <strong>Messages:</strong> ${messages.length}<br>
        <strong>Total Characters:</strong> ${messages.reduce((acc, m) => acc + m.content.length, 0).toLocaleString()}
    </div>`;
    }

    messages.forEach((message) => {
      const timestamp = options.includeTimestamps 
        ? `<div class="timestamp">${message.timestamp.toLocaleString()}</div>` 
        : '';
      
      html += `
    <div class="message ${message.type}">
        <div class="type">${message.type === 'user' ? '👤 You' : '🤖 Agent'}</div>
        ${timestamp}
        <div class="content">${message.content.replace(/\n/g, '<br>')}</div>
    </div>`;
    });

    html += `
</body>
</html>`;

    return html;
  }, []);

  const exportConversation = useCallback((format: string, options: ExportOptions) => {
    try {
      let content: string;
      let extension: string;

      switch (format) {
        case 'markdown':
          content = exportToMarkdown(messages, options);
          extension = 'md';
          break;
        case 'json':
          content = exportToJSON(messages, options);
          extension = 'json';
          break;
        case 'txt':
          content = exportToText(messages, options);
          extension = 'txt';
          break;
        case 'html':
          content = exportToHTML(messages, options);
          extension = 'html';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `agentpm-conversation-${timestamp}.${extension}`;
      const filepath = join(process.cwd(), filename);

      writeFileSync(filepath, content, 'utf-8');
      
      return {
        success: true,
        filepath,
        filename,
        size: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [messages, exportToMarkdown, exportToJSON, exportToText, exportToHTML]);

  return {
    exportConversation,
    canExport: messages.length > 0
  };
};
