/**
 * Enhanced PRD tools for AgentPRD
 *
 * Handles PRD updates, versioning, and diff generation
 */

import type { AgentContext } from '@agentuity/sdk';
import { tool } from 'ai';
import { z } from 'zod';
import type { StoredPRD, WorkContext } from './context-tools';

const KV_NAMESPACE = 'agentprd-main';

export interface PRDVersion {
  version: number;
  content: string;
  updatedAt: string;
  updatedBy?: string;
  changeNote?: string;
}

export interface PRDDiff {
  oldVersion: number;
  newVersion: number;
  additions: number;
  deletions: number;
  changes: string[];
}

export const createPRDTools = (prdManager: PRDManager, userId?: string) => ({
  update_prd: tool({
    description: 'Update an existing PRD with version tracking',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD to update'),
      content: z.string().describe('New PRD content'),
      changeNote: z.string().optional().describe('Note describing the changes'),
      status: z.enum(['draft', 'review', 'approved']).optional(),
    }),
    execute: async ({ prdId, content, changeNote, status }) => {
      return await prdManager.updatePRD(
        prdId,
        content,
        changeNote,
        status,
        userId
      );
    },
  }),

  get_prd_versions: tool({
    description: 'Get version history for a PRD',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD'),
      limit: z
        .number()
        .default(10)
        .describe('Maximum number of versions to return'),
    }),
    execute: async ({ prdId, limit }) => {
      return await prdManager.getPRDVersions(prdId, limit);
    },
  }),

  get_prd_diff: tool({
    description: 'Get diff between two PRD versions',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD'),
      fromVersion: z
        .number()
        .default(0)
        .describe('Starting version (0 for current)'),
      toVersion: z
        .number()
        .default(0)
        .describe('Ending version (0 for current)'),
    }),
    execute: async ({ prdId, fromVersion, toVersion }) => {
      return await prdManager.getPRDDiff(prdId, fromVersion, toVersion);
    },
  }),

  add_prd_checklist: tool({
    description: 'Add or update checklist items for a PRD',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD'),
      checklist: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            completed: z.boolean().default(false),
            category: z.string().optional(),
          })
        )
        .describe('Checklist items'),
    }),
    execute: async ({ prdId, checklist }) => {
      return await prdManager.updatePRDChecklist(prdId, checklist);
    },
  }),

  get_prd_completion_status: tool({
    description: 'Get completion status and metrics for a PRD',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD'),
    }),
    execute: async ({ prdId }) => {
      return await prdManager.getPRDCompletionStatus(prdId);
    },
  }),

  delete_prd: tool({
    description: 'Delete a PRD permanently',
    parameters: z.object({
      prdId: z.string().describe('ID of the PRD to delete'),
      confirm: z
        .boolean()
        .default(false)
        .describe('Confirmation flag to prevent accidental deletion'),
    }),
    execute: async ({ prdId, confirm }) => {
      if (!confirm) {
        return {
          error:
            'Deletion requires confirmation. Please confirm you want to delete this PRD permanently.',
          requiresConfirmation: true,
        };
      }
      return await prdManager.deletePRD(prdId, userId);
    },
  }),
});

export class PRDManager {
  constructor(private ctx: AgentContext) {}

  async updatePRD(
    prdId: string,
    content: string,
    changeNote?: string,
    status?: 'draft' | 'review' | 'approved',
    userId?: string
  ): Promise<{ prd: StoredPRD; diff: PRDDiff }> {
    // Get current PRD
    const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
    if (!prdData.exists) {
      throw new Error(`PRD ${prdId} not found`);
    }

    const currentPRD = (await prdData.data.json()) as unknown as StoredPRD;

    // Save current version to history
    const versionKey = `prd:${prdId}:v${currentPRD.version}`;
    const version: PRDVersion = {
      version: currentPRD.version,
      content: currentPRD.content,
      updatedAt: currentPRD.updatedAt,
      updatedBy: currentPRD.userId,
      changeNote: 'Previous version',
    };
    await this.ctx.kv.set(KV_NAMESPACE, versionKey, version);

    // Calculate diff
    const diff = this.calculateDiff(
      currentPRD.content,
      content,
      currentPRD.version,
      currentPRD.version + 1
    );

    // Update PRD
    const updatedPRD: StoredPRD = {
      ...currentPRD,
      content,
      status: status || currentPRD.status,
      updatedAt: new Date().toISOString(),
      version: currentPRD.version + 1,
    };

    await this.ctx.kv.set(KV_NAMESPACE, `prd:${prdId}`, updatedPRD);

    // Save change note if provided
    if (changeNote) {
      const changeKey = `prd:${prdId}:change:${updatedPRD.version}`;
      await this.ctx.kv.set(KV_NAMESPACE, changeKey, {
        version: updatedPRD.version,
        changeNote,
        userId,
        timestamp: new Date().toISOString(),
      });
    }

    return { prd: updatedPRD, diff };
  }

  async getPRDVersions(
    prdId: string,
    limit: number = 10
  ): Promise<PRDVersion[]> {
    const versions: PRDVersion[] = [];

    // Get current PRD first
    const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
    if (!prdData.exists) {
      return versions;
    }

    const currentPRD = (await prdData.data.json()) as unknown as StoredPRD;

    // Add current version
    versions.push({
      version: currentPRD.version,
      content: currentPRD.content,
      updatedAt: currentPRD.updatedAt,
      updatedBy: currentPRD.userId,
      changeNote: 'Current version',
    });

    // Get historical versions
    for (
      let v = currentPRD.version - 1;
      v > 0 && versions.length < limit;
      v--
    ) {
      const versionData = await this.ctx.kv.get(
        KV_NAMESPACE,
        `prd:${prdId}:v${v}`
      );
      if (versionData.exists) {
        const version =
          (await versionData.data.json()) as unknown as PRDVersion;

        // Get change note if exists
        const changeData = await this.ctx.kv.get(
          KV_NAMESPACE,
          `prd:${prdId}:change:${v + 1}`
        );
        if (changeData.exists) {
          const change = (await changeData.data.json()) as any;
          version.changeNote = change.changeNote;
        }

        versions.push(version);
      }
    }

    return versions;
  }

  async getPRDDiff(
    prdId: string,
    fromVersion: number = 0,
    toVersion: number = 0
  ): Promise<PRDDiff> {
    const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
    if (!prdData.exists) {
      throw new Error(`PRD ${prdId} not found`);
    }

    const currentPRD = (await prdData.data.json()) as unknown as StoredPRD;

    // Get content for each version
    let fromContent: string;
    let toContent: string;

    if (fromVersion === 0 || fromVersion === currentPRD.version) {
      fromContent = currentPRD.content;
    } else {
      const versionData = await this.ctx.kv.get(
        KV_NAMESPACE,
        `prd:${prdId}:v${fromVersion}`
      );
      if (!versionData.exists) {
        throw new Error(`Version ${fromVersion} not found`);
      }
      const version = (await versionData.data.json()) as unknown as PRDVersion;
      fromContent = version.content;
    }

    if (toVersion === 0 || toVersion === currentPRD.version) {
      toContent = currentPRD.content;
    } else {
      const versionData = await this.ctx.kv.get(
        KV_NAMESPACE,
        `prd:${prdId}:v${toVersion}`
      );
      if (!versionData.exists) {
        throw new Error(`Version ${toVersion} not found`);
      }
      const version = (await versionData.data.json()) as unknown as PRDVersion;
      toContent = version.content;
    }

    return this.calculateDiff(fromContent, toContent, fromVersion, toVersion);
  }

  async updatePRDChecklist(
    prdId: string,
    checklist: any[]
  ): Promise<{ success: boolean; completionRate: number }> {
    const checklistKey = `prd:${prdId}:checklist`;
    await this.ctx.kv.set(KV_NAMESPACE, checklistKey, checklist);

    const completed = checklist.filter((item) => item.completed).length;
    const completionRate =
      checklist.length > 0 ? (completed / checklist.length) * 100 : 0;

    return { success: true, completionRate };
  }

  async getPRDCompletionStatus(prdId: string): Promise<any> {
    const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
    if (!prdData.exists) {
      throw new Error(`PRD ${prdId} not found`);
    }

    const prd = (await prdData.data.json()) as unknown as StoredPRD;

    // Get checklist
    const checklistData = await this.ctx.kv.get(
      KV_NAMESPACE,
      `prd:${prdId}:checklist`
    );
    let checklist = [];
    let checklistCompletion = 0;

    if (checklistData.exists) {
      checklist = (await checklistData.data.json()) as any[];
      const completed = checklist.filter((item) => item.completed).length;
      checklistCompletion =
        checklist.length > 0 ? (completed / checklist.length) * 100 : 0;
    }

    // Calculate content completion based on sections
    const sections = this.extractSections(prd.content);
    const filledSections = sections.filter(
      (s) => s.content.trim().length > 50
    ).length;
    const contentCompletion =
      sections.length > 0 ? (filledSections / sections.length) * 100 : 0;

    return {
      prdId,
      title: prd.title,
      status: prd.status,
      version: prd.version,
      lastUpdated: prd.updatedAt,
      completion: {
        overall: Math.round((checklistCompletion + contentCompletion) / 2),
        checklist: Math.round(checklistCompletion),
        content: Math.round(contentCompletion),
      },
      sections: sections.map((s) => ({
        title: s.title,
        filled: s.content.trim().length > 50,
        wordCount: s.content.split(/\s+/).length,
      })),
      checklist: checklist.slice(0, 5), // Return first 5 items as preview
    };
  }

  private calculateDiff(
    oldContent: string,
    newContent: string,
    oldVersion: number,
    newVersion: number
  ): PRDDiff {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    let additions = 0;
    let deletions = 0;
    const changes: string[] = [];

    // Simple line counting for now
    const maxLength = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined && newLine !== undefined) {
        additions++;
        if (changes.length < 5)
          changes.push(`+ ${newLine.substring(0, 50)}...`);
      } else if (oldLine !== undefined && newLine === undefined) {
        deletions++;
        if (changes.length < 5)
          changes.push(`- ${oldLine.substring(0, 50)}...`);
      } else if (oldLine !== newLine) {
        additions++;
        deletions++;
        if (changes.length < 5)
          changes.push(`~ ${newLine?.substring(0, 50) || ''}...`);
      }
    }

    return {
      oldVersion,
      newVersion,
      additions,
      deletions,
      changes,
    };
  }

  async deletePRD(
    prdId: string,
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    // Check if PRD exists
    const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
    if (!prdData.exists) {
      return { success: false, message: `PRD ${prdId} not found` };
    }

    const prd = (await prdData.data.json()) as unknown as StoredPRD;

    // Delete the PRD
    await this.ctx.kv.delete(KV_NAMESPACE, `prd:${prdId}`);

    // Delete all versions
    for (let v = 1; v < prd.version; v++) {
      await this.ctx.kv.delete(KV_NAMESPACE, `prd:${prdId}:v${v}`);
      await this.ctx.kv.delete(KV_NAMESPACE, `prd:${prdId}:change:${v}`);
    }

    // Delete checklist
    await this.ctx.kv.delete(KV_NAMESPACE, `prd:${prdId}:checklist`);

    // Remove from user's PRD index
    try {
      const userPRDsKey = `user:${userId || 'default'}:prds`;
      const userPRDsData = await this.ctx.kv.get(KV_NAMESPACE, userPRDsKey);

      if (userPRDsData.exists) {
        let prdIds = (await userPRDsData.data.json()) as string[];
        prdIds = prdIds.filter((id) => id !== prdId);
        await this.ctx.kv.set(KV_NAMESPACE, userPRDsKey, prdIds);
      }
    } catch (error) {
      console.warn('Could not update user PRD index', error);
    }

    // Remove from context if associated
    if (prd.contextId) {
      try {
        const contextData = await this.ctx.kv.get(
          KV_NAMESPACE,
          `context:${prd.contextId}`
        );
        if (contextData.exists) {
          const context =
            (await contextData.data.json()) as unknown as WorkContext;
          if (context.relatedPRDs) {
            context.relatedPRDs = context.relatedPRDs.filter(
              (id) => id !== prdId
            );
            await this.ctx.kv.set(
              KV_NAMESPACE,
              `context:${prd.contextId}`,
              context
            );
          }
        }
      } catch (error) {
        console.warn('Could not update context', error);
      }
    }

    return {
      success: true,
      message: `PRD "${prd.title}" (${prdId}) has been permanently deleted`,
    };
  }

  private extractSections(
    content: string
  ): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = [];
    const lines = content.split('\n');

    let currentSection: { title: string; content: string } | null = null;

    for (const line of lines) {
      // Check if line is a header (starts with # or ##)
      if (line.match(/^#{1,3}\s+/)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#+\s+/, ''),
          content: '',
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }
}
