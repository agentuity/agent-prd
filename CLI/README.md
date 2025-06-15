# AgentPM CLI

AI-powered product management assistant that runs in your terminal.

## Overview

AgentPM is a lightweight CLI tool that communicates with the AgentPRD cloud agent to help you:

- **Create PRDs** from simple ideas using AI
- **Brainstorm features** and product strategies  
- **Get PM coaching** and feedback on your work
- **Manage templates** for consistent documentation
- **Export** to multiple formats (PDF, Confluence, etc.)

## Installation

```bash
# Clone and build (for now)
git clone <repo>
cd CLI
bun install
bun run build

# Run the CLI
bun run dist/cli.js
```

## Quick Start

### 1. Configure Your Agent

```bash
# Set your AgentPRD URL and API key
agentpm config set agentUrl https://your-agent.agentuity.com
agentpm config set agentApiKey your-api-key-here

# Check configuration
agentpm config list
```

### 2. Start the Interactive REPL

```bash
# Launch interactive mode
agentpm

# Or start with a prompt
agentpm "Help me create a PRD for a mobile task management app"
```

### 3. Use Short Commands

Within the REPL, use slash commands for quick actions:

```bash
AgentPM> /help                           # Show available commands
AgentPM> /templates                      # List available templates  
AgentPM> /create-prd mobile task app     # Create a new PRD
AgentPM> /brainstorm user retention      # Start brainstorming
AgentPM> /export pdf                     # Export to PDF
AgentPM> /coach                          # Get PM coaching
```

## Features

### Interactive REPL
- **Conversational Interface**: Chat naturally with the AI agent
- **Streaming Responses**: Real-time AI output with typing effect
- **Session Memory**: Agent remembers context across interactions
- **Approval Modes**: Control how autonomous the agent can be

### Short Commands
- `/create-prd <idea>` - Generate PRDs from simple descriptions
- `/templates` - Browse and select from pre-built templates
- `/brainstorm <topic>` - AI-assisted ideation sessions
- `/export <format>` - Export work to various formats
- `/coach` - Get personalized PM guidance
- `/help` - Show all available commands

### Configuration Management
```bash
agentpm config list                      # Show current settings
agentpm config set <key> <value>         # Set configuration
agentpm config get <key>                 # Get specific setting
agentpm config reset                     # Reset to defaults
```

### Approval Modes
- **suggest** (default): Agent proposes actions, waits for approval
- **auto-edit**: Agent can write/modify files automatically  
- **full-auto**: Agent operates autonomously within constraints

## Configuration

### Required Settings
- `agentUrl`: Your AgentPRD cloud agent URL
- `agentApiKey`: API key for authentication

### Optional Settings
- `approvalMode`: suggest | auto-edit | full-auto (default: suggest)
- `defaultTemplate`: Default template to use for new PRDs
- `exportFormat`: Default export format (default: markdown)
- `verbose`: Enable detailed logging (default: false)
- `sessionTimeout`: Session timeout in seconds (default: 3600)

### Environment Variables
You can also use environment variables (they override config file):
- `AGENTPM_AGENT_URL`
- `AGENTPM_AGENT_API_KEY`
- `AGENTPM_APPROVAL_MODE`
- `AGENTPM_VERBOSE`

## Examples

### Creating a PRD
```bash
# Interactive approach
agentpm
AgentPM> Help me create a PRD for a SaaS analytics dashboard for small businesses

# Direct command approach  
agentpm "Create a comprehensive PRD for a project management tool"

# Using templates
AgentPM> /templates
AgentPM> /template saas-product
AgentPM> /create-prd analytics dashboard
```

### Brainstorming Features
```bash
AgentPM> /brainstorm improve user onboarding
AgentPM> Brainstorm ways to increase user retention for our mobile app
```

### Getting Coaching
```bash
AgentPM> /coach
AgentPM> Review my PRD and suggest improvements
AgentPM> How can I better define success metrics for this feature?
```

## Architecture

AgentPM uses a **client-server architecture**:

- **CLI Client** (this): Lightweight terminal interface (~67KB)
- **AgentPRD Agent**: Cloud-based AI agent with all the intelligence
- **Multi-channel Ready**: Same agent works with email, Slack, Discord

The CLI is just one interface to the powerful AgentPRD cloud agent. Your conversations and context are stored in the cloud and accessible from any channel.

## Development

### Build & Test
```bash
bun install              # Install dependencies
bun run dev              # Run in development mode
bun run build            # Build production binary
bun run dist/cli.js      # Test built binary
```

### Project Structure
```
src/
├── cli.ts              # Main CLI entry point
├── repl/              # Interactive REPL implementation
├── commands/          # Command handlers
├── client/            # AgentPRD communication
└── utils/             # Utilities (config, output, errors)
```

## Roadmap

### Phase 1: Foundation ✅
- [x] Basic CLI with Commander.js
- [x] Interactive REPL with Inquirer.js
- [x] Short command parsing
- [x] Configuration management
- [x] Agent client framework

### Phase 2: Core Features (In Progress)
- [ ] Real AgentPRD integration
- [ ] Streaming AI responses
- [ ] File operations with approval
- [ ] Template management
- [ ] Export functionality

### Phase 3: Advanced Features
- [ ] Offline capabilities
- [ ] Advanced coaching
- [ ] Cross-industry inspiration
- [ ] Team collaboration

## Support

For issues and questions:
1. Check the built-in help: `agentpm --help`
2. View configuration: `agentpm config list`
3. Enable verbose logging: `agentpm config set verbose true`

---

**AgentPM CLI v0.1.0** - Built with ❤️ using Bun, TypeScript, and the Agentuity platform.
