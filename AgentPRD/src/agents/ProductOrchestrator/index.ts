import type { AgentContext, AgentRequest, AgentResponse } from '@agentuity/sdk';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const KV_NAMESPACE = 'agentprd-main';

interface ConversationContext {
	messages: Array<{
		role: 'user' | 'assistant';
		content: string;
		timestamp: string;
	}>;
	sessionId: string;
	userId?: string;
}

export const welcome = () => {
	return {
		welcome: "Welcome to AgentPRD! I'm your AI Product Manager assistant.",
		prompts: [
			{
				data: '/create-prd mobile analytics app',
				contentType: 'text/plain',
			},
			{
				data: '/help',
				contentType: 'text/plain',
			},
		],
	};
};

export default async function ProductOrchestrator(
	req: AgentRequest,
	resp: AgentResponse,
	ctx: AgentContext
) {
	try {
		const trigger = req.trigger;
		const contentType = req.data.contentType;

		ctx.logger.info('Processing request', { trigger, contentType });

		let userMessage: string;
		let sessionId = `session_${Date.now()}`;
		let command: string | undefined;
		let userId: string | undefined;

		let clientConversationHistory: any[] = [];

		if (contentType === 'application/json') {
			try {
				const requestData = await req.data.json() as any;
				userMessage = requestData?.message || 'Hello';
				sessionId = requestData?.context?.sessionId || sessionId;
				command = requestData?.context?.command;
				userId = requestData?.userId;
				clientConversationHistory = requestData?.context?.conversationHistory || [];
			} catch (e) {
				userMessage = 'Hello';
			}
		} else {
			userMessage = await req.data.text();
		}

		if (userMessage.startsWith('/') && !command) {
			const parts = userMessage.slice(1).split(' ');
			command = parts[0] || '';
			userMessage = parts.slice(1).join(' ') || '';
		}

		ctx.logger.info('Processing', { command, message: userMessage.substring(0, 50), sessionId });

		// Use conversation history from client if available, otherwise load from KV storage
		const contextKey = `conversation:${sessionId}`;
		let conversationContext: ConversationContext;

		if (clientConversationHistory.length > 0) {
			// Use the conversation history sent from the client (real-time)
			conversationContext = {
				messages: clientConversationHistory,
				sessionId,
				userId
			};
			ctx.logger.info('Using client conversation history', { messageCount: clientConversationHistory.length });
		} else {
			// Fallback to KV storage if no client history (session recovery)
			try {
				const stored = await ctx.kv.get(KV_NAMESPACE, contextKey);
				if (stored.exists) {
					conversationContext = await stored.data.json() as unknown as ConversationContext;
					ctx.logger.info('Loaded conversation from KV storage', { messageCount: conversationContext.messages.length });
				} else {
					conversationContext = {
						messages: [],
						sessionId,
						userId
					};
					ctx.logger.info('Starting new conversation');
				}
			} catch (error) {
				ctx.logger.warn('Failed to load conversation context', { error });
				conversationContext = {
					messages: [],
					sessionId,
					userId
				};
			}
		}

		// Prepare messages for AI, filtering empty content
		const messages = conversationContext.messages
			.filter(msg => msg.content?.trim()?.length > 0)
			.map(msg => ({
				role: msg.role,
				content: msg.content.trim()
			}));

		// Ensure we have at least one message
		if (messages.length === 0) {
			messages.push({
				role: 'user',
				content: userMessage || 'Hello'
			});
		}

		const systemPrompt = getSystemPrompt(command);

		const result = streamText({
			model: openai('o3-2025-04-16'),
			system: systemPrompt,
			messages: messages,
			maxTokens: 3000,
			temperature: 0.7,
		});

		// For CLI requests (JSON content type), use streaming to show real-time AI generation
		if (contentType === 'application/json') {
			let fullResponse = '';

			// Create a custom stream that captures the response for storage
			const captureStream = async function* () {
				for await (const chunk of result.textStream) {
					fullResponse += chunk;
					yield chunk;
				}

				// After streaming is complete, save the conversation
				conversationContext.messages.push({
					role: 'assistant',
					content: fullResponse,
					timestamp: new Date().toISOString()
				});

				try {
					await ctx.kv.set(KV_NAMESPACE, contextKey, conversationContext);
					ctx.logger.info('Conversation saved to KV', { sessionId, messageCount: conversationContext.messages.length });
				} catch (error) {
					ctx.logger.error('Failed to save conversation', { error });
				}
			};

			return resp.stream(captureStream());
		} else {
			// For other channels (email, Discord, etc.), collect full response
			let fullResponse = '';
			for await (const chunk of result.textStream) {
				fullResponse += chunk;
			}

			// Save conversation for non-streaming responses too
			conversationContext.messages.push({
				role: 'assistant',
				content: fullResponse,
				timestamp: new Date().toISOString()
			});

			try {
				await ctx.kv.set(KV_NAMESPACE, contextKey, conversationContext);
				ctx.logger.info('Conversation saved to KV', { sessionId, messageCount: conversationContext.messages.length });
			} catch (error) {
				ctx.logger.error('Failed to save conversation', { error });
			}

			return resp.json({
				content: fullResponse,
				sessionId,
				needsApproval: false
			});
		}

	} catch (error) {
		ctx.logger.error('Error:', error);
		return resp.json({
			content: 'Sorry, there was an error processing your request.',
			sessionId: `session_${Date.now()}`,
			error: 'Processing error'
		});
	}
}

function getSystemPrompt(command?: string): string {
	const base = `You are AgentPRD, an expert AI Product Manager assistant with 10+ years of experience at top tech companies. You help with PRD creation, feature brainstorming, and strategic product coaching.

**Your approach is interactive and custom:**
- No generic templates - you create customized structures for each user's specific needs
- Ask clarifying questions to understand context deeply
- Use proven PM frameworks (RICE, Jobs-to-be-Done, OKRs, etc.)
- Think like a senior PM who ships successful products`;

	if (command === 'create-prd') {
		return base + `

**TASK: Interactive PRD Creation**

Don't use templates. Instead, interview the user to understand their specific product needs:

1. **Product Overview**: What exactly are they building? What problem does it solve?
2. **Target Users**: Who will use this? What are their jobs-to-be-done?
3. **Business Context**: What are the business goals? Success metrics?
4. **Constraints**: Timeline, resources, technical limitations?
5. **Scope**: What's in/out of scope for this version?

Based on their answers, create a custom PRD structure that fits their exact needs. Always ask follow-up questions to flesh out details in real-time.

Start by asking them about their product to understand what kind of PRD structure would work best.`;
	}

	if (command === 'brainstorm') {
		return base + ` Generate prioritized feature ideas with impact/complexity analysis. Ask about their product context first.`;
	}

	if (command === 'coach') {
		return base + ` Provide strategic PM advice using proven frameworks. Ask follow-up questions to understand their specific situation.`;
	}

	if (command === 'help') {
		return base + `

Show available commands:
- /create-prd - Interactive PRD creation (no templates, custom structure)
- /brainstorm - Feature ideation and prioritization  
- /coach - Strategic product management advice
- /history - Show past PRDs and work
- /export - Export current work to file
- /help - Show this help

Explain that you don't use generic templates but create custom solutions for each user.`;
	}

	if (command === 'history') {
		return base + ` Show the user's past PRDs and work from KV storage. List them with titles and brief descriptions.`;
	}

	if (command === 'export') {
		return base + ` Help the user export their current work or past PRDs to various formats (markdown, PDF, etc.).`;
	}

	return base + ` Be helpful and guide them toward using /create-prd, /brainstorm, or /coach based on their needs.`;
}
