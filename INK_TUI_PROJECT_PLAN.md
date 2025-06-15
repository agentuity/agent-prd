# AgentPM CLI to Ink TUI Migration Project Plan

## Project Overview

**Goal**: Transform the AgentPM CLI from traditional terminal output to a modern, interactive Terminal User Interface (TUI) using React + Ink, inspired by OpenAI's Codex CLI.

**Timeline**: 3-4 weeks (depending on complexity level chosen)
**Priority**: High - Will significantly improve user experience and maintainability

## Detailed Analysis of Codex CLI Components

### Key Codex CLI Components (from research)

Based on the detailed research, Codex CLI has the following key components:

1. **Core Structure**:
   - `src/cli.tsx` - Entry point using `meow` for argument parsing
   - `src/app.tsx` - Main app wrapper
   - `src/components/chat/terminal-chat.tsx` - Main chat component

2. **Chat Components**:
   - `TerminalChat` - Overall display manager (history, input, loading, overlays)
   - `TerminalChatInput` / `TerminalChatNewInput` - Input handling with history & slash commands
   - `TerminalMessageHistory` - Conversation history display
   - `TerminalChatResponseItem` - Individual message rendering
   - `TerminalChatCommandReview` - Approval workflow UI

3. **Core Features**:
   - Real-time streaming with React component updates
   - Approval workflow with interactive prompts
   - Command execution with sandbox indicators
   - File patching with diff displays
   - Multi-pane layout support

### Current AgentPM CLI Analysis

**Strengths**:
- Well-structured command system
- Good streaming implementation
- Rich terminal formatting
- Configuration management
- Slash command system

**Limitations**:
- Static text output (no real-time updates)
- Basic input handling (@inquirer/prompts)
- Limited layout flexibility
- No component reusability
- Manual state management

## Design Plan for AgentPM Ink TUI

### UI/UX Design Principles

1. **Chat-First Interface**: Main interaction is conversation-style
2. **Real-time Updates**: Streaming text with live component updates
3. **Interactive Approvals**: Visual approval flows for actions
4. **Multi-pane Layout**: Support for side-by-side content
5. **Progressive Enhancement**: Start simple, add advanced features

### Component Architecture Design

```
src/
├── app.tsx                 # Main Ink app entry point
├── cli.tsx                 # CLI argument parsing & setup
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          # Main app container
│   │   ├── ChatLayout.tsx         # Chat-specific layout
│   │   ├── StatusBar.tsx          # Bottom status/info bar
│   │   └── Header.tsx             # Top header with branding
│   ├── chat/
│   │   ├── ChatContainer.tsx      # Main chat orchestrator
│   │   ├── MessageHistory.tsx     # Scrollable message list
│   │   ├── MessageItem.tsx        # Individual message component
│   │   ├── StreamingResponse.tsx  # Real-time streaming display
│   │   ├── InputArea.tsx          # Command input with autocomplete
│   │   └── TypingIndicator.tsx    # "Agent is typing" indicator
│   ├── approval/
│   │   ├── ApprovalDialog.tsx     # Action approval interface
│   │   ├── CommandPreview.tsx     # Command preview before execution
│   │   ├── DiffViewer.tsx         # File diff display
│   │   └── ConfirmationButtons.tsx # Y/N/Edit/Always buttons
│   ├── input/
│   │   ├── CommandInput.tsx       # Enhanced input with suggestions
│   │   ├── CommandPalette.tsx     # Slash command interface
│   │   ├── AutoComplete.tsx       # Command/argument completion
│   │   └── History.tsx            # Command history navigation
│   ├── output/
│   │   ├── MarkdownRenderer.tsx   # Rich markdown display
│   │   ├── CodeBlock.tsx          # Syntax-highlighted code
│   │   ├── FileTree.tsx           # File structure display
│   │   └── ProgressBar.tsx        # Task progress indication
│   ├── navigation/
│   │   ├── Sidebar.tsx            # Optional sidebar for context
│   │   ├── Tabs.tsx               # Multi-session support
│   │   └── HelpOverlay.tsx        # Help system overlay
│   └── common/
│       ├── Box.tsx                # Reusable layout box
│       ├── Text.tsx               # Enhanced text component
│       ├── Spinner.tsx            # Loading indicators
│       ├── Button.tsx             # Interactive buttons
│       └── Modal.tsx              # Overlay modals
├── hooks/
│   ├── useAgent.ts                # Agent communication
│   ├── useStreaming.ts            # Streaming response handling
│   ├── useApproval.ts             # Approval workflow state
│   ├── useCommandHistory.ts       # Input history management
│   ├── useKeyboard.ts             # Keyboard shortcut handling
│   └── useConfig.ts               # Configuration management
├── context/
│   ├── AppContext.tsx             # Global app state
│   ├── ChatContext.tsx            # Chat session state
│   └── ThemeContext.tsx           # Theme/styling context
└── utils/
    ├── theme.ts                   # Color schemes and styling
    ├── layout.ts                  # Layout utilities
    ├── keyboard.ts                # Key binding definitions
    └── formatting.ts              # Text formatting utilities
```

### Key User Flows

#### 1. Interactive Chat Flow
```
User Input → CommandInput → [Auto-complete] → Submit
                                               ↓
Agent Processing → TypingIndicator → StreamingResponse
                                               ↓
[If Action Required] → ApprovalDialog → User Decision
                                               ↓
Final Response → MessageHistory Update → Ready for Next Input
```

#### 2. Approval Flow
```
Agent Suggests Action → CommandPreview → Show Command/Files Affected
                                              ↓
User Sees Options → [Yes/No/Edit/Always] → ConfirmationButtons
                                              ↓
Decision Made → Execute or Cancel → Update MessageHistory
```

#### 3. Streaming Response Flow
```
Agent Starts Response → Show TypingIndicator
                                    ↓
Receive Chunks → Update StreamingResponse Component in Real-time
                                    ↓
Response Complete → Move to MessageHistory → Clear Input
```

## Implementation Plan

### Phase 1: Foundation Setup (Week 1)
**Goal**: Basic Ink setup with current functionality preserved

#### Tasks:
1. **Install Dependencies**
   - [ ] Install `ink`, `react`, `@types/react`
   - [ ] Set up TypeScript configuration for React/JSX
   - [ ] Update build scripts for Ink

2. **Basic App Structure**
   - [ ] Create `app.tsx` with basic Ink render
   - [ ] Migrate CLI entry point to render Ink app
   - [ ] Create basic `AppLayout` component
   - [ ] Ensure current commands still work

3. **Simple Text Migration**
   - [ ] Convert static console.log to `<Text>` components
   - [ ] Migrate welcome message to Ink components
   - [ ] Replace chalk colors with Ink color props

#### Success Criteria:
- [x] CLI starts and renders with Ink
- [x] Basic text output working
- [x] No regression in core functionality

### Phase 2: Core Chat Interface (Week 1-2)
**Goal**: Interactive chat interface with input and message history

#### Tasks:
1. **Input System**
   - [ ] Create `CommandInput` component with `useInput` hook
   - [ ] Implement basic command submission
   - [ ] Add input history navigation (up/down arrows)
   - [ ] Support slash command detection

2. **Message Display**
   - [ ] Create `MessageHistory` component
   - [ ] Implement `MessageItem` components for user/agent messages
   - [ ] Add proper message styling and spacing
   - [ ] Support scrolling through history

3. **Basic State Management**
   - [ ] Create `ChatContext` for conversation state
   - [ ] Implement message state management
   - [ ] Handle input state and submission

#### Success Criteria:
- [x] Interactive input working
- [x] Messages display in history
- [x] Conversation state maintained

### Phase 3: Streaming & Real-time Updates (Week 2)
**Goal**: Real-time streaming responses with live component updates

#### Tasks:
1. **Streaming Display**
   - [ ] Create `StreamingResponse` component
   - [ ] Implement real-time text updates using React state
   - [ ] Add typing indicators and progress feedback
   - [ ] Handle streaming completion

2. **Enhanced Output**
   - [ ] Create `MarkdownRenderer` component using Ink
   - [ ] Implement `CodeBlock` with syntax highlighting
   - [ ] Add support for structured content (lists, headers)
   - [ ] Create reusable formatting components

3. **Agent Integration**
   - [ ] Update `AgentClient` to work with React components
   - [ ] Implement streaming callback integration
   - [ ] Add error handling for failed streams

#### Success Criteria:
- [x] Real-time streaming working
- [x] Rich content rendering
- [x] Smooth user experience

### Phase 4: Advanced Interactions (Week 2-3)
**Goal**: Approval workflows, command palette, and advanced features

#### Tasks:
1. **Approval System**
   - [ ] Create `ApprovalDialog` component
   - [ ] Implement `CommandPreview` for command review
   - [ ] Add `ConfirmationButtons` with keyboard shortcuts
   - [ ] Create `DiffViewer` for file changes

2. **Command Palette**
   - [ ] Create `CommandPalette` component
   - [ ] Implement slash command autocomplete
   - [ ] Add command suggestions and help
   - [ ] Support keyboard navigation

3. **Enhanced Input**
   - [ ] Add `AutoComplete` functionality
   - [ ] Implement smart command suggestions
   - [ ] Add parameter hints and validation
   - [ ] Support tab completion

#### Success Criteria:
- [x] Approval workflows functional
- [x] Rich command interface
- [x] Enhanced user productivity

### Phase 5: Polish & Advanced Features (Week 3-4)
**Goal**: Professional polish and advanced TUI features

#### Tasks:
1. **Layout Enhancements**
   - [ ] Implement multi-pane layout support
   - [ ] Add `Sidebar` for context/history
   - [ ] Create `StatusBar` with useful information
   - [ ] Support window resizing and responsive design

2. **Advanced Features**
   - [ ] Add `HelpOverlay` system
   - [ ] Implement session management
   - [ ] Add export functionality with better UI
   - [ ] Create configuration interface

3. **User Experience**
   - [ ] Add keyboard shortcuts and hotkeys
   - [ ] Implement focus management
   - [ ] Add accessibility features
   - [ ] Create comprehensive theming system

4. **Testing & Documentation**
   - [ ] Write component tests
   - [ ] Create user documentation
   - [ ] Add error boundaries
   - [ ] Performance optimization

#### Success Criteria:
- [x] Professional, polished interface
- [x] Advanced productivity features
- [x] Comprehensive testing and docs

## Technical Implementation Details

### Key Ink Patterns to Use

#### 1. Main App Structure
```tsx
// app.tsx
import React, {useState, useEffect} from 'react';
import {render} from 'ink';
import {AppLayout} from './components/layout/AppLayout.js';
import {ChatContext} from './context/ChatContext.js';

const App = ({initialPrompt, options}) => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  return (
    <ChatContext.Provider value={{messages, setMessages, isStreaming, setIsStreaming}}>
      <AppLayout initialPrompt={initialPrompt} options={options} />
    </ChatContext.Provider>
  );
};

export default App;
```

#### 2. Streaming Response Component
```tsx
// components/chat/StreamingResponse.tsx
import React, {useState, useEffect} from 'react';
import {Text} from 'ink';

interface StreamingResponseProps {
  stream: ReadableStream;
  onComplete: (content: string) => void;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({stream, onComplete}) => {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    const reader = stream.getReader();
    
    const processStream = async () => {
      try {
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          
          setContent(prev => prev + value);
        }
        onComplete(content);
      } catch (error) {
        console.error('Streaming error:', error);
      }
    };
    
    processStream();
  }, [stream]);
  
  return <Text>{content}</Text>;
};
```

#### 3. Input Component with History
```tsx
// components/input/CommandInput.tsx
import React, {useState} from 'react';
import {useInput} from 'ink';
import {Text, Box} from 'ink';

interface CommandInputProps {
  onSubmit: (command: string) => void;
  placeholder?: string;
}

export const CommandInput: React.FC<CommandInputProps> = ({onSubmit, placeholder}) => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  useInput((input, key) => {
    if (key.return) {
      onSubmit(input);
      setInput('');
      return;
    }
    
    if (key.upArrow) {
      // Navigate history up
      return;
    }
    
    if (key.downArrow) {
      // Navigate history down
      return;
    }
    
    if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    
    setInput(prev => prev + input);
  });
  
  return (
    <Box>
      <Text color="blue">AgentPM> </Text>
      <Text>{input}</Text>
      <Text color="gray">{input ? '' : placeholder}</Text>
    </Box>
  );
};
```

#### 4. Approval Dialog
```tsx
// components/approval/ApprovalDialog.tsx
import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useInput} from 'ink';

interface ApprovalDialogProps {
  command: string[];
  files?: string[];
  onApprove: () => void;
  onDeny: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  command, files, onApprove, onDeny
}) => {
  useInput((input) => {
    if (input.toLowerCase() === 'y') {
      onApprove();
    } else if (input.toLowerCase() === 'n') {
      onDeny();
    }
  });
  
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
      <Text color="yellow" bold>⚠️  Action Requires Approval</Text>
      <Text>Command: {command.join(' ')}</Text>
      {files && (
        <Box flexDirection="column">
          <Text>Files affected:</Text>
          {files.map(file => <Text key={file}>  • {file}</Text>)}
        </Box>
      )}
      <Text color="gray">Allow this action? (y/N)</Text>
    </Box>
  );
};
```

### Migration Strategy

#### Step-by-Step Migration Process:
1. **Parallel Development**: Build Ink components alongside existing code
2. **Feature Parity**: Ensure each Ink component matches current functionality
3. **Progressive Replacement**: Replace one component at a time
4. **Testing at Each Step**: Ensure no regression in user experience
5. **Configuration Option**: Allow users to choose old vs new interface during transition

#### Risk Mitigation:
- **Fallback Mode**: Keep current implementation as fallback
- **Feature Flags**: Use environment variables to enable/disable Ink features
- **Incremental Rollout**: Start with basic features, add advanced ones gradually
- **User Feedback**: Collect feedback early and iterate

## Success Metrics

### Technical Metrics:
- [ ] Component test coverage > 80%
- [ ] No performance regression
- [ ] Memory usage within acceptable limits
- [ ] Responsive to terminal resizing

### User Experience Metrics:
- [ ] Faster command completion with autocomplete
- [ ] Reduced error rates with approval workflows
- [ ] Improved user satisfaction (survey/feedback)
- [ ] Feature adoption rates

### Maintenance Metrics:
- [ ] Reduced bug reports related to UI issues
- [ ] Faster development of new features
- [ ] Easier onboarding for new developers
- [ ] Better code reusability

## Post-Launch Enhancement Ideas

### Future Features (Beyond Initial Scope):
1. **Multi-session Support**: Multiple concurrent agent conversations
2. **Plugin System**: Third-party component integration
3. **Collaborative Features**: Share sessions or outputs
4. **Advanced Theming**: Customizable color schemes and layouts
5. **Performance Dashboard**: Real-time metrics and usage stats
6. **Integration Features**: Export to external tools, API integration
7. **Mobile-responsive**: Support for smaller terminal sizes

### Long-term Vision:
Transform AgentPM CLI into the **gold standard** for AI-powered terminal applications, setting new benchmarks for:
- Interactive terminal user experience
- Developer productivity tools
- AI agent interfaces
- Open-source TUI applications

## Resources & References

### Documentation:
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [React Hooks Guide](https://react.dev/reference/react)
- [OpenAI Codex CLI Source](https://github.com/openai/codex)

### Similar Projects:
- [Warp Terminal](https://www.warp.dev/) - Modern terminal with blocks
- [Hyper Terminal](https://hyper.is/) - Terminal built on web technologies
- [Terminator](https://gnome-terminator.org/) - Multiple terminal layouts

### Key Libraries:
- `ink` - React for terminal applications
- `yoga-layout` - Flexbox layout engine
- `react` - Component framework
- `@types/react` - TypeScript definitions

---

## Project Tracking

This plan should be tracked using a project management tool with:
- [ ] Individual task tracking
- [ ] Sprint planning
- [ ] Progress visualization
- [ ] Risk monitoring
- [ ] User feedback collection

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Establish regular check-in schedule
5. Create feedback collection mechanism

---

*This project plan is designed to be iterative and adaptive. Adjust timelines and scope based on progress and feedback.*
