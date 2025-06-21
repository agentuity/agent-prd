# Changelog

All notable changes to the AI Product Management Suite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-01-17

### Added
- **Full-text search** across PRDs, notes, and contexts with the `/search` command
- **Quick notes system** with `/note` command for capturing thoughts and ideas
- **ASCII chart visualizations** including bar charts, line charts, pie charts, and Gantt charts
- **PRD diff viewer** component for tracking changes between versions
- **Interactive checklist** component with keyboard navigation for PRD completion tracking
- **Progress bar** components for visual completion status
- **Feature priority matrix** visualization (impact vs effort)
- **User journey mapping** with satisfaction tracking
- **Metrics dashboard** for KPI visualization
- New search tools: `search_prds`, `search_all`, `add_note`, `list_notes`, `get_suggestions`
- New PRD tools: `update_prd`, `get_prd_versions`, `get_prd_diff`, `add_prd_checklist`
- New visualization tools: `create_feature_priority_chart`, `create_timeline_chart`, `create_metrics_dashboard`
- Command aliases: `/s` for search, `/n` for note, `/viz` for visualize

### Changed
- Updated README with new features and commands
- Enhanced help overlay with new slash commands
- Improved TypeScript type safety with proper type assertions
- Updated project structure documentation

### Fixed
- TypeScript compilation errors with proper `unknown` type assertions
- Array bounds checking in visualization matrix generation
- `/prd show <id>` now properly retrieves and displays PRDs from the agent
- `/prd delete <id>` now properly deletes PRDs with confirmation
- `/history` command now retrieves actual history from agent storage
- All "coming soon" placeholders have been replaced with working implementations

## [0.2.0] - 2025-01-10

### Added
- Claude Code-style inline tool call visibility
- Tool execution transparency with arguments and results
- AI reasoning display toggle with `/reasoning` command
- Modern TUI built with React and Ink
- Real-time streaming support
- 7 context management tools

### Changed
- Migrated from legacy CLI to modern CLI-APP
- Improved user experience with interactive terminal UI
- Enhanced agent communication with streaming support

## [0.1.0] - 2024-12-15

### Added
- Initial release with AgentPRD cloud agent
- Basic PRD generation capabilities
- Feature brainstorming functionality
- PM coaching support
- Context management
- Agentuity platform integration