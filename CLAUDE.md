# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### CLI-APP (Modern TUI)
- **Development**: `cd CLI-APP && bun run dev`
- **Build**: `cd CLI-APP && bun run build`
- **Start**: `cd CLI-APP && bun run start`

### AgentPRD (Cloud Agent)
- **Development**: `cd AgentPRD && agentuity dev`
- **Format**: `cd AgentPRD && biome format --write .`
- **Lint**: `cd AgentPRD && biome lint .`
- **Deploy**: `cd AgentPRD && agentuity deploy`

### CLI (Legacy)
- **Development**: `cd CLI && bun run dev`
- **Build**: `cd CLI && bun run build`

## Architecture Overview

This is an AI-powered product management suite with three main components:

1. **CLI-APP** - Modern Terminal UI (Ink.js based) that provides interactive chat interface
2. **AgentPRD** - Agentuity cloud agent that handles AI reasoning and PRD generation
3. **CLI** - Legacy CLI tool (being phased out in favor of CLI-APP)

### CLI-APP Architecture
- **React + Ink.js** framework for terminal UI components
- **Agent Communication**: HTTP client (`agent-client.ts`) connects to AgentPRD cloud agent
- **State Management**: React Context (`ChatContext`) manages conversation state
- **Streaming**: Real-time message streaming with reasoning display support
- **Configuration**: Centralized config system with environment variable support

### Key Components
- `app.tsx` - Main React app with onboarding flow
- `cli.tsx` - Commander.js CLI entry point
- `hooks/useAgent.ts` - Agent communication hook with streaming support
- `client/agent-client.ts` - HTTP client for AgentPRD communication
- `utils/slashCommands.ts` - Slash command system for CLI shortcuts
- `components/` - Reusable UI components (chat, layout, onboarding)

### Agent Integration
- Communicates with AgentPRD via HTTP POST to agent endpoint
- Supports both streaming and non-streaming responses
- Session management with conversation history
- Approval modes: suggest, auto-edit, full-auto
- Metadata parsing for enhanced responses

## Code Style

### Biome Configuration (AgentPRD)
- 2-space indentation
- Single quotes preferred
- Semicolons required
- Trailing commas (ES5 style)
- Auto-organized imports

### TypeScript Standards
- Strict mode enabled
- ES modules (`"type": "module"`)
- Comprehensive type definitions
- Interface-based type declarations

## Configuration

### Environment Variables
- `AGENTPM_AGENT_URL` - AgentPRD endpoint URL
- `AGENTPM_AGENT_API_KEY` - Authentication key
- `AGENTPM_APPROVAL_MODE` - Approval mode setting
- `AGENTPM_SHOW_REASONING` - Toggle reasoning display

### Default Agent Configuration
- Local development: `http://127.0.0.1:3500/{agentId}`
- Agent ID: `agent_6e3e7cfcfa122e1b5bfc5a930489e552`
- Default approval mode: suggest

## Slash Commands

The CLI-APP supports slash commands for shortcuts:
- `/help` - Show help overlay
- `/clear` - Clear conversation
- `/export` - Export conversation
- `/prd` - PRD management
- `/brainstorm` - Start brainstorming
- `/coach` - Get PM coaching
- `/reasoning` - Toggle reasoning display

## Testing

No formal test framework is in place. Use:
- `agentuity dev` for interactive agent testing via Agentuity Console
- `bun run dev` for manual CLI-APP testing
- Manual validation of chat flows, streaming, and agent communication