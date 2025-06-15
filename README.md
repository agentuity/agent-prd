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
- 💻 **AgentPM CLI**: Terminal-based interface for local product management workflows
- 📝 **PRD Generation**: Create comprehensive Product Requirements Documents from simple ideas
- 🧠 **Feature Brainstorming**: AI-assisted ideation and strategic planning
- 🎯 **PM Coaching**: Get personalized product management guidance and feedback
- 📋 **Template Management**: Consistent documentation with reusable templates
- 📤 **Multi-format Export**: Export to PDF, Confluence, Markdown, and more
- 🚀 **Agentuity Native**: Built for seamless deployment on Agentuity platform

## 🔄 How It Works

The suite consists of two complementary components: AgentPRD (cloud agent) handles the AI intelligence and reasoning, while AgentPM CLI provides a lightweight terminal interface. Users can interact through either component, with session context maintained in the cloud.

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

#### AgentPM CLI

Set up and run the CLI:

```bash
cd CLI
bun install
bun run dev
```

### Production Deployment

Deploy the cloud agent:

```bash
cd AgentPRD
agentuity deploy
```

Build the CLI for distribution:

```bash
cd CLI
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

#### CLI Interface
```bash
# Start interactive session
agentpm

# Quick commands
AgentPM> /create-prd mobile productivity app
AgentPM> /brainstorm user onboarding
AgentPM> /coach
AgentPM> /export pdf
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

### AgentPM CLI
```bash
# Development mode
cd CLI
bun run dev

# Build for production
bun run build

# Test built binary
bun run start
```

### Project Structure
```
├── AgentPRD/              # Agentuity cloud agent
│   ├── src/
│   │   ├── agents/        # Agent implementations
│   │   └── tools/         # Agent tools and utilities
│   ├── agentuity.yaml     # Agentuity configuration
│   ├── biome.json         # Code formatting config
│   └── package.json
├── CLI/                   # Terminal CLI interface
│   ├── src/
│   │   ├── commands/      # CLI command handlers
│   │   ├── repl/          # Interactive REPL
│   │   ├── client/        # Agent communication
│   │   └── utils/         # Configuration & utilities
│   └── package.json
└── AGENT.md              # Development guidelines
```

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
- `AGENTPM_AGENT_URL`
- `AGENTPM_AGENT_API_KEY`
- `AGENTPM_APPROVAL_MODE`

## 🛠️ Code Style & Conventions

### Formatting (Biome Configuration)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes preferred
- **Semicolons**: Required
- **Trailing Commas**: ES5 style
- **Imports**: Auto-organized

### TypeScript
- Strict mode enabled
- ES modules (`"type": "module"`)
- Consistent naming conventions
- Comprehensive type definitions

## 📊 Testing

### Interactive Testing
- **AgentPRD**: Use `agentuity dev` for real-time console testing
- **CLI**: Use `bun run dev` for manual testing and validation

### Manual Testing Workflows
```bash
# Test agent responses
agentuity dev  # Open console, test queries

# Test CLI functionality
cd CLI && bun run dev
# Test REPL commands, configuration, agent communication
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

## 🆘 Support

- [Agentuity Discord Community](https://discord.com/invite/vtn3hgUfuc)
- [Agentuity Support](https://agentuity.dev/support)
- [CLI Help](CLI/README.md)
- [Agent Documentation](AgentPRD/README.md)

---

<div align="center">
<strong>Built with ❤️ using Agentuity, Bun, TypeScript, and modern development practices</strong>
</div>
