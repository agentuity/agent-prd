/**
 * Visualization tools for AgentPRD
 *
 * Generates data for ASCII charts and visual representations
 */

import type { AgentContext } from '@agentuity/sdk';
import { tool } from 'ai';
import { z } from 'zod';

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'gantt' | 'sparkline';
  title: string;
  data: any;
  metadata?: {
    width?: number;
    height?: number;
    colors?: string[];
  };
}

export const createVisualizationTools = (vizManager: VisualizationManager) => ({
  create_feature_priority_chart: tool({
    description: 'Create a feature priority chart (impact vs effort)',
    parameters: z.object({
      features: z.array(
        z.object({
          name: z.string(),
          impact: z.number().min(1).max(10),
          effort: z.number().min(1).max(10),
          category: z.string().optional(),
        })
      ),
    }),
    execute: async ({ features }) => {
      return await vizManager.createPriorityChart(features);
    },
  }),

  create_timeline_chart: tool({
    description: 'Create a timeline/gantt chart for project phases',
    parameters: z.object({
      tasks: z.array(
        z.object({
          name: z.string(),
          startDate: z.string().describe('ISO date string'),
          endDate: z.string().describe('ISO date string'),
          status: z.enum(['planned', 'in-progress', 'completed']).optional(),
        })
      ),
    }),
    execute: async ({ tasks }) => {
      return await vizManager.createTimelineChart(tasks);
    },
  }),

  create_metrics_dashboard: tool({
    description: 'Create a metrics dashboard with multiple visualizations',
    parameters: z.object({
      metrics: z.array(
        z.object({
          name: z.string(),
          value: z.number(),
          target: z.number().optional(),
          unit: z.string().optional(),
          trend: z.array(z.number()).optional(),
        })
      ),
    }),
    execute: async ({ metrics }) => {
      return await vizManager.createMetricsDashboard(metrics);
    },
  }),

  create_user_journey_map: tool({
    description: 'Create a visual user journey map',
    parameters: z.object({
      stages: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          painPoints: z.array(z.string()),
          opportunities: z.array(z.string()),
          satisfaction: z.number().min(1).max(5),
        })
      ),
    }),
    execute: async ({ stages }) => {
      return await vizManager.createUserJourneyMap(stages);
    },
  }),

  visualize_prd_status: tool({
    description: 'Create a visual representation of PRD completion status',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD to visualize'),
    }),
    execute: async ({ prdId }) => {
      return await vizManager.visualizePRDStatus(prdId);
    },
  }),
});

export class VisualizationManager {
  constructor(private ctx: AgentContext) {}

  async createPriorityChart(features: any[]): Promise<ChartData> {
    // Sort features by priority score (high impact, low effort = high priority)
    const prioritized = features
      .map((f) => ({
        ...f,
        score: (f.impact / f.effort) * 10,
      }))
      .sort((a, b) => b.score - a.score);

    // Create bar chart data
    const chartData = {
      type: 'bar' as const,
      title: 'Feature Priority Matrix',
      data: {
        items: prioritized.map((f) => ({
          label: f.name.substring(0, 15),
          value: Math.round(f.score),
          color: f.score > 7 ? 'green' : f.score > 4 ? 'yellow' : 'red',
          metadata: {
            impact: f.impact,
            effort: f.effort,
            category: f.category,
          },
        })),
      },
      metadata: {
        width: 50,
        colors: ['green', 'yellow', 'red'],
      },
    };

    // Also create a scatter plot representation
    const scatterView = this.createImpactEffortMatrix(features);

    return {
      ...chartData,
      alternativeView: scatterView,
    } as ChartData;
  }

  async createTimelineChart(tasks: any[]): Promise<ChartData> {
    // Convert dates and sort by start date
    const processedTasks = tasks
      .map((t) => ({
        ...t,
        start: new Date(t.startDate),
        end: new Date(t.endDate),
        duration: Math.ceil(
          (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    return {
      type: 'gantt',
      title: 'Project Timeline',
      data: {
        tasks: processedTasks.map((t) => ({
          name: t.name,
          start: t.start,
          end: t.end,
          color:
            t.status === 'completed'
              ? 'green'
              : t.status === 'in-progress'
                ? 'yellow'
                : 'blue',
        })),
      },
      metadata: {
        width: 60,
      },
    };
  }

  async createMetricsDashboard(metrics: any[]): Promise<any> {
    const charts: ChartData[] = [];

    // Create individual charts for each metric
    for (const metric of metrics) {
      if (metric.trend && metric.trend.length > 0) {
        // Line chart for trends
        charts.push({
          type: 'line',
          title: `${metric.name} Trend`,
          data: metric.trend,
          metadata: {
            width: 40,
            height: 10,
          },
        });
      } else {
        // Bar chart for single values
        const hasTarget = metric.target !== undefined;
        charts.push({
          type: 'bar',
          title: metric.name,
          data: {
            items: [
              {
                label: 'Current',
                value: metric.value,
                color:
                  hasTarget && metric.value >= metric.target
                    ? 'green'
                    : 'yellow',
              },
              ...(hasTarget
                ? [
                    {
                      label: 'Target',
                      value: metric.target,
                      color: 'blue',
                    },
                  ]
                : []),
            ],
          },
        });
      }
    }

    // Create summary sparklines
    const sparklines = metrics
      .filter((m) => m.trend && m.trend.length > 0)
      .map((m) => ({
        label: m.name,
        data: m.trend,
        current: m.value,
        unit: m.unit || '',
      }));

    return {
      title: 'Metrics Dashboard',
      charts,
      sparklines,
      summary: {
        totalMetrics: metrics.length,
        onTarget: metrics.filter((m) => m.target && m.value >= m.target).length,
        trending: sparklines.length,
      },
    };
  }

  async createUserJourneyMap(stages: any[]): Promise<any> {
    // Create satisfaction line chart
    const satisfactionChart: ChartData = {
      type: 'line',
      title: 'User Satisfaction Journey',
      data: stages.map((s) => s.satisfaction),
      metadata: {
        width: 50,
        height: 8,
      },
    };

    // Create stage details
    const stageDetails = stages.map((stage, index) => ({
      number: index + 1,
      name: stage.name,
      description: stage.description,
      satisfaction:
        '★'.repeat(stage.satisfaction) + '☆'.repeat(5 - stage.satisfaction),
      painPoints: stage.painPoints,
      opportunities: stage.opportunities,
      improvementPotential:
        stage.painPoints.length + stage.opportunities.length,
    }));

    // Create pain points heatmap
    const painPointsBar: ChartData = {
      type: 'bar',
      title: 'Pain Points by Stage',
      data: {
        items: stages.map((s) => ({
          label: s.name.substring(0, 15),
          value: s.painPoints.length,
          color:
            s.painPoints.length > 3
              ? 'red'
              : s.painPoints.length > 1
                ? 'yellow'
                : 'green',
        })),
      },
    };

    return {
      title: 'User Journey Map',
      satisfactionChart,
      painPointsChart: painPointsBar,
      stages: stageDetails,
      summary: {
        averageSatisfaction: (
          stages.reduce((sum, s) => sum + s.satisfaction, 0) / stages.length
        ).toFixed(1),
        totalPainPoints: stages.reduce(
          (sum, s) => sum + s.painPoints.length,
          0
        ),
        totalOpportunities: stages.reduce(
          (sum, s) => sum + s.opportunities.length,
          0
        ),
      },
    };
  }

  async visualizePRDStatus(prdId: string): Promise<any> {
    // This would integrate with the PRD manager to get actual status
    // For now, return a sample visualization structure

    return {
      title: 'PRD Completion Status',
      charts: [
        {
          type: 'pie',
          title: 'Section Completion',
          data: {
            items: [
              { label: 'Completed', value: 7, color: 'green' },
              { label: 'In Progress', value: 2, color: 'yellow' },
              { label: 'Not Started', value: 1, color: 'red' },
            ],
          },
        },
        {
          type: 'bar',
          title: 'Section Word Count',
          data: {
            items: [
              { label: 'Problem', value: 450, color: 'green' },
              { label: 'Solution', value: 380, color: 'green' },
              { label: 'Users', value: 220, color: 'yellow' },
              { label: 'Metrics', value: 150, color: 'yellow' },
              { label: 'Timeline', value: 50, color: 'red' },
            ],
          },
        },
      ],
      progressBars: [
        { label: 'Overall', value: 75 },
        { label: 'Content', value: 80 },
        { label: 'Review', value: 60 },
      ],
    };
  }

  private createImpactEffortMatrix(features: any[]): string {
    // Create ASCII art impact/effort matrix
    const matrix = [
      ['Low Impact', '', '', '', 'High Impact'],
      ['Low Effort', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['High Effort', '', '', '', ''],
    ];

    // Place features in matrix
    features.forEach((f, i) => {
      const x = Math.floor((f.impact - 1) / 2);
      const y = Math.floor((f.effort - 1) / 2);

      const row = matrix[y + 1];
      if (row && x + 1 < row.length) {
        if (!row[x + 1]) {
          row[x + 1] = `[${i + 1}]`;
        } else {
          row[x + 1] += `,${i + 1}`;
        }
      }
    });

    // Convert to string
    let result = '\nImpact/Effort Matrix:\n';
    result += '┌─────────────────────────┐\n';

    for (let y = 0; y < 5; y++) {
      result += '│ ';
      for (let x = 0; x < 5; x++) {
        result += (matrix[y]?.[x] || '   ').padEnd(5);
      }
      result += '│\n';
    }

    result += '└─────────────────────────┘\n\n';
    result += 'Legend:\n';
    features.forEach((f, i) => {
      result += `[${i + 1}] ${f.name}\n`;
    });

    return result;
  }
}
