# AgentPM CLI-APP (Modern TUI)

A modern terminal user interface for AI-powered product management, built with React and Ink.

## ✨ Features

- 🎨 **Modern Terminal UI** - Built with React + Ink for enhanced user experience
- 🔧 **Real-time Tool Visibility** - Claude Code-style inline tool call streaming
- 💬 **Interactive Chat Interface** - Natural conversation with the AI agent
- 🧠 **AI Reasoning Display** - Toggle visibility of AI thinking process
- ⚡ **Real-time Streaming** - See responses as they're generated
- 🎯 **Slash Commands** - Quick actions with `/` shortcuts
- 🔐 **Approval System** - Control agent autonomy levels
- 🎮 **Keyboard Navigation** - Full keyboard control with shortcuts

## 🚀 Quick Start

### Installation

```bash
cd CLI-APP
bun install
```

### Development

```bash
bun run dev
```

### Production Build

```bash
bun run build
bun run start
```

## 💡 Usage

### Basic Commands

Start the CLI and use natural language or slash commands:

```bash
# Start interactive session
bun run dev

# In the chat:
Create a PRD for a mobile task management app
/brainstorm user retention features
/coach
/help
```

### Slash Commands

- `/create-prd` - Interactive PRD creation
- `/brainstorm` - Feature ideation
- `/coach` - PM guidance
- `/reasoning` - Toggle AI reasoning display
- `/clear` - Clear chat history
- `/help` - Show all commands
- `/export` - Export conversation
- `/context` - Manage work context
- `/prds` - List stored PRDs

### Tool Call Visibility

Watch as the agent works:

```
👤 You: Create a PRD for a task app

🔧 SET WORK CONTEXT • ⚡ Executing...
📝 title: Task Management App, description: Mobile productivity tool

🔧 STORE PRD • ✅ Completed
📤 Created: Task Management PRD (prd_1234_abcd)

🤖 Agent: I'll help you create a comprehensive PRD...
```

## 🏗️ Architecture

### Components Structure

```
src/
├── components/
│   ├── chat/           # Chat interface components
│   ├── tools/          # Tool call display components
│   ├── layout/         # App layout (status bar, etc)
│   ├── input/          # Command input handling
│   ├── approval/       # Approval dialogs
│   └── navigation/     # Help overlay, navigation
├── hooks/
│   ├── useAgent.ts     # Agent communication hook
│   ├── useApproval.ts  # Approval flow management
│   └── useKeyboard.ts  # Keyboard shortcuts
├── client/
│   └── agent-client.ts # HTTP client for AgentPRD
└── utils/
    ├── streaming.ts    # Streaming handler with tool events
    ├── slashCommands.ts # Command parsing
    └── config.ts       # Configuration management
```

### Key Technologies

- **React + Ink** - Terminal UI framework
- **TypeScript** - Type-safe development
- **Bun** - Fast JavaScript runtime
- **Commander.js** - CLI argument parsing

## 🔧 Configuration

### Environment Variables

- `AGENTPM_AGENT_URL` - Agent endpoint URL
- `AGENTPM_AGENT_API_KEY` - Authentication key
- `AGENTPM_APPROVAL_MODE` - Approval mode (suggest/auto-edit/full-auto)
- `AGENTPM_SHOW_REASONING` - Show AI reasoning (true/false)

### Config File

Configuration stored in `~/.config/agentpm/config.json`:

```json
{
  "agentUrl": "http://127.0.0.1:3500/agent_id",
  "agentApiKey": "your-api-key",
  "approvalMode": "suggest",
  "verbose": false
}
```

## 🎨 UI Features

### Message Display
- User messages with timestamps
- Agent responses with markdown rendering
- System messages for status updates
- Inline tool call indicators

### Tool Call Display
- Real-time tool execution status
- Arguments and results visibility
- Execution time tracking
- Success/failure indicators

### Interactive Elements
- Command input with history
- Approval dialogs for agent actions
- Help overlay (Ctrl+H)
- Onboarding wizard for first-time setup

## 🛠️ Development

### Code Style
- TypeScript with strict mode
- ES modules throughout
- React functional components
- Custom hooks for logic

### Testing
```bash
# Run in development mode
bun run dev

# Test specific features:
# - Tool streaming: /create-prd or /brainstorm
# - Reasoning: /reasoning to toggle
# - Help: /help or Ctrl+H
```

### Building
```bash
# Build for production
bun run build

# Output in dist/cli.js
```

## 📋 Roadmap

- [ ] File export functionality
- [ ] Multi-agent support
- [ ] Theme customization
- [ ] Plugin system
- [ ] Offline mode

## 🤝 Contributing

1. Follow existing React/TypeScript patterns
2. Use functional components with hooks
3. Maintain type safety
4. Test tool streaming thoroughly

---

Built with ❤️ using React, Ink, TypeScript, and Bun.