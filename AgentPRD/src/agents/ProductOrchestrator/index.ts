import type { AgentContext, AgentRequest, AgentResponse } from '@agentuity/sdk';
import { anthropic, type AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import {
  ContextManager,
  createContextTools,
} from '../../tools/context-tools.js';
import { SearchManager, createSearchTools } from '../../tools/search-tools.js';
import { PRDManager, createPRDTools } from '../../tools/prd-tools.js';
import {
  VisualizationManager,
  createVisualizationTools,
} from '../../tools/visualization-tools.js';

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
        const requestData = (await req.data.json()) as any;
        userMessage = requestData?.message || 'Hello';
        sessionId = requestData?.context?.sessionId || sessionId;
        command = requestData?.context?.command;
        userId = requestData?.userId;
        clientConversationHistory =
          requestData?.context?.conversationHistory || [];
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

    ctx.logger.info('Processing', {
      command,
      message: userMessage.substring(0, 50),
      sessionId,
    });

    // Use conversation history from client if available, otherwise load from KV storage
    const contextKey = `conversation:${sessionId}`;
    let conversationContext: ConversationContext;

    if (clientConversationHistory.length > 0) {
      // Use the conversation history sent from the client (real-time)
      conversationContext = {
        messages: clientConversationHistory,
        sessionId,
        userId,
      };
      ctx.logger.info('Using client conversation history', {
        messageCount: clientConversationHistory.length,
      });
    } else {
      // Fallback to KV storage if no client history (session recovery)
      try {
        const stored = await ctx.kv.get(KV_NAMESPACE, contextKey);
        if (stored.exists) {
          conversationContext =
            (await stored.data.json()) as unknown as ConversationContext;
          ctx.logger.info('Loaded conversation from KV storage', {
            messageCount: conversationContext.messages.length,
          });
        } else {
          conversationContext = {
            messages: [],
            sessionId,
            userId,
          };
          ctx.logger.info('Starting new conversation');
        }
      } catch (error) {
        ctx.logger.warn('Failed to load conversation context', { error });
        conversationContext = {
          messages: [],
          sessionId,
          userId,
        };
      }
    }

    // Prepare messages for AI, filtering empty content
    const messages = conversationContext.messages
      .filter((msg) => msg.content?.trim()?.length > 0)
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }));

    // Ensure we have at least one message
    if (messages.length === 0) {
      messages.push({
        role: 'user',
        content: userMessage || 'Hello',
      });
    }

    const systemPrompt = getSystemPrompt(command);
    const contextManager = new ContextManager(ctx);
    const searchManager = new SearchManager(ctx);
    const prdManager = new PRDManager(ctx);
    const vizManager = new VisualizationManager(ctx);
    const contextTools = createContextTools(contextManager, userId);
    const searchTools = createSearchTools(searchManager, userId);
    const prdTools = createPRDTools(prdManager, userId);
    const vizTools = createVisualizationTools(vizManager);
    const tools = { ...contextTools, ...searchTools, ...prdTools, ...vizTools };

    // For now, use Sonnet for all commands to debug the issue
    const result = streamText({
      model: anthropic('claude-4-sonnet-20250514'),
      system: systemPrompt,
      messages: messages,
      tools: tools,
      maxSteps: 5,
      toolChoice: 'auto',
      headers: {
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 15000 },
        } satisfies AnthropicProviderOptions,
      },
    });

    // For CLI requests (JSON content type), use streaming to show real-time AI generation
    if (contentType === 'application/json') {
      let fullResponse = '';

      // Add user message to conversation history before streaming (if not already there)
      if (
        !conversationContext.messages.some(
          (m) =>
            m.role === 'user' &&
            m.content === userMessage &&
            Math.abs(new Date(m.timestamp).getTime() - Date.now()) < 5000
        )
      ) {
        conversationContext.messages.push({
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        });
      }

      // Create a ReadableStream to handle streaming and cleanup
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            const encoder = new TextEncoder();

            // Stream all events including tool calls
            for await (const chunk of result.fullStream) {
              switch (chunk.type) {
                case 'text-delta':
                  fullResponse += chunk.textDelta;
                  controller.enqueue(encoder.encode(chunk.textDelta));
                  break;

                case 'tool-call-streaming-start':
                  const toolStartEvent = {
                    type: 'tool-call-start',
                    toolName: chunk.toolName,
                    timestamp: Date.now(),
                  };
                  controller.enqueue(
                    encoder.encode(
                      `\n__AGENTPRD_TOOL_EVENT__${JSON.stringify(toolStartEvent)}\n`
                    )
                  );
                  break;

                case 'tool-call':
                  const toolCallEvent = {
                    type: 'tool-call',
                    toolName: chunk.toolName,
                    args: chunk.args,
                    toolCallId: chunk.toolCallId,
                    timestamp: Date.now(),
                  };
                  controller.enqueue(
                    encoder.encode(
                      `\n__AGENTPRD_TOOL_EVENT__${JSON.stringify(toolCallEvent)}\n`
                    )
                  );
                  break;

                case 'tool-result':
                  const toolResultEvent = {
                    type: 'tool-result',
                    toolCallId: chunk.toolCallId,
                    toolName: chunk.toolName || 'unknown',
                    result: chunk.result,
                    timestamp: Date.now(),
                  };
                  controller.enqueue(
                    encoder.encode(
                      `\n__AGENTPRD_TOOL_EVENT__${JSON.stringify(toolResultEvent)}\n`
                    )
                  );
                  break;

                case 'step-finish':
                  const stepEvent = {
                    type: 'step-finish',
                    isContinued: chunk.isContinued,
                    timestamp: Date.now(),
                  };
                  controller.enqueue(
                    encoder.encode(
                      `\n__AGENTPRD_TOOL_EVENT__${JSON.stringify(stepEvent)}\n`
                    )
                  );
                  break;
              }
            }

            // After streaming is complete, save conversation and send metadata
            conversationContext.messages.push({
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date().toISOString(),
            });

            // Save to KV storage outside the stream context
            try {
              await ctx.kv.set(KV_NAMESPACE, contextKey, conversationContext);
              ctx.logger.info('Conversation saved to KV', {
                sessionId,
                messageCount: conversationContext.messages.length,
              });
            } catch (error) {
              ctx.logger.error('Failed to save conversation', { error });
            }

            // Send final metadata chunk
            const metadata = {
              type: 'metadata',
              sessionId,
              conversationHistory: conversationContext.messages.slice(-10), // Last 10 messages
              needsApproval: false,
            };

            const metadataChunk =
              '\n__AGENTPRD_METADATA__\n' + JSON.stringify(metadata);
            controller.enqueue(encoder.encode(metadataChunk));

            // Close the stream
            controller.close();
          } catch (error) {
            ctx.logger.error('Error processing stream', { error });
            controller.error(error);
          }
        },
      });

      return resp.stream(readableStream);
    } else {
      // For other channels (email, Discord, etc.), collect full response
      let fullResponse = '';
      for await (const chunk of result.fullStream) {
        if (chunk.type === 'text-delta') {
          fullResponse += chunk.textDelta;
        }
      }

      // Add user message to conversation history (if not already there)
      if (
        !conversationContext.messages.some(
          (m) =>
            m.role === 'user' &&
            m.content === userMessage &&
            Math.abs(new Date(m.timestamp).getTime() - Date.now()) < 5000
        )
      ) {
        conversationContext.messages.push({
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        });
      }

      // Save conversation for non-streaming responses too
      conversationContext.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      });

      try {
        await ctx.kv.set(KV_NAMESPACE, contextKey, conversationContext);
        ctx.logger.info('Conversation saved to KV', {
          sessionId,
          messageCount: conversationContext.messages.length,
        });
      } catch (error) {
        ctx.logger.error('Failed to save conversation', { error });
      }

      return resp.json({
        content: fullResponse,
        sessionId,
        needsApproval: false,
      });
    }
  } catch (error) {
    ctx.logger.error('Error:', error);
    return resp.json({
      content: 'Sorry, there was an error processing your request.',
      sessionId: `session_${Date.now()}`,
      error: 'Processing error',
    });
  }
}

function getSystemPrompt(command?: string): string {
  const base = `You are AgentPRD, an expert AI Product Manager assistant with 10+ years of experience at top tech companies. You help with PRD creation, feature brainstorming, and strategic product coaching.

**Your approach is interactive and custom:**
- No generic templates - you create customized structures for each user's specific needs
- Ask clarifying questions to understand context deeply
- Use proven PM frameworks (RICE, Jobs-to-be-Done, OKRs, etc.)
- Think like a senior PM who ships successful products

**Context Management:**
You have tools to manage work contexts and store PRDs:
- Use set_work_context when users want to establish what they're working on
- Use get_work_context to check current work and goals
- Use store_prd to save completed PRDs for future reference
- Use list_prds to show past work
- Help users maintain continuity between sessions

**Search & Notes:**
You have powerful search and note-taking tools:
- Use search_prds for full-text search across PRDs with filters
- Use search_all to search across PRDs, contexts, and notes
- Use add_note to capture quick thoughts or ideas
- Use list_notes to retrieve notes with filtering
- Use get_suggestions for auto-completion based on past work`;

  if (command === 'create-prd') {
    return (
      base +
      `

**TASK: Interactive PRD Creation**

Don't use templates. Instead, interview the user to understand their specific product needs:

1. **Product Overview**: What exactly are they building? What problem does it solve?
2. **Target Users**: Who will use this? What are their jobs-to-be-done?
3. **Business Context**: What are the business goals? Success metrics?
4. **Constraints**: Timeline, resources, technical limitations?
5. **Scope**: What's in/out of scope for this version?

Based on their answers, create a custom PRD structure that fits their exact needs. Always ask follow-up questions to flesh out details in real-time.

Start by asking them about their product to understand what kind of PRD structure would work best.`
    );
  }

  if (command === 'brainstorm') {
    return (
      base +
      ` Generate prioritized feature ideas with impact/complexity analysis. Ask about their product context first.`
    );
  }

  if (command === 'coach') {
    return (
      base +
      ` Provide strategic PM advice using proven frameworks. Ask follow-up questions to understand their specific situation.`
    );
  }

  if (command === 'context') {
    return (
      base +
      `
		
**TASK: Context Management**

Help the user manage their work context. Available actions:
- set: Establish what they're working on with clear goals
- get: Show current work context and progress
- list: Show all available work contexts
- switch: Change to a different work context

Use the context management tools to store and retrieve work state. Always confirm actions taken.`
    );
  }

  if (command === 'help') {
    return (
      base +
      `

Show available commands:
- /create-prd - Interactive PRD creation (no templates, custom structure)
- /brainstorm - Feature ideation and prioritization  
- /coach - Strategic product management advice
- /context - Manage work context and goals (set, get, list, switch)
- /search - Search across PRDs, notes, and contexts
- /note - Capture quick thoughts and ideas
- /visualize - Create charts and visual representations
- /history - Show past PRDs and work
- /export - Export current work to file
- /prds - List and manage your PRDs  
- /help - Show this help

Explain that you don't use generic templates but create custom solutions for each user.`
    );
  }

  if (command === 'history') {
    return (
      base +
      ` Show the user's past PRDs and work from KV storage. List them with titles and brief descriptions.`
    );
  }

  if (command === 'search') {
    return (
      base +
      `

**TASK: Search Across Content**

Help the user search for information across their PRDs, notes, and contexts. 

If no search query provided, ask what they're looking for. Otherwise:
1. Use search_all tool to search across all content types
2. Present results in a clear, organized format showing:
   - Type (PRD/Note/Context)
   - Title or excerpt
   - Match relevance
   - Date created
3. Offer to open or view any specific result

For advanced searches, offer filters like:
- Type-specific search (just PRDs, just notes)
- Date ranges
- Status filters for PRDs
- Tag filters`
    );
  }

  if (command === 'note') {
    return (
      base +
      `

**TASK: Quick Note Capture**

Help the user capture a quick thought or idea.

If they provided content after /note, immediately:
1. Use add_note tool to save the note
2. Ask if they want to:
   - Associate it with the current context
   - Add tags for organization
   - Link it to a specific PRD

If no content provided:
1. Ask what they'd like to note down
2. Suggest they can also:
   - List recent notes with /note list
   - Search notes with /search
   - Add tags for better organization

Keep responses brief - this is meant for quick capture.`
    );
  }

  if (command === 'prds') {
    return (
      base +
      `

**TASK: List and Manage PRDs**

Handle PRD listing operations:
- **list/recent**: Use list_prds tool to show stored PRDs with titles, dates, and status
- **search <term>**: Search through PRD titles and content (if search capability exists)

Always use the list_prds tool to get actual stored PRDs from KV storage, not conversation history.
Show PRDs in a clear, organized format with:
- PRD ID (for use with /prd export <id>)
- Title
- Creation date  
- Status (draft/review/approved)

If no PRDs found, guide user to create one with /create-prd.`
    );
  }

  if (command === 'export') {
    return (
      base +
      `

**TASK: Export Current Work to Markdown**

Your job is to export the user's recent meaningful work to clean markdown format. Follow these steps:

1. **Identify Exportable Content**: Look through the recent conversation history for:
   - PRDs created with /create-prd
   - Brainstorming sessions from /brainstorm  
   - Substantial coaching outputs from /coach
   - Any other significant work product (>300 words)

2. **Format as Clean Markdown**: Structure the content with:
   - Clear headings (# ## ###)
   - Bulleted lists for features/ideas
   - Tables for comparisons if relevant
   - Code blocks for technical specs
   - Proper spacing and organization

3. **Include Context**: Add a header with:
   - Title of the work
   - Date created
   - Brief description

4. **Handle Edge Cases**:
   - If no substantial work found: Explain what can be exported and suggest creating content first
   - If multiple pieces: Ask which specific item to export or export the most recent substantial work

Focus on extracting and formatting existing conversation content, not creating new content. Be efficient and direct.`
    );
  }

  if (command === 'prd') {
    return (
      base +
      `

**TASK: PRD Management Operations**

Handle PRD-specific operations based on the user's command:

- **show**: Display PRD details (use get_prd tool)
- **delete**: Confirm and delete PRD (use appropriate tools)  
- **export**: Export specific PRD to markdown format (use get_prd tool)

For PRD export specifically:
1. Use the get_prd tool to retrieve the PRD by ID
2. Format the PRD content as clean, well-structured markdown
3. Include metadata (title, created date, status)
4. If PRD not found, explain available PRDs or suggest using /prds

Be efficient and direct - this is an operational task, not creative work.`
    );
  }

  if (command === 'visualize') {
    return (
      base +
      `

**TASK: Create Visual Representations**

Help the user create ASCII charts and visual representations of their data.

Available visualization types:
1. **Feature Priority Matrix** - Impact vs Effort analysis
2. **Project Timeline** - Gantt chart for phases and milestones  
3. **Metrics Dashboard** - KPIs and trends
4. **User Journey Map** - Satisfaction and pain points
5. **PRD Status** - Completion and progress tracking

If no specific data provided, ask what they'd like to visualize. Use the visualization tools to create clear ASCII representations that work well in a terminal.

Examples:
- "Show me a priority matrix for my features"
- "Create a timeline for Q1 deliverables"
- "Visualize the completion status of my PRD"`
    );
  }

  return (
    base +
    ` Be helpful and guide them toward using /create-prd, /brainstorm, or /coach based on their needs.`
  );
}
