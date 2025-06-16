import React from 'react';
import { Box, Text } from 'ink';

interface MarkdownRendererProps {
  content: string;
}

interface MarkdownNode {
  type: 'paragraph' | 'heading' | 'code' | 'codeblock' | 'list' | 'listitem' | 'bold' | 'italic' | 'text';
  content: string;
  level?: number; // for headings
  language?: string; // for code blocks
  children?: MarkdownNode[];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseMarkdown = (text: string): MarkdownNode[] => {
    const lines = text.split('\n');
    const nodes: MarkdownNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        nodes.push({
          type: 'heading',
          content: headerMatch[2],
          level: headerMatch[1].length
        });
        i++;
        continue;
      }

      // Code blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        nodes.push({
          type: 'codeblock',
          content: codeLines.join('\n'),
          language: language || 'text'
        });
        i++; // Skip closing ```
        continue;
      }

      // List items
      const listMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
      if (listMatch) {
        nodes.push({
          type: 'listitem',
          content: listMatch[1]
        });
        i++;
        continue;
      }

      // Regular paragraph with inline formatting
      nodes.push({
        type: 'paragraph',
        content: line,
        children: parseInlineMarkdown(line)
      });
      i++;
    }

    return nodes;
  };

  const parseInlineMarkdown = (text: string): MarkdownNode[] => {
    const nodes: MarkdownNode[] = [];
    const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|([^`*]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        // Inline code
        nodes.push({
          type: 'code',
          content: match[1].slice(1, -1) // Remove backticks
        });
      } else if (match[2]) {
        // Bold
        nodes.push({
          type: 'bold',
          content: match[2].slice(2, -2) // Remove **
        });
      } else if (match[3]) {
        // Italic
        nodes.push({
          type: 'italic',
          content: match[3].slice(1, -1) // Remove *
        });
      } else if (match[4] && match[4].trim()) {
        // Regular text
        nodes.push({
          type: 'text',
          content: match[4]
        });
      }
    }

    return nodes;
  };

  const renderNode = (node: MarkdownNode, index: number): React.ReactElement => {
    switch (node.type) {
      case 'heading':
        const headingColor = node.level === 1 ? 'blue' : node.level === 2 ? 'green' : 'cyan';
        const prefix = '#'.repeat(node.level || 1);
        return (
          <Box key={index} marginBottom={1}>
            <Text color={headingColor} bold>
              {prefix} {node.content}
            </Text>
          </Box>
        );

      case 'paragraph':
        return (
          <Box key={index} marginBottom={1}>
            <Text>
              {node.children?.map((child, childIndex) => renderInlineNode(child, childIndex))}
            </Text>
          </Box>
        );

      case 'codeblock':
        return (
          <Box key={index} borderStyle="single" borderColor="gray" paddingX={1}>
            <Box flexDirection="column">
              {node.language && (
                <Text color="gray" dimColor>
                  {node.language}
                </Text>
              )}
              <Text color="green">
                {node.content}
              </Text>
            </Box>
          </Box>
        );

      case 'listitem':
        return (
          <Box key={index}>
            <Text color="yellow">• </Text>
            <Text>{node.content}</Text>
          </Box>
        );

      default:
        return (
          <Box key={index}>
            <Text>{node.content}</Text>
          </Box>
        );
    }
  };

  const renderInlineNode = (node: MarkdownNode, index: number): React.ReactElement => {
    switch (node.type) {
      case 'bold':
        return <Text key={index} bold>{node.content}</Text>;
      
      case 'italic':
        return <Text key={index} italic>{node.content}</Text>;
      
      case 'code':
        return (
          <Text key={index} backgroundColor="gray" color="white">
            {` ${node.content} `}
          </Text>
        );
      
      case 'text':
      default:
        return <Text key={index}>{node.content}</Text>;
    }
  };

  const nodes = parseMarkdown(content);

  return (
    <Box flexDirection="column">
      {nodes.map((node, index) => renderNode(node, index))}
    </Box>
  );
};
