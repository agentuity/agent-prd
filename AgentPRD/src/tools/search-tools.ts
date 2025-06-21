/**
 * Search tools for AgentPRD
 *
 * Handles full-text and semantic search across PRDs and notes
 */

import type { AgentContext } from '@agentuity/sdk';
import { tool } from 'ai';
import { z } from 'zod';
import type { StoredPRD, WorkContext } from './context-tools';

const KV_NAMESPACE = 'agentprd-main';

export interface Note {
  id: string;
  content: string;
  contextId?: string;
  prdId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface SearchResult {
  type: 'prd' | 'context' | 'note';
  id: string;
  title: string;
  excerpt: string;
  score: number;
  metadata: {
    status?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export const createSearchTools = (
  searchManager: SearchManager,
  userId?: string
) => ({
  search_prds: tool({
    description: 'Search across all PRDs using full-text search',
    parameters: z.object({
      query: z.string().describe('Search query string'),
      filters: z
        .object({
          status: z.enum(['draft', 'review', 'approved', 'all']).default('all'),
          contextId: z.string().optional(),
          dateFrom: z
            .string()
            .optional()
            .describe('ISO date string for date range start'),
          dateTo: z
            .string()
            .optional()
            .describe('ISO date string for date range end'),
          tags: z.array(z.string()).optional(),
        })
        .optional(),
      limit: z.number().default(10).describe('Maximum number of results'),
    }),
    execute: async ({ query, filters, limit }) => {
      return await searchManager.searchPRDs(query, filters, limit, userId);
    },
  }),

  search_all: tool({
    description: 'Search across PRDs, contexts, and notes',
    parameters: z.object({
      query: z.string().describe('Search query string'),
      types: z
        .array(z.enum(['prd', 'context', 'note']))
        .default(['prd', 'context', 'note']),
      limit: z.number().default(10).describe('Maximum number of results'),
    }),
    execute: async ({ query, types, limit }) => {
      return await searchManager.searchAll(query, types, limit, userId);
    },
  }),

  add_note: tool({
    description: 'Add a quick note or thought',
    parameters: z.object({
      content: z.string().describe('Note content'),
      contextId: z.string().optional().describe('Associated work context'),
      prdId: z.string().optional().describe('Associated PRD'),
      tags: z.array(z.string()).default([]).describe('Tags for categorization'),
    }),
    execute: async ({ content, contextId, prdId, tags }) => {
      return await searchManager.addNote(
        content,
        contextId,
        prdId,
        tags,
        userId
      );
    },
  }),

  list_notes: tool({
    description: 'List notes with optional filtering',
    parameters: z.object({
      contextId: z.string().optional().describe('Filter by context'),
      prdId: z.string().optional().describe('Filter by PRD'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      limit: z.number().default(20).describe('Maximum number of notes'),
    }),
    execute: async ({ contextId, prdId, tags, limit }) => {
      return await searchManager.listNotes(
        contextId,
        prdId,
        tags,
        limit,
        userId
      );
    },
  }),

  get_suggestions: tool({
    description: 'Get auto-suggestions based on past work',
    parameters: z.object({
      prefix: z.string().describe('Partial query to get suggestions for'),
      type: z.enum(['prd', 'context', 'tag', 'all']).default('all'),
      limit: z.number().default(5),
    }),
    execute: async ({ prefix, type, limit }) => {
      return await searchManager.getSuggestions(prefix, type, limit, userId);
    },
  }),
});

export class SearchManager {
  constructor(private ctx: AgentContext) {}

  async searchPRDs(
    query: string,
    filters?: any,
    limit: number = 10,
    userId?: string
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Get all PRDs for the user
    const userPRDsKey = `user:${userId || 'default'}:prds`;
    const userPRDsData = await this.ctx.kv.get(KV_NAMESPACE, userPRDsKey);

    if (!userPRDsData.exists) {
      return results;
    }

    const prdIds = (await userPRDsData.data.json()) as string[];

    // Search through each PRD
    for (const prdId of prdIds) {
      const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
      if (!prdData.exists) continue;

      const prd = (await prdData.data.json()) as unknown as StoredPRD;

      // Apply filters
      if (
        filters?.status &&
        filters.status !== 'all' &&
        prd.status !== filters.status
      ) {
        continue;
      }

      if (filters?.contextId && prd.contextId !== filters.contextId) {
        continue;
      }

      if (
        filters?.dateFrom &&
        new Date(prd.createdAt) < new Date(filters.dateFrom)
      ) {
        continue;
      }

      if (
        filters?.dateTo &&
        new Date(prd.createdAt) > new Date(filters.dateTo)
      ) {
        continue;
      }

      // Simple text matching for now
      const searchableText = `${prd.title} ${prd.content}`.toLowerCase();
      const queryLower = query.toLowerCase();

      if (searchableText.includes(queryLower)) {
        // Calculate a simple relevance score
        const titleMatch = prd.title.toLowerCase().includes(queryLower) ? 2 : 0;
        const contentMatches = (
          searchableText.match(new RegExp(queryLower, 'g')) || []
        ).length;
        const score = titleMatch + contentMatches * 0.1;

        // Extract excerpt around the match
        const matchIndex = prd.content.toLowerCase().indexOf(queryLower);
        const excerptStart = Math.max(0, matchIndex - 50);
        const excerptEnd = Math.min(
          prd.content.length,
          matchIndex + queryLower.length + 50
        );
        const excerpt =
          matchIndex >= 0
            ? '...' + prd.content.slice(excerptStart, excerptEnd) + '...'
            : prd.content.slice(0, 100) + '...';

        results.push({
          type: 'prd',
          id: prd.id,
          title: prd.title,
          excerpt,
          score,
          metadata: {
            status: prd.status,
            createdAt: prd.createdAt,
            updatedAt: prd.updatedAt,
          },
        });
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  async searchAll(
    query: string,
    types: string[],
    limit: number = 10,
    userId?: string
  ): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];

    // Search PRDs if included
    if (types.includes('prd')) {
      const prdResults = await this.searchPRDs(query, {}, limit, userId);
      allResults.push(...prdResults);
    }

    // Search notes if included
    if (types.includes('note')) {
      const noteResults = await this.searchNotes(query, limit, userId);
      allResults.push(...noteResults);
    }

    // Sort all results by score and return top matches
    allResults.sort((a, b) => b.score - a.score);
    return allResults.slice(0, limit);
  }

  async searchNotes(
    query: string,
    limit: number = 10,
    userId?: string
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Get all notes for the user
    const userNotesKey = `user:${userId || 'default'}:notes`;
    const userNotesData = await this.ctx.kv.get(KV_NAMESPACE, userNotesKey);

    if (!userNotesData.exists) {
      return results;
    }

    const noteIds = (await userNotesData.data.json()) as string[];

    // Search through each note
    for (const noteId of noteIds) {
      const noteData = await this.ctx.kv.get(KV_NAMESPACE, `note:${noteId}`);
      if (!noteData.exists) continue;

      const note = (await noteData.data.json()) as unknown as Note;

      // Simple text matching
      const searchableText = note.content.toLowerCase();
      const queryLower = query.toLowerCase();

      if (searchableText.includes(queryLower)) {
        const contentMatches = (
          searchableText.match(new RegExp(queryLower, 'g')) || []
        ).length;
        const score = contentMatches * 0.5;

        // Extract excerpt
        const matchIndex = note.content.toLowerCase().indexOf(queryLower);
        const excerptStart = Math.max(0, matchIndex - 50);
        const excerptEnd = Math.min(
          note.content.length,
          matchIndex + queryLower.length + 50
        );
        const excerpt =
          matchIndex >= 0
            ? '...' + note.content.slice(excerptStart, excerptEnd) + '...'
            : note.content.slice(0, 100) + '...';

        results.push({
          type: 'note',
          id: note.id,
          title:
            note.content.slice(0, 50) + (note.content.length > 50 ? '...' : ''),
          excerpt,
          score,
          metadata: {
            tags: note.tags,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          },
        });
      }
    }

    return results;
  }

  async addNote(
    content: string,
    contextId?: string,
    prdId?: string,
    tags: string[] = [],
    userId?: string
  ): Promise<Note> {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const note: Note = {
      id: noteId,
      content,
      contextId,
      prdId,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    // Store the note
    await this.ctx.kv.set(KV_NAMESPACE, `note:${noteId}`, note);

    // Update user's note index
    const userNotesKey = `user:${userId || 'default'}:notes`;
    const userNotesData = await this.ctx.kv.get(KV_NAMESPACE, userNotesKey);

    let noteIds: string[] = [];
    if (userNotesData.exists) {
      noteIds = (await userNotesData.data.json()) as string[];
    }

    noteIds.unshift(noteId); // Add to beginning
    await this.ctx.kv.set(KV_NAMESPACE, userNotesKey, noteIds);

    // Update tag index
    await this.updateTagIndex(tags, 'note', noteId, userId);

    return note;
  }

  async listNotes(
    contextId?: string,
    prdId?: string,
    tags?: string[],
    limit: number = 20,
    userId?: string
  ): Promise<Note[]> {
    const notes: Note[] = [];

    // Get all notes for the user
    const userNotesKey = `user:${userId || 'default'}:notes`;
    const userNotesData = await this.ctx.kv.get(KV_NAMESPACE, userNotesKey);

    if (!userNotesData.exists) {
      return notes;
    }

    const noteIds = (await userNotesData.data.json()) as string[];

    // Filter notes
    for (const noteId of noteIds) {
      if (notes.length >= limit) break;

      const noteData = await this.ctx.kv.get(KV_NAMESPACE, `note:${noteId}`);
      if (!noteData.exists) continue;

      const note = (await noteData.data.json()) as unknown as Note;

      // Apply filters
      if (contextId && note.contextId !== contextId) continue;
      if (prdId && note.prdId !== prdId) continue;
      if (
        tags &&
        tags.length > 0 &&
        !tags.some((tag) => note.tags.includes(tag))
      )
        continue;

      notes.push(note);
    }

    return notes;
  }

  async getSuggestions(
    prefix: string,
    type: string = 'all',
    limit: number = 5,
    userId?: string
  ): Promise<string[]> {
    const suggestions: string[] = [];
    const prefixLower = prefix.toLowerCase();

    // Get tag suggestions
    if (type === 'all' || type === 'tag') {
      const tagIndexKey = `user:${userId || 'default'}:tags`;
      const tagIndexData = await this.ctx.kv.get(KV_NAMESPACE, tagIndexKey);

      if (tagIndexData.exists) {
        const tags = (await tagIndexData.data.json()) as string[];
        const matchingTags = tags
          .filter((tag) => tag.toLowerCase().startsWith(prefixLower))
          .slice(0, limit);
        suggestions.push(...matchingTags.map((tag) => `#${tag}`));
      }
    }

    // Get PRD title suggestions
    if (type === 'all' || type === 'prd') {
      const userPRDsKey = `user:${userId || 'default'}:prds`;
      const userPRDsData = await this.ctx.kv.get(KV_NAMESPACE, userPRDsKey);

      if (userPRDsData.exists) {
        const prdIds = (await userPRDsData.data.json()) as string[];

        for (const prdId of prdIds.slice(0, 20)) {
          // Check first 20 PRDs
          const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
          if (prdData.exists) {
            const prd = (await prdData.data.json()) as unknown as StoredPRD;
            if (prd.title.toLowerCase().includes(prefixLower)) {
              suggestions.push(prd.title);
              if (suggestions.length >= limit) break;
            }
          }
        }
      }
    }

    return suggestions.slice(0, limit);
  }

  private async updateTagIndex(
    tags: string[],
    type: string,
    itemId: string,
    userId?: string
  ): Promise<void> {
    const tagIndexKey = `user:${userId || 'default'}:tags`;
    const tagIndexData = await this.ctx.kv.get(KV_NAMESPACE, tagIndexKey);

    let allTags: string[] = [];
    if (tagIndexData.exists) {
      allTags = (await tagIndexData.data.json()) as string[];
    }

    // Add new tags to the index
    for (const tag of tags) {
      if (!allTags.includes(tag)) {
        allTags.push(tag);
      }
    }

    await this.ctx.kv.set(KV_NAMESPACE, tagIndexKey, allTags);
  }
}
