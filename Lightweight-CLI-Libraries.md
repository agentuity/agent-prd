# Lightweight CLI Libraries for AgentPM

## Recommended Stack (Lightweight Approach)

### 1. Commander.js - CLI Argument Parsing
**Why**: Industry standard, lightweight, excellent TypeScript support
```typescript
import { Command } from 'commander';

const program = new Command();
program
  .name('agentpm')
  .description('AI-powered product management CLI')
  .version('1.0.0');

program
  .command('create-prd')
  .description('Create a new PRD')
  .argument('<idea>', 'Product idea description')
  .option('-t, --template <template>', 'Template to use')
  .option('-i, --interactive', 'Interactive mode')
  .action(async (idea, options) => {
    // Implementation
  });
```

### 2. Inquirer.js - Interactive Prompts
**Why**: Actively maintained (recent rewrite), industry standard, excellent TypeScript support
```typescript
import { input, select, checkbox, confirm } from '@inquirer/prompts';

// Modern async/await API
const productName = await input({ 
  message: 'What is the product name?' 
});

const template = await select({
  message: 'Choose a template:',
  choices: [
    { name: 'SaaS Product', value: 'saas' },
    { name: 'Mobile App', value: 'mobile' },
    { name: 'Feature Enhancement', value: 'feature' }
  ]
});

const features = await checkbox({
  message: 'Select key features:',
  choices: [
    { name: 'Authentication', value: 'auth' },
    { name: 'Dashboard', value: 'dashboard' },
    { name: 'API', value: 'api' },
    { name: 'Mobile Support', value: 'mobile' }
  ]
});
```

### 3. Ora - Spinners and Progress
**Why**: Simple, clean progress indicators
```typescript
import ora from 'ora';

const spinner = ora('Generating PRD with AI...').start();
// AI processing
spinner.succeed('PRD generated successfully!');
```

### 4. Chalk - Terminal Colors
**Why**: Essential for good CLI UX, lightweight
```typescript
import chalk from 'chalk';

console.log(chalk.green('✓ PRD created successfully!'));
console.log(chalk.yellow('⚠ Template not found, using default'));
console.log(chalk.red('✗ Failed to connect to agent'));
```

### 5. Boxen - Bordered Boxes
**Why**: Nice formatting for important messages
```typescript
import boxen from 'boxen';

console.log(boxen('PRD Generation Complete!', {
  padding: 1,
  borderColor: 'green',
  borderStyle: 'round'
}));
```

## Alternative Considerations

### For More Advanced TUI (if needed later):
- **Blessed**: Full TUI framework but heavier
- **Ink**: React-based but more complex
- **Terminal-kit**: Comprehensive but large

### For Simple Output:
- **Console.table()**: Built-in table formatting
- **Marked-terminal**: Markdown rendering in terminal
- **cli-table3**: Simple table formatting

## Implementation Strategy

### Phase 1: Basic REPL
```typescript
// Interactive mode (like Codex CLI)
agentpm                           // Start REPL
agentpm "create a PRD for..."     // Direct command with REPL

// Within REPL
AgentPM> /create-prd mobile task app
AgentPM> /template saas
AgentPM> /export pdf
```

### Phase 2: Agent Communication
```typescript
// Real-time streaming from agent
// Short command parsing (/cmd style)
// Approval mode handling (suggest/auto-edit/full-auto)
// Session management and memory
```

### Phase 3: Enhanced Agent Features
```typescript
// File operations with approval
// Multi-channel context sharing
// Advanced coaching and feedback
// Template management and sharing
```

## Bundle Size Comparison

| Library | Size (gzipped) | Purpose |
|---------|----------------|---------|
| Commander.js | ~8KB | CLI parsing |
| @inquirer/prompts | ~35KB | Interactive prompts |
| Ora | ~12KB | Progress indicators |
| Chalk | ~4KB | Colors |
| Boxen | ~8KB | Bordered boxes |
| **Total** | **~67KB** | **Complete CLI toolkit** |

Compare to:
- Ink + React: ~200KB+
- Blessed: ~150KB+

## Benefits of This Approach

1. **Lightweight**: Small bundle size, fast startup
2. **Modular**: Can add/remove components as needed
3. **Proven**: All libraries are battle-tested
4. **TypeScript**: Excellent type support
5. **Maintainable**: Simple, well-documented APIs
6. **Flexible**: Easy to customize and extend

## Example Implementation Structure

```typescript
// src/cli/index.ts
import { Command } from 'commander';
import { createPRDCommand } from './commands/create-prd';
import { brainstormCommand } from './commands/brainstorm';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('agentpm')
  .description('AI-powered product management CLI')
  .version('1.0.0');

program.addCommand(createPRDCommand);
program.addCommand(brainstormCommand);
program.addCommand(configCommand);

program.parse();
```

```typescript
// src/cli/commands/create-prd.ts
import { Command } from 'commander';
import { prompt } from 'enquirer';
import ora from 'ora';
import chalk from 'chalk';
import { AgentClient } from '../client/agent-client';

export const createPRDCommand = new Command('create-prd')
  .description('Create a new PRD')
  .argument('<idea>', 'Product idea description')
  .option('-t, --template <template>', 'Template to use')
  .option('-i, --interactive', 'Interactive mode')
  .action(async (idea, options) => {
    const spinner = ora('Connecting to agent...').start();
    
    try {
      const client = new AgentClient();
      const result = await client.createPRD(idea, options);
      
      spinner.succeed(chalk.green('PRD created successfully!'));
      console.log(result.content);
    } catch (error) {
      spinner.fail(chalk.red('Failed to create PRD'));
      console.error(error.message);
    }
  });
```

This approach gives us a professional, lightweight CLI that can grow with the project's needs while maintaining excellent performance and user experience.
