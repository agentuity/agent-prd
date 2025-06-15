# AGENT.md - Development Guide

## Build/Test Commands
- **AgentPRD**: `cd AgentPRD && agentuity dev` (starts dev server with hot reload)
- **CLI**: `cd CLI && bun run dev` (dev mode) or `bun run build && bun run start` (production)
- **Format**: `biome format --write .` (AgentPRD only)
- **Lint**: `biome lint .` (AgentPRD only)
- **Deploy**: `agentuity deploy` (from AgentPRD directory)
- **No formal test suite**: Use interactive testing via Agentuity Console or manual CLI testing

## Architecture
- **AgentPRD/**: Agentuity agent project with TypeScript, uses `@agentuity/sdk`
- **CLI/**: Standalone CLI tool (`agentpm`) for product management, uses Commander.js
- **Both use Bun runtime** with TypeScript
- AgentPRD has agents in `src/agents/` and tools in `src/tools/`
- CLI has commands in `src/commands/` with REPL interface

## Code Style (Biome configuration)
- **Formatting**: 2-space indentation, single quotes, trailing commas (ES5), semicolons required
- **Imports**: Auto-organize imports enabled
- **Files**: Ignore `.agentuity/**` directory
- Use ES modules (`"type": "module"` in package.json)
- TypeScript with strict configuration

## Testing
- No formal test framework - use `agentuity dev` for interactive agent testing
- Manual CLI testing with `bun run dev` in CLI directory
