import React from 'react';
import { Box, Text } from 'ink';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  title?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldContent, newContent, title }) => {
  const generateDiff = (old: string, new_: string): DiffLine[] => {
    const oldLines = old.split('\n');
    const newLines = new_.split('\n');
    const diff: DiffLine[] = [];
    
    // Simple line-by-line diff (for MVP)
    const maxLength = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (oldLine === undefined && newLine !== undefined) {
        // Line was added
        diff.push({ type: 'added', content: newLine, lineNumber: i + 1 });
      } else if (oldLine !== undefined && newLine === undefined) {
        // Line was removed
        diff.push({ type: 'removed', content: oldLine, lineNumber: i + 1 });
      } else if (oldLine !== newLine) {
        // Line was changed - show both
        if (oldLine !== undefined) {
          diff.push({ type: 'removed', content: oldLine, lineNumber: i + 1 });
        }
        if (newLine !== undefined) {
          diff.push({ type: 'added', content: newLine, lineNumber: i + 1 });
        }
      } else {
        // Line unchanged
        diff.push({ type: 'unchanged', content: oldLine, lineNumber: i + 1 });
      }
    }
    
    return diff;
  };
  
  const diffLines = generateDiff(oldContent, newContent);
  
  // Count changes
  const additions = diffLines.filter(l => l.type === 'added').length;
  const deletions = diffLines.filter(l => l.type === 'removed').length;
  
  return (
    <Box flexDirection="column" paddingY={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold>📝 {title}</Text>
        </Box>
      )}
      
      <Box marginBottom={1}>
        <Text dimColor>
          Changes: <Text color="green">+{additions}</Text> <Text color="red">-{deletions}</Text>
        </Text>
      </Box>
      
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        {diffLines.map((line, index) => (
          <Box key={index}>
            {line.type === 'added' && (
              <Text color="green">+ {line.content}</Text>
            )}
            {line.type === 'removed' && (
              <Text color="red">- {line.content}</Text>
            )}
            {line.type === 'unchanged' && (
              <Text dimColor>  {line.content.length > 80 ? line.content.substring(0, 77) + '...' : line.content}</Text>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Compact diff viewer for inline display
export const CompactDiffViewer: React.FC<{ changes: number; additions: number; deletions: number }> = ({
  changes,
  additions,
  deletions
}) => {
  return (
    <Box>
      <Text dimColor>
        {changes} changes: <Text color="green">+{additions}</Text> <Text color="red">-{deletions}</Text>
      </Text>
    </Box>
  );
};