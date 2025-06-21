import React from 'react';
import { Box, Text } from 'ink';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  width?: number;
  height?: number;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 40,
  height = 10,
  showValues = true
}) => {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const scale = maxValue > 0 ? (width - 15) / maxValue : 1; // Leave space for labels
  
  return (
    <Box flexDirection="column">
      {data.map((item, index) => (
        <Box key={index}>
          <Box width={12}>
            <Text>{item.label.padEnd(10).substring(0, 10)}</Text>
          </Box>
          <Text color={item.color || 'cyan'}>
            {'█'.repeat(Math.round(item.value * scale))}
          </Text>
          {showValues && (
            <Text dimColor> {item.value}</Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 40,
  height = 10,
  label
}) => {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  // Normalize data to fit in the height
  const normalized = data.map(v => Math.round(((v - minValue) / range) * (height - 1)));
  
  // Create the chart grid
  const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '));
  
  // Plot the line
  const xStep = (width - 1) / (data.length - 1);
  normalized.forEach((value, index) => {
    const x = Math.round(index * xStep);
    const y = height - 1 - value;
    
    if (x < width && y >= 0 && y < height) {
      grid[y][x] = '●';
      
      // Connect points with lines
      if (index > 0) {
        const prevX = Math.round((index - 1) * xStep);
        const prevY = height - 1 - normalized[index - 1];
        
        // Simple line drawing
        const steps = Math.max(Math.abs(x - prevX), Math.abs(y - prevY));
        for (let i = 1; i < steps; i++) {
          const interpX = Math.round(prevX + (x - prevX) * (i / steps));
          const interpY = Math.round(prevY + (y - prevY) * (i / steps));
          
          if (interpX < width && interpY >= 0 && interpY < height) {
            grid[interpY][interpX] = '─';
          }
        }
      }
    }
  });
  
  // Add Y-axis
  const yAxis = Array(height).fill(null).map((_, i) => {
    const value = maxValue - (i / (height - 1)) * range;
    return value.toFixed(0).padStart(5);
  });
  
  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text bold>{label}</Text>
        </Box>
      )}
      
      {grid.map((row, y) => (
        <Box key={y}>
          <Text dimColor>{yAxis[y]} │</Text>
          <Text color="cyan">{row.join('')}</Text>
        </Box>
      ))}
      
      <Box>
        <Text dimColor>{'      └' + '─'.repeat(width)}</Text>
      </Box>
    </Box>
  );
};

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  size?: 'small' | 'medium' | 'large';
}

export const PieChart: React.FC<PieChartProps> = ({ data, size = 'medium' }) => {
  if (data.length === 0) return null;
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;
  
  // Calculate percentages
  const percentages = data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }));
  
  // Simple ASCII pie representation
  const pieSymbols = ['◐', '◓', '◑', '◒'];
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>{'    ╭─────╮'}</Text>
      </Box>
      <Box>
        <Text>{'   │ '}</Text>
        {percentages.map((item, index) => (
          <Text key={index} color={item.color || 'cyan'}>
            {pieSymbols[index % pieSymbols.length]}
          </Text>
        ))}
        <Text>{' │'}</Text>
      </Box>
      <Box>
        <Text>{'    ╰─────╯'}</Text>
      </Box>
      
      <Box flexDirection="column" marginTop={1}>
        {percentages.map((item, index) => (
          <Box key={index}>
            <Text color={item.color || 'cyan'}>
              {pieSymbols[index % pieSymbols.length]}
            </Text>
            <Text> {item.label}: {item.percentage.toFixed(1)}%</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, width = 20, color = 'cyan' }) => {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const sparkChars = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  
  // Sample or interpolate data to fit width
  const samples: number[] = [];
  if (data.length > width) {
    // Downsample
    const step = data.length / width;
    for (let i = 0; i < width; i++) {
      const index = Math.floor(i * step);
      samples.push(data[index]);
    }
  } else {
    samples.push(...data);
  }
  
  const sparkline = samples.map(value => {
    const normalized = (value - minValue) / range;
    const index = Math.min(sparkChars.length - 1, Math.floor(normalized * (sparkChars.length - 1)));
    return sparkChars[index];
  }).join('');
  
  return (
    <Text color={color}>{sparkline}</Text>
  );
};

// Gantt chart for timeline visualization
interface GanttChartProps {
  tasks: {
    name: string;
    start: Date;
    end: Date;
    color?: string;
  }[];
  width?: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, width = 50 }) => {
  if (tasks.length === 0) return null;
  
  // Find date range
  const allDates = tasks.flatMap(t => [t.start, t.end]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  
  const chartWidth = width - 20; // Leave space for task names
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Box width={20}><Text dimColor>Task</Text></Box>
        <Text dimColor>
          {minDate.toLocaleDateString()} → {maxDate.toLocaleDateString()}
        </Text>
      </Box>
      
      {tasks.map((task, index) => {
        const startOffset = Math.floor(((task.start.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * chartWidth);
        const duration = Math.ceil(((task.end.getTime() - task.start.getTime()) / (maxDate.getTime() - minDate.getTime())) * chartWidth);
        
        return (
          <Box key={index}>
            <Box width={20}>
              <Text>{task.name.padEnd(18).substring(0, 18)}</Text>
            </Box>
            <Text dimColor>{' '.repeat(startOffset)}</Text>
            <Text color={task.color || 'green'}>{'█'.repeat(Math.max(1, duration))}</Text>
          </Box>
        );
      })}
    </Box>
  );
};