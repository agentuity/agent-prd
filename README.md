<div align="center">
    <img src="https://raw.githubusercontent.com/agentuity/cli/refs/heads/main/.github/Agentuity.png" alt="Agentuity" width="100"/> <br/>
    <strong>Build Agents, Not Infrastructure</strong> <br/>
	<br/>
		<a target="_blank" href="https://app.agentuity.com/deploy" alt="Agentuity">
			<img src="https://app.agentuity.com/img/deploy.svg" /> 
		</a>

<br />
</div>

# 📋 AI Product Management Suite

A comprehensive AI-powered product management solution built with **Agentuity**, featuring both a cloud agent and CLI tool for creating PRDs, brainstorming features, and managing product workflows.

## ✨ Key Features

- 🤖 **AgentPRD**: Cloud-native AI agent for intelligent product management assistance
- 💻 **AgentPM CLI-APP**: Modern terminal UI with React/Ink for enhanced user experience
- 📝 **PRD Generation**: Create comprehensive Product Requirements Documents from simple ideas
- 🧠 **Feature Brainstorming**: AI-assisted ideation and strategic planning
- 🎯 **PM Coaching**: Get personalized product management guidance and feedback
- 🔧 **Real-time Tool Visibility**: Claude Code-style inline tool call streaming
- 📋 **Context Management**: Maintain work context and PRD history across sessions
- 📤 **Multi-format Export**: Export to PDF, Confluence, Markdown, and more
- 🚀 **Agentuity Native**: Built for seamless deployment on Agentuity platform

## 🔄 How It Works

The suite consists of three complementary components:
- **AgentPRD**: Cloud agent handling AI intelligence, tool execution, and data persistence
- **CLI-APP**: Modern terminal UI with real-time streaming and inline tool visibility

The modern CLI-APP provides Claude Code-style transparency, showing tool calls inline as they happen.

## 🚀 Quick Start with Agentuity

### Prerequisites

- **Bun**: 1.2.4+ ([Installation](https://bun.sh/docs/installation))
- **Agentuity CLI**: Install from [agentuity.dev](https://agentuity.dev)
- **Node.js**: 18+ (for CLI development)

### Authentication

```bash
agentuity login
```

### Development Mode

#### AgentPRD (Cloud Agent)

Set up your `.env` in the AgentPRD directory:

```text
AGENTUITY_SDK_KEY=your_sdk_key
AGENTUITY_PROJECT_KEY=your_project_key
```

Start the agent in development mode:

```bash
cd AgentPRD
agentuity dev
```

This launches the Agentuity Console for real-time agent testing.

#### AgentPM CLI-APP (Modern TUI)

Set up and run the modern CLI:

```bash
cd CLI-APP
bun install
bun run dev
```

### Production Deployment

Deploy the cloud agent:

```bash
cd AgentPRD
agentuity deploy
```

Build the CLI-APP for distribution:

```bash
cd CLI-APP
bun run build
```

### Example Usage

#### Cloud Agent (via Agentuity Console)
```
🔹 PRD Creation: "Create a PRD for a mobile task management app"
🔹 Feature Ideas: "Brainstorm retention features for our SaaS platform"
🔹 PM Coaching: "Review my product strategy and suggest improvements"
🔹 Template Use: "Use the B2B SaaS template for a new analytics dashboard"
```

#### CLI-APP Interface (Modern TUI)
```bash
# Start interactive session
agentpm

# Quick commands with real-time tool visibility
AgentPM> /create-prd mobile productivity app
AgentPM> /brainstorm user onboarding
AgentPM> /coach
AgentPM> /reasoning  # Toggle AI reasoning display
AgentPM> /clear     # Clear chat and tool history
```

Tool calls appear inline:
```
🔧 SET WORK CONTEXT • ⚡ Executing... 
📝 title: Mobile App PRD, description: Task management features

🔧 STORE PRD • ✅ Completed
📤 Created: Task Management App (prd_1234_abcd)
```

## 🏗️ Development

### AgentPRD (Cloud Agent)
```bash
# Development server with hot reload
cd AgentPRD
agentuity dev

# Code formatting and linting
biome format --write .
biome lint .

# Deploy to production
agentuity deploy
```

### AgentPM CLI-APP (Modern TUI)
```bash
# Development mode with React/Ink
cd CLI-APP
bun run dev

# Build for production
bun run build

# Start built application
bun run start
```

### Project Structure
```
├── AgentPRD/              # Agentuity cloud agent
│   ├── src/
│   │   ├── agents/        # Agent implementations with tool streaming
│   │   └── tools/         # Context management tools (7 tools)
│   ├── agentuity.yaml     # Agentuity configuration
│   ├── biome.json         # Code formatting config
│   └── package.json
├── CLI-APP/               # Modern TUI with React/Ink
│   ├── src/
│   │   ├── components/    # React components (chat, tools, layout)
│   │   ├── hooks/         # React hooks (useAgent, useApproval)
│   │   ├── client/        # Agent communication with streaming
│   │   ├── utils/         # Slash commands, config, streaming
│   │   └── types.ts       # TypeScript definitions
│   └── package.json
├── AGENT.md              # Development guidelines
└── CLAUDE.md             # Claude Code guidance

### Environment Configuration

#### AgentPRD
```bash
# Set environment variables for cloud deployment
agentuity env set OPENAI_API_KEY your_openai_key
agentuity env set --secret DATABASE_URL your_db_url
```

#### CLI
```bash
# Configure CLI connection to deployed agent
agentpm config set agentUrl https://your-agent.agentuity.com
agentpm config set agentApiKey your_api_key
```

## 📋 Configuration

### CLI Configuration Options
- `agentUrl`: AgentPRD cloud agent endpoint
- `agentApiKey`: Authentication key for agent access
- `approvalMode`: suggest | auto-edit | full-auto
- `defaultTemplate`: Default PRD template
- `exportFormat`: Default export format (markdown, pdf, etc.)

### Environment Variables
Both components support environment variable configuration:
- `AGENTPM_AGENT_URL` - Agent endpoint URL
- `AGENTPM_AGENT_API_KEY` - Authentication key
- `AGENTPM_APPROVAL_MODE` - suggest | auto-edit | full-auto
- `AGENTPM_SHOW_REASONING` - true/false for AI reasoning display

## 🔧 Key Technologies

### AgentPRD (Cloud Agent)
- **Agentuity SDK** with AI SDK integration
- **Claude 4 Sonnet** with reasoning capabilities
- **Tool streaming** via `fullStream` events
- **KV storage** for session persistence

### CLI-APP (Modern TUI)
- **React + Ink** for terminal UI components
- **Real-time streaming** with tool call visibility
- **TypeScript** with strict mode
- **Bun runtime** for fast execution

## 📊 Testing

### Interactive Testing
- **AgentPRD**: Use `agentuity dev` for real-time console testing
- **CLI-APP**: Use `bun run dev` for TUI testing with tool visibility

### Manual Testing Workflows
```bash
# Test agent responses and tool execution
cd AgentPRD && agentuity dev  # Open console, test queries

# Test modern TUI with tool streaming
cd CLI-APP && bun run dev
```

## 🤝 Contributing

This is a production-ready product management suite built with Agentuity. Both components follow TypeScript best practices with Biome formatting and comprehensive error handling.

### Development Workflow
1. Clone the repository
2. Install dependencies with `bun install` in both directories
3. Set up environment variables
4. Use `agentuity dev` for agent development
5. Use `bun run dev` for CLI development
6. Follow existing code conventions and patterns

## 📚 Documentation

- [Agentuity Documentation](https://agentuity.dev/docs)
- [Agentuity JavaScript SDK](https://agentuity.dev/SDKs/javascript)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🚀 What's New

### v0.2.0 - Claude Code-Style Tool Streaming
- **Inline tool call visibility** - See what tools the agent is using in real-time
- **Tool execution transparency** - Arguments and results displayed as they happen
- **Improved AI reasoning display** - Toggle with `/reasoning` command
- **Modern TUI with React/Ink** - Enhanced terminal user experience
- **7 context management tools** - Work contexts, PRD storage, and more

## 🆘 Support

- [Agentuity Discord Community](https://discord.com/invite/vtn3hgUfuc)
- [Agentuity Support](https://agentuity.dev/support)
- [CLI-APP Documentation](CLI-APP/README.md)
- [CLI Help](CLI/README.md)
- [Agent Documentation](AgentPRD/README.md)

---

<div align="center">
<strong>Built with ❤️ using Agentuity, Bun, TypeScript, and modern development practices</strong>
</div>
