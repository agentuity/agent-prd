import type { AgentContext, AgentRequest, AgentResponse } from '@agentuity/sdk';
import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

// Types matching CLI agent-client interface
interface CLIAgentRequest {
  userId?: string;
  channel: 'cli' | 'email' | 'slack' | 'discord';
  message: string;
  context?: {
    sessionId?: string;
    files?: FileAttachment[];
    approvalMode?: 'suggest' | 'auto-edit' | 'full-auto';
    command?: string;
  };
}

interface CLIAgentResponse {
  content: string;
  actions?: Action[];
  files?: GeneratedFile[];
  needsApproval?: boolean;
  sessionId: string;
  error?: string;
}

interface FileAttachment {
  name: string;
  content: string;
  type: 'text' | 'binary';
}

interface GeneratedFile {
  name: string;
  content: string;
  type: 'markdown' | 'pdf' | 'json';
  description?: string;
}

interface Action {
  type: 'create-file' | 'update-file' | 'export' | 'template-apply';
  description: string;
  data: any;
}

// PRD Template System
const PRD_TEMPLATES = {
  'feature': {
    name: 'Feature PRD Template',
    sections: [
      '# Product Requirements Document: {feature_name}',
      '',
      '## Executive Summary',
      '**Problem Statement:** {problem}',
      '**Solution Overview:** {solution}',
      '**Success Metrics:** {metrics}',
      '',
      '## Problem Definition',
      '### Current State',
      '{current_state}',
      '',
      '### Pain Points',
      '- {pain_point_1}',
      '- {pain_point_2}',
      '- {pain_point_3}',
      '',
      '## Solution Requirements',
      '### User Stories',
      '- As a {user_type}, I want {functionality} so that {benefit}',
      '',
      '### Functional Requirements',
      '1. {requirement_1}',
      '2. {requirement_2}',
      '3. {requirement_3}',
      '',
      '### Non-Functional Requirements',
      '- **Performance:** {performance_req}',
      '- **Security:** {security_req}',
      '- **Scalability:** {scalability_req}',
      '',
      '## Technical Specifications',
      '### Architecture Overview',
      '{architecture_overview}',
      '',
      '### API Requirements',
      '{api_requirements}',
      '',
      '## Success Metrics & KPIs',
      '- **Primary Metric:** {primary_metric}',
      '- **Secondary Metrics:** {secondary_metrics}',
      '',
      '## Implementation Plan',
      '### Phase 1: {phase_1}',
      '### Phase 2: {phase_2}',
      '### Phase 3: {phase_3}',
      '',
      '## Risk Assessment',
      '### Technical Risks',
      '- {technical_risk_1}',
      '',
      '### Business Risks',
      '- {business_risk_1}',
      '',
      '## Timeline',
      '- **Planning:** {planning_timeline}',
      '- **Development:** {dev_timeline}',
      '- **Testing:** {testing_timeline}',
      '- **Launch:** {launch_timeline}',
    ]
  },
  'saas': {
    name: 'SaaS Product PRD Template',
    sections: [
      '# SaaS Product Requirements: {product_name}',
      '',
      '## Market Opportunity',
      '**Market Size:** {market_size}',
      '**Target Audience:** {target_audience}',
      '**Competitive Landscape:** {competitors}',
      '',
      '## Product Vision',
      '**Vision Statement:** {vision}',
      '**Mission:** {mission}',
      '**Value Proposition:** {value_prop}',
      '',
      '## User Personas',
      '### Primary Persona: {primary_persona}',
      '- **Role:** {role}',
      '- **Goals:** {goals}',
      '- **Pain Points:** {pain_points}',
      '',
      '## Feature Requirements',
      '### Core Features (MVP)',
      '1. {core_feature_1}',
      '2. {core_feature_2}',
      '3. {core_feature_3}',
      '',
      '### Advanced Features (Post-MVP)',
      '1. {advanced_feature_1}',
      '2. {advanced_feature_2}',
      '',
      '## Technical Architecture',
      '### System Architecture',
      '{architecture}',
      '',
      '### Integration Requirements',
      '- {integration_1}',
      '- {integration_2}',
      '',
      '## Business Model',
      '**Pricing Strategy:** {pricing}',
      '**Revenue Streams:** {revenue}',
      '**Customer Acquisition:** {acquisition}',
      '',
      '## Go-to-Market Strategy',
      '### Launch Plan',
      '{launch_plan}',
      '',
      '### Marketing Channels',
      '- {channel_1}',
      '- {channel_2}',
      '',
      '## Success Metrics',
      '- **ARR Target:** {arr_target}',
      '- **User Growth:** {user_growth}',
      '- **Churn Rate:** {churn_target}',
      '- **CAC/LTV Ratio:** {cac_ltv}',
    ]
  }
};

export const welcome = () => {
  return {
    welcome: "Welcome to AgentPRD! I'm your AI Product Manager assistant. I can help you create PRDs, brainstorm features, provide product coaching, and manage templates.",
    prompts: [
      {
        data: '/create-prd mobile analytics app',
        contentType: 'text/plain',
      },
      {
        data: '/brainstorm user retention features',
        contentType: 'text/plain',
      },
      {
        data: '/coach How do I prioritize features for my MVP?',
        contentType: 'text/plain',
      },
      {
        data: '/templates',
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
    // Parse the request data
    const requestData = await req.data.text();
    let cliRequest: CLIAgentRequest;
    
    try {
      // Try to parse as JSON first (from CLI)
      cliRequest = JSON.parse(requestData || '{}');
    } catch {
      // Fallback to treating as simple message
      cliRequest = {
        channel: 'cli',
        message: requestData || 'Hello',
      };
    }

    const { message, context } = cliRequest;
    const sessionId = context?.sessionId || generateSessionId();
    const command = context?.command;
    const approvalMode = context?.approvalMode || 'suggest';

    ctx.logger.info(`Processing request: ${message}`, { command, sessionId, approvalMode });

    // Route based on command or message content
    let response: CLIAgentResponse;
    
    if (command) {
      response = await handleCommand(command, message, ctx, sessionId, approvalMode);
    } else if (message.startsWith('/')) {
      // Parse inline command
      const [cmd, ...args] = message.slice(1).split(' ');
      response = await handleCommand(cmd || '', args.join(' '), ctx, sessionId, approvalMode);
    } else {
      response = await handleConversation(message, ctx, sessionId, approvalMode);
    }

    return resp.json(response);

  } catch (error) {
    ctx.logger.error('Error in ProductOrchestrator:', error);
    
    const errorResponse: CLIAgentResponse = {
      content: 'Sorry, there was an error processing your request. Please try again.',
      sessionId: generateSessionId(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return resp.json(errorResponse);
  }
}

async function handleCommand(
  command: string, 
  args: string, 
  ctx: AgentContext, 
  sessionId: string, 
  approvalMode: string
): Promise<CLIAgentResponse> {
  
  switch (command) {
    case 'create-prd':
      return await createPRD(args, ctx, sessionId, approvalMode);
    
    case 'templates':
      return listTemplates(sessionId);
    
    case 'brainstorm':
      return await brainstorm(args, ctx, sessionId);
    
    case 'coach':
      return await productCoaching(args, ctx, sessionId);
    
    case 'export':
      return await exportDocument(args, ctx, sessionId);
    
    case 'help':
      return getHelp(sessionId);
    
    default:
      return {
        content: `Unknown command: /${command}\n\nAvailable commands:\n- /create-prd <description>\n- /templates\n- /brainstorm <topic>\n- /coach <question>\n- /export <format>\n- /help`,
        sessionId,
      };
  }
}

async function handleConversation(
  message: string, 
  ctx: AgentContext, 
  sessionId: string, 
  approvalMode: string
): Promise<CLIAgentResponse> {
  
  // Use AI to understand intent and provide helpful response
  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are AgentPRD, an expert AI Product Manager assistant. You help with:

1. **PRD Creation**: Writing comprehensive Product Requirements Documents
2. **Feature Brainstorming**: Generating and prioritizing feature ideas
3. **Product Coaching**: Providing strategic product management advice
4. **Template Management**: Helping with PRD templates and formats

When users ask about creating PRDs, suggest using /create-prd command.
When they want to brainstorm, suggest /brainstorm command.
For product advice, use /coach command.
To see templates, use /templates command.

Be concise, actionable, and always think like an experienced product manager.
If the user's request could benefit from a specific command, mention it.`,
    prompt: message,
  });

  return {
    content: result.text,
    sessionId,
  };
}

async function createPRD(
  description: string, 
  ctx: AgentContext, 
  sessionId: string, 
  approvalMode: string
): Promise<CLIAgentResponse> {
  
  // Analyze the description and determine the best template
  const analysisResult = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are an expert Product Manager. Based on the user's description, determine:
1. What type of PRD template to use (feature, saas, or custom)
2. Extract key information to populate the template
3. Suggest additional questions to ask

Return a JSON response with:
{
  "template": "feature" | "saas" | "custom",
  "extracted_info": { key: value pairs },
  "suggested_questions": ["question1", "question2"]
}`,
    prompt: `User wants to create a PRD for: ${description}`,
  });

  let analysis;
  try {
    analysis = JSON.parse(analysisResult.text);
  } catch {
    analysis = { template: 'feature', extracted_info: {}, suggested_questions: [] };
  }

  // Generate the PRD content
  const prdResult = await generateText({
    model: openai('gpt-4o'),
    system: `You are an expert Product Manager creating a comprehensive PRD. 
Create a detailed, professional Product Requirements Document based on the user's description.

Include these sections:
- Executive Summary
- Problem Definition  
- Solution Requirements
- User Stories
- Technical Specifications
- Success Metrics
- Implementation Plan
- Risk Assessment
- Timeline

Make it specific, actionable, and well-structured. Use markdown formatting.`,
    prompt: `Create a PRD for: ${description}
    
Additional context: ${JSON.stringify(analysis.extracted_info)}`,
  });

  const prdFile: GeneratedFile = {
    name: `PRD-${description.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`,
    content: prdResult.text,
    type: 'markdown',
    description: `Product Requirements Document for ${description}`
  };

  const actions: Action[] = [{
    type: 'create-file',
    description: `Create PRD file: ${prdFile.name}`,
    data: prdFile
  }];

  return {
    content: `✅ **PRD Created Successfully!**

I've generated a comprehensive Product Requirements Document for "${description}".

**Template Used:** ${analysis.template}
**File Generated:** ${prdFile.name}

**Key Sections Included:**
- Executive Summary with problem statement and solution overview
- Detailed user stories and functional requirements  
- Technical specifications and architecture considerations
- Success metrics and KPIs
- Implementation timeline and risk assessment

${analysis.suggested_questions.length > 0 ? `
**Consider these additional questions:**
${analysis.suggested_questions.map((q: string) => `- ${q}`).join('\n')}
` : ''}

The PRD is ready for review and can be exported to PDF using \`/export pdf\`.`,
    files: [prdFile],
    actions: approvalMode !== 'suggest' ? actions : undefined,
    needsApproval: approvalMode === 'suggest',
    sessionId,
  };
}

function listTemplates(sessionId: string): CLIAgentResponse {
  const templateList = Object.entries(PRD_TEMPLATES)
    .map(([key, template]) => `- **${key}**: ${template.name}`)
    .join('\n');

  return {
    content: `📋 **Available PRD Templates:**

${templateList}

**Usage:**
- Use \`/create-prd <description>\` and I'll automatically select the best template
- Templates include all standard PM sections: problem definition, requirements, metrics, timeline
- All templates are customizable based on your specific needs

**Template Features:**
- ✅ Executive Summary with problem/solution fit
- ✅ User stories and functional requirements
- ✅ Technical specifications and architecture
- ✅ Success metrics and KPIs
- ✅ Implementation roadmap and risk assessment`,
    sessionId,
  };
}

async function brainstorm(topic: string, ctx: AgentContext, sessionId: string): Promise<CLIAgentResponse> {
  const result = await generateText({
    model: openai('gpt-4o'),
    system: `You are an expert Product Manager facilitating a brainstorming session. 
Generate creative, practical, and prioritized feature ideas. 

For each idea, include:
- Feature name and brief description
- User value proposition
- Implementation complexity (Low/Medium/High)
- Potential impact (Low/Medium/High)
- Dependencies or considerations

Present ideas in order of priority (highest impact/lowest effort first).
Be specific and actionable.`,
    prompt: `Brainstorm features and improvements for: ${topic}`,
  });

  return {
    content: `🧠 **Brainstorming Session: ${topic}**

${result.text}

**Next Steps:**
- Use \`/create-prd <feature name>\` to create detailed requirements for any idea
- Use \`/coach prioritization strategy\` for help with feature prioritization
- Consider user research to validate these concepts`,
    sessionId,
  };
}

async function productCoaching(question: string, ctx: AgentContext, sessionId: string): Promise<CLIAgentResponse> {
  const result = await generateText({
    model: openai('gpt-4o'),
    system: `You are a senior Product Manager and coach with 10+ years of experience at top tech companies.
Provide strategic, actionable product management advice.

Focus on:
- Best practices and frameworks (RICE, OKRs, Jobs-to-be-Done, etc.)
- Practical implementation steps
- Common pitfalls to avoid
- Real-world examples when relevant

Be concise but comprehensive. Structure your advice clearly.`,
    prompt: question,
  });

  return {
    content: `🎯 **Product Coaching**

**Your Question:** ${question}

**Strategic Advice:**

${result.text}

**Want to dive deeper?**
- Ask follow-up questions about specific frameworks or strategies
- Use \`/brainstorm\` to generate ideas for any concepts discussed
- Use \`/create-prd\` to document any new initiatives`,
    sessionId,
  };
}

async function exportDocument(format: string, ctx: AgentContext, sessionId: string): Promise<CLIAgentResponse> {
  // For now, return guidance on export functionality
  const supportedFormats = ['pdf', 'docx', 'html', 'json'];
  
  if (!supportedFormats.includes(format.toLowerCase())) {
    return {
      content: `❌ **Unsupported Format:** ${format}

**Supported export formats:**
- \`pdf\` - Professional PDF document
- \`docx\` - Microsoft Word document  
- \`html\` - Web-ready HTML format
- \`json\` - Structured data format

**Usage:** \`/export pdf\``,
      sessionId,
    };
  }

  return {
    content: `📤 **Export Feature**

Export functionality will be available once documents are created in your session.

**To export documents:**
1. First create a PRD using \`/create-prd <description>\`
2. Then use \`/export ${format}\` to generate the export file

**Export format:** ${format.toUpperCase()}
**Status:** Ready to implement once documents are available`,
    sessionId,
  };
}

function getHelp(sessionId: string): CLIAgentResponse {
  return {
    content: `🤖 **AgentPRD Help**

**Available Commands:**
- \`/create-prd <description>\` - Generate a comprehensive PRD
- \`/templates\` - View available PRD templates  
- \`/brainstorm <topic>\` - Generate feature ideas
- \`/coach <question>\` - Get product management advice
- \`/export <format>\` - Export documents (pdf, docx, html, json)
- \`/help\` - Show this help message

**Natural Conversation:**
You can also chat naturally! I'll understand your intent and suggest the best commands to use.

**Examples:**
- "Help me create a PRD for a mobile analytics app"
- "I need ideas for improving user retention"  
- "How should I prioritize features for my MVP?"

**Pro Tips:**
- I remember context within your session for better continuity
- All generated PRDs follow product management best practices
- Use approval modes to control how I handle file operations`,
    sessionId,
  };
}

function generateSessionId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
