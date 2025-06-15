import type { AgentContext, AgentRequest, AgentResponse } from '@agentuity/sdk';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

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

		if (contentType === 'application/json') {
			try {
				const requestData = await req.data.json() as any;
				userMessage = requestData?.message || 'Hello';
				sessionId = requestData?.context?.sessionId || sessionId;
				command = requestData?.context?.command;
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

		ctx.logger.info('Processing', { command, message: userMessage.substring(0, 50) });

		const systemPrompt = getSystemPrompt(command);

		const result = streamText({
			model: openai('o3'),
			system: systemPrompt,
			messages: [{ role: 'user', content: userMessage }],
			maxTokens: 3000,
			temperature: 0.7,
		});

		let fullResponse = '';
		for await (const chunk of result.textStream) {
			fullResponse += chunk;
		}

		return resp.json({
			content: fullResponse,
			sessionId,
			needsApproval: false
		});

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
- /help - Show this help

Explain that you don't use generic templates but create custom solutions for each user.`;
	}

	return base + ` Be helpful and guide them toward using /create-prd, /brainstorm, or /coach based on their needs.`;
}
