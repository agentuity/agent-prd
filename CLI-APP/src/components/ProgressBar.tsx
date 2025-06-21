import React from 'react';
import { Box, Text } from 'ink';

interface ProgressBarProps {
  value: number; // 0-100
  width?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  width = 20,
  label,
  showPercentage = true,
  color = 'green',
  backgroundColor = 'gray'
}) => {
  const percentage = Math.min(100, Math.max(0, value));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  const filledChar = '█';
  const emptyChar = '░';
  
  return (
    <Box>
      {label && (
        <Text>
          {label}
          {'  '}
        </Text>
      )}
      
      <Text color={color}>
        {filledChar.repeat(filled)}
      </Text>
      <Text color={backgroundColor}>
        {emptyChar.repeat(empty)}
      </Text>
      
      {showPercentage && (
        <Text>
          {'  '}
          {percentage}%
        </Text>
      )}
    </Box>
  );
};

interface MultiProgressProps {
  items: {
    label: string;
    value: number;
    color?: string;
  }[];
  width?: number;
}

export const MultiProgress: React.FC<MultiProgressProps> = ({ items, width = 20 }) => {
  return (
    <Box flexDirection="column" gap={1}>
      {items.map((item, index) => (
        <ProgressBar
          key={index}
          label={item.label}
          value={item.value}
          width={width}
          color={item.color}
        />
      ))}
    </Box>
  );
};

interface CircularProgressProps {
  value: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 'medium',
  label
}) => {
  const percentage = Math.min(100, Math.max(0, value));
  
  // ASCII art circular progress indicators
  const getCircle = () => {
    if (size === 'small') {
      if (percentage === 0) return '○';
      if (percentage < 25) return '◔';
      if (percentage < 50) return '◑';
      if (percentage < 75) return '◕';
      return '●';
    }
    
    // For medium/large, use percentage text
    const filled = Math.round(percentage / 10);
    const segments = ['░', '▒', '▓', '█'];
    const segmentIndex = Math.min(3, Math.floor((percentage % 10) / 2.5));
    
    return `[${segments[segmentIndex].repeat(filled)}${' '.repeat(10 - filled)}] ${percentage}%`;
  };
  
  return (
    <Box>
      {label && (
        <Text>
          {label}: {' '}
        </Text>
      )}
      <Text color={percentage === 100 ? 'green' : percentage > 50 ? 'yellow' : 'gray'}>
        {getCircle()}
      </Text>
    </Box>
  );
};

// Completion status component for PRDs
interface CompletionStatusProps {
  sections: {
    title: string;
    completed: boolean;
  }[];
  checklistCompletion?: number;
}

export const CompletionStatus: React.FC<CompletionStatusProps> = ({
  sections,
  checklistCompletion
}) => {
  const completedSections = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const sectionCompletion = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  
  const overallCompletion = checklistCompletion !== undefined
    ? (sectionCompletion + checklistCompletion) / 2
    : sectionCompletion;
  
  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text bold>Overall Completion: </Text>
        <CircularProgress value={overallCompletion} size="small" />
      </Box>
      
      <Box flexDirection="column" marginLeft={2}>
        <ProgressBar
          label="Sections"
          value={sectionCompletion}
          width={15}
          color="blue"
        />
        
        {checklistCompletion !== undefined && (
          <ProgressBar
            label="Checklist"
            value={checklistCompletion}
            width={15}
            color="green"
          />
        )}
      </Box>
      
      <Box flexDirection="column" marginLeft={2}>
        <Text dimColor>Sections ({completedSections}/{totalSections}):</Text>
        {sections.map((section, index) => (
          <Box key={index} marginLeft={2}>
            <Text color={section.completed ? 'green' : 'gray'}>
              {section.completed ? '✓' : '○'} {section.title}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};