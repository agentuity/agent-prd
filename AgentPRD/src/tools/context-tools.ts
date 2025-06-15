/**
 * Context management tools for AgentPRD
 * 
 * Handles work context, PRD storage, and session continuity
 */

import type { AgentContext } from '@agentuity/sdk';

const KV_NAMESPACE = 'agentprd-main';

export interface WorkContext {
	id: string;
	title: string;
	description: string;
	goals: string[];
	status: 'active' | 'paused' | 'completed';
	createdAt: string;
	updatedAt: string;
	userId?: string;
	relatedPRDs?: string[];
	tags?: string[];
}

export interface StoredPRD {
	id: string;
	title: string;
	content: string;
	format: 'markdown' | 'json';
	contextId?: string;
	createdAt: string;
	updatedAt: string;
	userId?: string;
	version: number;
	status: 'draft' | 'review' | 'approved';
}

import { tool } from 'ai';
import { z } from 'zod';

export const createContextTools = (contextManager: ContextManager, userId?: string) => ({
	set_work_context: tool({
		description: 'Set or update the current work context and goals',
		parameters: z.object({
			title: z.string().describe('Brief title for the work context'),
			description: z.string().describe('Detailed description of what we\'re working on'),
			goals: z.array(z.string()).default([]).describe('List of specific goals or tasks'),
			tags: z.array(z.string()).default([]).describe('Optional tags for categorization')
		}),
		execute: async ({ title, description, goals, tags }) => {
			return await contextManager.setWorkContext(title, description, goals, tags, userId);
		}
	}),

	get_work_context: tool({
		description: 'Get the current active work context',
		parameters: z.object({
			contextId: z.string().default('').describe('Optional specific context ID to retrieve')
		}),
		execute: async ({ contextId }) => {
			return await contextManager.getWorkContext(contextId || undefined, userId);
		}
	}),

	list_work_contexts: tool({
		description: 'List all work contexts for the user',
		parameters: z.object({
			status: z.enum(['active', 'paused', 'completed', 'all']).default('all').describe('Filter contexts by status'),
			limit: z.number().default(10).describe('Maximum number of contexts to return')
		}),
		execute: async ({ status, limit }) => {
			return await contextManager.listWorkContexts(status, limit, userId);
		}
	}),

	switch_work_context: tool({
		description: 'Switch to a different work context',
		parameters: z.object({
			contextId: z.string().describe('ID of the context to switch to')
		}),
		execute: async ({ contextId }) => {
			return await contextManager.switchWorkContext(contextId, userId);
		}
	}),

	store_prd: tool({
		description: 'Store a PRD document for future reference',
		parameters: z.object({
			title: z.string().describe('Title of the PRD'),
			content: z.string().describe('Full PRD content in markdown format'),
			contextId: z.string().default('').describe('Associated work context ID'),
			status: z.enum(['draft', 'review', 'approved']).default('draft').describe('PRD status')
		}),
		execute: async ({ title, content, contextId, status }) => {
			return await contextManager.storePRD(title, content, contextId || undefined, status, userId);
		}
	}),

	get_prd: tool({
		description: 'Retrieve a stored PRD document',
		parameters: z.object({
			prdId: z.string().default('').describe('ID of the PRD to retrieve'),
			title: z.string().default('').describe('Search by PRD title (alternative to ID)')
		}),
		execute: async ({ prdId, title }) => {
			return await contextManager.getPRD(prdId || undefined, title || undefined);
		}
	}),

	list_prds: tool({
		description: 'List stored PRD documents',
		parameters: z.object({
			contextId: z.string().default('').describe('Filter PRDs by work context'),
			status: z.enum(['draft', 'review', 'approved', 'all']).default('all').describe('Filter PRDs by status'),
			limit: z.number().default(10).describe('Maximum number of PRDs to return')
		}),
		execute: async ({ contextId, status, limit }) => {
			return await contextManager.listPRDs(contextId || undefined, status, limit);
		}
	})
});

export class ContextManager {
	constructor(private ctx: AgentContext) { }

	async setWorkContext(
		title: string,
		description: string,
		goals: string[] = [],
		tags: string[] = [],
		userId?: string
	): Promise<WorkContext> {
		const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

		const context: WorkContext = {
			id: contextId,
			title,
			description,
			goals,
			status: 'active',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			userId,
			tags
		};

		// Store the context
		await this.ctx.kv.set(KV_NAMESPACE, `context:${contextId}`, context);

		// Update user's active context
		if (userId) {
			await this.ctx.kv.set(KV_NAMESPACE, `user:${userId}:active_context`, contextId);
		}

		return context;
	}

	async getWorkContext(contextId?: string, userId?: string): Promise<WorkContext | null> {
		let targetContextId = contextId;

		// If no contextId provided, get user's active context
		if (!targetContextId && userId) {
			const activeContextData = await this.ctx.kv.get(KV_NAMESPACE, `user:${userId}:active_context`);
			if (activeContextData.exists) {
				targetContextId = await activeContextData.data.text();
			}
		}

		if (!targetContextId) {
			return null;
		}

		const contextData = await this.ctx.kv.get(KV_NAMESPACE, `context:${targetContextId}`);
		if (contextData.exists) {
			return await contextData.data.json() as unknown as WorkContext;
		}

		return null;
	}

	async listWorkContexts(status: string = 'all', limit: number = 10, userId?: string): Promise<WorkContext[]> {
		// This is a simplified implementation - in a real system you'd want proper indexing
		const contexts: WorkContext[] = [];

		// For now, we'll need to iterate through known contexts
		// In a production system, you'd maintain an index of contexts per user

		return contexts.slice(0, limit);
	}

	async switchWorkContext(contextId: string, userId?: string): Promise<WorkContext | null> {
		const context = await this.getWorkContext(contextId);
		if (!context) {
			return null;
		}

		// Update user's active context
		if (userId) {
			await this.ctx.kv.set(KV_NAMESPACE, `user:${userId}:active_context`, contextId);
		}

		// Update context status and timestamp
		context.status = 'active';
		context.updatedAt = new Date().toISOString();
		await this.ctx.kv.set(KV_NAMESPACE, `context:${contextId}`, context);

		return context;
	}

	async storePRD(
		title: string,
		content: string,
		contextId?: string,
		status: 'draft' | 'review' | 'approved' = 'draft',
		userId?: string
	): Promise<StoredPRD> {
		const prdId = `prd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

		const prd: StoredPRD = {
			id: prdId,
			title,
			content,
			format: 'markdown',
			contextId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			userId,
			version: 1,
			status
		};

		// Store the PRD
		await this.ctx.kv.set(KV_NAMESPACE, `prd:${prdId}`, prd);

		// Update user's PRD index
		try {
			const userPRDsKey = `user:${userId || 'default'}:prds`;
			const userPRDsData = await this.ctx.kv.get(KV_NAMESPACE, userPRDsKey);

			let prdIds: string[] = [];
			if (userPRDsData.exists) {
				prdIds = await userPRDsData.data.json() as string[];
			}

			// Add this PRD to the user's index if not already there
			if (!prdIds.includes(prdId)) {
				prdIds.unshift(prdId); // Add to beginning for most recent first
				await this.ctx.kv.set(KV_NAMESPACE, userPRDsKey, prdIds);
			}
		} catch (error) {
			// Log but don't fail - PRD is still stored
			console.warn('Could not update user PRD index', error);
		}

		// Update context to reference this PRD
		if (contextId) {
			const context = await this.getWorkContext(contextId);
			if (context) {
				if (!context.relatedPRDs) context.relatedPRDs = [];
				context.relatedPRDs.push(prdId);
				context.updatedAt = new Date().toISOString();
				await this.ctx.kv.set(KV_NAMESPACE, `context:${contextId}`, context);
			}
		}

		return prd;
	}

	async getPRD(prdId?: string, title?: string): Promise<StoredPRD | null> {
		if (prdId) {
			const prdData = await this.ctx.kv.get(KV_NAMESPACE, `prd:${prdId}`);
			if (prdData.exists) {
				return await prdData.data.json() as unknown as StoredPRD;
			}
		}

		// Search by title would require an index in a real implementation
		return null;
	}

	async listPRDs(
		contextId?: string,
		status: string = 'all',
		limit: number = 10
	): Promise<StoredPRD[]> {
		const prds: StoredPRD[] = [];

		if (contextId) {
			// List PRDs for a specific context
			const context = await this.getWorkContext(contextId);
			if (context && context.relatedPRDs) {
				for (const prdId of context.relatedPRDs.slice(0, limit)) {
					const prd = await this.getPRD(prdId);
					if (prd && (status === 'all' || prd.status === status)) {
						prds.push(prd);
					}
				}
			}
		} else {
			// List ALL PRDs by checking for a user's PRD index
			// First, try to get a list of all PRD IDs for this user
			try {
				const userId = 'default'; // TODO: We should pass userId properly, but for now use default
				const userPRDsKey = `user:${userId}:prds`;
				const userPRDsData = await this.ctx.kv.get(KV_NAMESPACE, userPRDsKey);

				let prdIds: string[] = [];
				if (userPRDsData.exists) {
					prdIds = await userPRDsData.data.json() as string[];
				}

				// Get each PRD
				for (const prdId of prdIds.slice(0, limit)) {
					const prd = await this.getPRD(prdId);
					if (prd && (status === 'all' || prd.status === status)) {
						prds.push(prd);
					}
				}
			} catch (error) {
				this.ctx.logger?.warn('Could not list user PRDs', { error });
			}
		}

		return prds;
	}
}
