# Qualtrics Survey Bot Agent

AI agent that completes Qualtrics surveys using Claude. Different personas respond with different personalities.

## Reference Documentation

Quick references for implementation:

- `reference/playwright-api.md` - Browser automation with Playwright
- `reference/claude-api.md` - Claude API for response generation
- `reference/qualtrics-selectors.md` - Qualtrics DOM structure and selectors
- `reference/persona-system.md` - Persona schema and presets
- `reference/prompt-engineering.md` - How to prompt Claude for survey responses

## Tech Stack

- **TypeScript** - Type safety
- **Playwright** - Browser automation
- **Claude API** - Response generation

## Key Commands

```bash
npm install                                              # Install dependencies
npm run demo <survey-url> <persona-id>                  # Run demo
npm run dev                                             # Development mode
```

## Available Personas

1. `young-urban-progressive` - 28F marketing manager
2. `retired-rural-conservative` - 72M retired factory worker
3. `disengaged-student` - 20M college student (rushes through)
4. `skeptical-professional` - 45F attorney (critical thinker)

## Implementation Guide

### 1. Survey Automation (`src/survey-bot.ts`)
- Launch Playwright browser
- Navigate to survey URL
- Detect question types
- Extract question text and options
- Fill answers and click Next

### 2. Response Generation
- Build prompt with persona context
- Send to Claude API
- Parse response
- Map to survey answer format

### 3. CLI (`src/demo.ts`)
- Parse command line args
- Load persona by ID
- Run survey bot
- Display progress
