# OpenAI Codex CLI Research & Comparison

## Overview

This document contains research on OpenAI's Codex CLI interface and UI/UX patterns to inform the development of a similar TUI experience for our AgentPM CLI.

## Key Findings: OpenAI Codex CLI

### Architecture Overview

**Repository Structure:**
- Main project: `openai/codex` (29k stars, very active)
- Multi-language approach: TypeScript CLI (`codex-cli/`) + Rust backend (`codex-rs/`)
- Built with Node.js 22+ requirement
- Uses pnpm workspaces for monorepo management

**Core Technology Stack:**
- **UI Framework**: React + Ink (Terminal UI)
- **Runtime**: Node.js 22+
- **Language**: TypeScript
- **Build System**: pnpm workspaces
- **Platform Support**: macOS 12+, Ubuntu 20.04+, Windows 11 via WSL2

### Ink Framework Details

**What is Ink:**
- React renderer for command-line applications
- Allows building terminal UIs using familiar React patterns (components, hooks, state)
- Uses Yoga layout engine for Flexbox layouts in terminal
- CSS-like props available (color, layout, etc.)
- Full React feature support (useState, useEffect, custom hooks, etc.)

**Basic Ink Example:**
```tsx
import React, {useState, useEffect} from 'react';
import {render, Text} from 'ink';

const Counter = () => {
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return <Text color="green">{counter} tests passed</Text>;
};

render(<Counter />);
```

### Codex CLI User Experience

**Entry Points:**
1. **Interactive REPL**: `codex` - starts full interactive session
2. **Direct Commands**: `codex "explain this codebase"` - single command execution  
3. **Full Auto Mode**: `codex --approval-mode full-auto "create todo app"` - autonomous execution

**Approval Modes:**
- **Suggest** (default): Agent reads files, requires approval for all writes/commands
- **Auto Edit**: Agent can read + write files, requires approval for shell commands
- **Full Auto**: Agent can read/write files + execute commands (network-disabled, sandboxed)

**Key Features:**
- Multimodal input (text, screenshots, diagrams)
- Real-time streaming responses
- Sandboxed execution environment
- Git integration and version control awareness
- Project documentation integration (AGENTS.md files)
- Non-interactive/CI mode support
- Shell completion scripts

**Security Model:**
- Network-disabled execution in Full Auto mode
- Platform-specific sandboxing:
  - **macOS**: Apple Seatbelt (`sandbox-exec`)  
  - **Linux**: Docker containers with iptables firewall
- Directory-confined operations
- Git safety warnings for untracked directories

### UI/UX Patterns Observed

**Interactive Elements:**
- React-based terminal UI rendering via Ink
- Real-time streaming with component updates
- Approval workflows with interactive prompts
- Progress indicators and status displays
- Color-coded output and syntax highlighting

**Component Architecture:**
- Modular React components for different UI elements
- Reusable components for common patterns (spinners, progress, approval dialogs)
- State management through React hooks
- Event handling for user interactions

## Current AgentPM CLI Analysis

### Current Architecture

**Technology Stack:**
- **Runtime**: Bun 
- **Language**: TypeScript
- **UI Framework**: Traditional terminal output + @inquirer/prompts
- **Key Dependencies**:
  - `commander` - CLI argument parsing
  - `@inquirer/prompts` - Interactive prompts
  - `chalk` - Color terminal output
  - `boxen` - Terminal boxes
  - `ora` - Spinners
  - `marked` + `marked-terminal` - Markdown rendering

**Current Structure:**
```
CLI/src/
├── cli.ts                 # Main entry point with Commander.js
├── client/
│   └── agent-client.ts    # Agent communication
├── commands/
│   └── config.js          # Configuration management
├── repl/
│   ├── enhanced-repl.ts   # Current REPL implementation
│   └── slash-commands.js  # Command handling
└── utils/
    ├── output.js          # Output management
    ├── ascii-art.js       # Terminal formatting
    ├── streaming-handler.js # Response streaming
    └── enhanced-input.js  # Input helpers
```

### Current User Experience

**Entry Points:**
1. **Interactive REPL**: `agentpm` - starts REPL with enhanced features
2. **Direct Commands**: `agentpm "create a PRD for X"` - single command mode
3. **Configuration**: `agentpm config` - manage settings

**Current Features:**
- Slash command system (`/help`, `/create-prd`, `/brainstorm`, etc.)
- Streaming response handling
- Enhanced terminal formatting with ASCII art
- Color-coded output
- Export functionality
- Configuration management
- Approval mode support

**Current Limitations:**
- Traditional terminal output (not React-based)
- Limited interactive components
- Basic input handling (no real-time updates)
- Static layout (no dynamic component updates)
- No component reusability
- Limited state management

## Comparison: Codex CLI vs Current AgentPM CLI

| Aspect | OpenAI Codex CLI | Current AgentPM CLI |
|--------|------------------|---------------------|
| **UI Framework** | React + Ink (component-based) | Traditional terminal + inquirer |
| **Layout System** | Flexbox via Yoga | Line-based output |
| **Interactivity** | Real-time component updates | Static prompts |
| **State Management** | React hooks | Manual state tracking |
| **Component Reuse** | High (React components) | Low (utility functions) |
| **Dynamic Updates** | Live UI updates | Text streaming only |
| **User Input** | Rich interactive components | Basic prompts |
| **Approval Flows** | Integrated UI components | Terminal prompts |
| **Progress Indication** | React-based progress bars | ora spinners |
| **Layout Flexibility** | CSS-like Flexbox | Fixed terminal formatting |

## Ink Framework Deep Dive

### Core Concepts

**Components:**
- `<Text>` - Rendered text with styling
- `<Box>` - Layout container with Flexbox properties  
- `<Newline>` - Line breaks
- `<Spacer>` - Flexible space
- `<Static>` - Static content that doesn't rerender

**Layout Properties:**
- Flexbox: `flexDirection`, `justifyContent`, `alignItems`
- Spacing: `margin`, `padding`, `gap`
- Sizing: `width`, `height`, `minWidth`, `maxWidth`
- Colors: `color`, `backgroundColor`
- Text: `bold`, `italic`, `underline`, `strikethrough`

**Hooks:**
- `useInput()` - Handle keyboard input
- `useStdout()` - Access stdout for measurements
- `useStderr()` - Access stderr
- `useApp()` - Control app lifecycle
- `useFocus()` - Focus management

### Advanced Patterns

**Input Handling:**
```tsx
import {useInput} from 'ink';

const InputHandler = () => {
  useInput((input, key) => {
    if (key.upArrow) {
      // Handle up arrow
    }
    if (key.return) {
      // Handle enter
    }
    if (input === 'q') {
      // Handle 'q' key
    }
  });
  
  return <Text>Press keys...</Text>;
};
```

**Focus Management:**
```tsx
import {useFocus} from 'ink';

const FocusableComponent = () => {
  const {isFocused} = useFocus();
  
  return (
    <Text color={isFocused ? 'green' : 'white'}>
      {isFocused ? '> ' : '  '}Focusable item
    </Text>
  );
};
```

**Real-time Updates:**
```tsx
const StreamingResponse = ({stream}) => {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    const unsubscribe = stream.onData((chunk) => {
      setContent(prev => prev + chunk);
    });
    return unsubscribe;
  }, [stream]);
  
  return <Text>{content}</Text>;
};
```

## Implementation Recommendations

### Migration Strategy

**Phase 1: Basic Ink Setup**
- Install Ink dependencies (`ink`, `react`)
- Create basic App component with current functionality
- Replace main render loop with Ink's `render()`
- Migrate simple text output to `<Text>` components

**Phase 2: Component Migration**
- Convert current utilities to React components:
  - Spinner → Custom Ink spinner component
  - Boxen output → `<Box>` with borders
  - ASCII art → Static components
  - Progress indicators → Dynamic progress components

**Phase 3: Interactive Components**
- Build approval flow components
- Create rich input components (command palette, autocomplete)
- Implement focus management for multi-input forms
- Add real-time streaming components

**Phase 4: Advanced Features**
- Multi-pane layouts (side-by-side content)
- Scrollable content areas
- Interactive file browsers
- Live preview components

### Recommended Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── App.tsx              # Main app wrapper
│   │   ├── Layout.tsx           # Main layout container
│   │   └── StatusBar.tsx        # Bottom status bar
│   ├── input/
│   │   ├── CommandInput.tsx     # Main command input
│   │   ├── ApprovalPrompt.tsx   # Approval dialogs
│   │   └── MultiSelect.tsx      # Multi-option selection
│   ├── output/
│   │   ├── StreamingText.tsx    # Real-time text streaming
│   │   ├── CodeBlock.tsx        # Syntax-highlighted code
│   │   ├── MessageBubble.tsx    # Chat-like messages
│   │   └── ProgressIndicator.tsx # Progress bars/spinners
│   ├── navigation/
│   │   ├── CommandPalette.tsx   # Slash command interface
│   │   ├── Help.tsx             # Help system
│   │   └── History.tsx          # Command history
│   └── common/
│       ├── Box.tsx              # Reusable box component
│       ├── Button.tsx           # Interactive buttons
│       └── Spinner.tsx          # Loading indicators
├── hooks/
│   ├── useAgent.ts              # Agent communication
│   ├── useStreaming.ts          # Streaming response handling
│   ├── useApproval.ts           # Approval workflow
│   └── useCommandHistory.ts     # Command history management
└── utils/
    ├── theme.ts                 # Color and styling constants
    ├── layout.ts                # Layout utilities
    └── keyboard.ts              # Keyboard shortcut definitions
```

### Key Benefits of Migration

**Developer Experience:**
- Familiar React patterns and debugging tools
- Component reusability and composition
- Clean separation of concerns
- Better testing capabilities

**User Experience:**
- Rich interactive components
- Real-time updates without redraw
- Better visual hierarchy and layout
- Responsive design patterns
- Consistent theming

**Maintainability:**
- Modular component architecture
- Clear state management
- Easier feature additions
- Better code organization

## Examples in the Wild

**Projects Using Ink:**
- [Codex](https://github.com/openai/codex) - OpenAI's coding agent
- [Claude Code](https://github.com/anthropics/claude-code) - Anthropic's coding tool  
- [GitHub Copilot CLI](https://githubnext.com/projects/copilot-cli) - GitHub's CLI tool
- [Gatsby CLI](https://www.gatsbyjs.org) - Modern web framework CLI
- [Cloudflare Wrangler](https://github.com/cloudflare/wrangler2) - Worker CLI

## Next Steps

1. **Proof of Concept**: Create minimal Ink-based version of current REPL
2. **Component Design**: Design component hierarchy and props interfaces  
3. **Migration Plan**: Detailed step-by-step migration from current implementation
4. **Feature Parity**: Ensure all current features work in new architecture
5. **Enhancement**: Add new interactive features unique to Ink-based approach

## Conclusion

Moving to an Ink-based architecture would provide significant benefits in terms of user experience, maintainability, and future extensibility. The component-based approach aligns well with modern development practices and would make the CLI more interactive and visually appealing, similar to the polished experience of OpenAI's Codex CLI.
