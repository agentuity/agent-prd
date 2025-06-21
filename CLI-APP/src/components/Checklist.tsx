import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category?: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;
  onComplete?: (items: ChecklistItem[]) => void;
  title?: string;
  interactive?: boolean;
}

export const Checklist: React.FC<ChecklistProps> = ({
  items,
  onToggle,
  onComplete,
  title,
  interactive = true
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useInput((input, key) => {
    if (!interactive) return;

    if (key.upArrow) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      setSelectedIndex(Math.min(localItems.length - 1, selectedIndex + 1));
    } else if (input === ' ' || key.return) {
      // Toggle the selected item
      const newItems = [...localItems];
      newItems[selectedIndex] = {
        ...newItems[selectedIndex],
        completed: !newItems[selectedIndex].completed
      };
      setLocalItems(newItems);
      
      if (onToggle) {
        onToggle(newItems[selectedIndex].id);
      }
    } else if (input === 'a') {
      // Toggle all
      const allCompleted = localItems.every(item => item.completed);
      const newItems = localItems.map(item => ({
        ...item,
        completed: !allCompleted
      }));
      setLocalItems(newItems);
    } else if (key.escape && onComplete) {
      onComplete(localItems);
    }
  });

  // Group items by category
  const categories = new Map<string, ChecklistItem[]>();
  localItems.forEach(item => {
    const category = item.category || 'General';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(item);
  });

  const completedCount = localItems.filter(item => item.completed).length;
  const totalCount = localItems.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  let currentIndex = 0;

  return (
    <Box flexDirection="column">
      {title && (
        <Box marginBottom={1}>
          <Text bold>{title}</Text>
          <Text dimColor> ({completedCount}/{totalCount} - {completionPercentage}%)</Text>
        </Box>
      )}

      {Array.from(categories.entries()).map(([category, categoryItems]) => (
        <Box key={category} flexDirection="column" marginBottom={1}>
          {categories.size > 1 && (
            <Text dimColor italic>{category}:</Text>
          )}
          
          {categoryItems.map(item => {
            const isSelected = interactive && currentIndex === selectedIndex;
            currentIndex++;
            
            return (
              <Box key={item.id} paddingLeft={categories.size > 1 ? 2 : 0}>
                <Text color={isSelected ? 'blue' : undefined}>
                  {isSelected ? '▶ ' : '  '}
                </Text>
                <Text color={item.completed ? 'green' : 'gray'}>
                  [{item.completed ? '✓' : ' '}]
                </Text>
                <Text
                  strikethrough={item.completed}
                  dimColor={item.completed}
                >
                  {' '}{item.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      ))}

      {interactive && (
        <Box marginTop={1}>
          <Text dimColor>
            [↑/↓] Navigate  [Space/Enter] Toggle  [A] Toggle All  [ESC] Done
          </Text>
        </Box>
      )}
    </Box>
  );
};

// PRD-specific checklist with predefined categories
export const PRDChecklist: React.FC<{
  onComplete?: (items: ChecklistItem[]) => void;
}> = ({ onComplete }) => {
  const defaultItems: ChecklistItem[] = [
    // Problem Definition
    { id: 'prob_1', label: 'Problem statement clearly defined', completed: false, category: 'Problem Definition' },
    { id: 'prob_2', label: 'User pain points identified', completed: false, category: 'Problem Definition' },
    { id: 'prob_3', label: 'Business impact quantified', completed: false, category: 'Problem Definition' },
    
    // User Research
    { id: 'user_1', label: 'Target users identified', completed: false, category: 'User Research' },
    { id: 'user_2', label: 'User personas created', completed: false, category: 'User Research' },
    { id: 'user_3', label: 'User journey mapped', completed: false, category: 'User Research' },
    
    // Solution Design
    { id: 'sol_1', label: 'Solution approach defined', completed: false, category: 'Solution Design' },
    { id: 'sol_2', label: 'Key features listed', completed: false, category: 'Solution Design' },
    { id: 'sol_3', label: 'MVP scope defined', completed: false, category: 'Solution Design' },
    { id: 'sol_4', label: 'Non-goals specified', completed: false, category: 'Solution Design' },
    
    // Technical Requirements
    { id: 'tech_1', label: 'Technical constraints documented', completed: false, category: 'Technical Requirements' },
    { id: 'tech_2', label: 'API requirements defined', completed: false, category: 'Technical Requirements' },
    { id: 'tech_3', label: 'Data requirements specified', completed: false, category: 'Technical Requirements' },
    
    // Success Metrics
    { id: 'metr_1', label: 'Success metrics defined', completed: false, category: 'Success Metrics' },
    { id: 'metr_2', label: 'KPIs identified', completed: false, category: 'Success Metrics' },
    { id: 'metr_3', label: 'Measurement plan created', completed: false, category: 'Success Metrics' },
    
    // Risks & Dependencies
    { id: 'risk_1', label: 'Risks identified', completed: false, category: 'Risks & Dependencies' },
    { id: 'risk_2', label: 'Dependencies documented', completed: false, category: 'Risks & Dependencies' },
    { id: 'risk_3', label: 'Mitigation strategies defined', completed: false, category: 'Risks & Dependencies' },
    
    // Timeline
    { id: 'time_1', label: 'Timeline estimated', completed: false, category: 'Timeline' },
    { id: 'time_2', label: 'Milestones defined', completed: false, category: 'Timeline' },
    { id: 'time_3', label: 'Resource allocation planned', completed: false, category: 'Timeline' }
  ];

  return (
    <Checklist
      items={defaultItems}
      title="PRD Completeness Checklist"
      onComplete={onComplete}
    />
  );
};