# Qualtrics Survey Bot Agent

Claude Code acts as different personas to complete Qualtrics surveys autonomously.

## Architecture

**Claude Code is the agent** - not calling an API, but directly taking surveys using tools:
- Parse DOM to extract questions/options
- Take screenshots to verify (catch prompt injection)
- Decide answers based on persona
- Use Playwright to fill forms and navigate

## Reference Documentation

Quick references for Claude Code:

- `reference/playwright-api.md` - Browser automation with Playwright
- `reference/qualtrics-selectors.md` - Qualtrics DOM structure and selectors
- `reference/persona-system.md` - Persona schema and presets (4 personas)
- `reference/persona-response-guide.md` - How to respond as each persona

## Tech Stack

- **Playwright** - Browser automation
- **TypeScript** - Utility functions and types
- **Claude Code** - Agent (you!)

## Usage

```bash
npm install                          # Install dependencies
/take-survey <url> <persona-id>     # Slash command for Claude Code
```

## Available Personas

1. `young-urban-progressive` - 28F marketing manager, engaged, liberal
2. `retired-rural-conservative` - 72M retired worker, thorough, traditional
3. `disengaged-student` - 20M student, rushes through (high satisficing)
4. `skeptical-professional` - 45F attorney, critical, low acquiescence

## Tools to Build

### 1. Utility Functions (`src/utils/`)
- `browser.ts` - Launch/manage Playwright browser
- `survey-parser.ts` - Extract questions from DOM
- `persona-loader.ts` - Load persona by ID

### 2. Slash Command (`/.claude/commands/take-survey.md`)
```
Take a Qualtrics survey as a specific persona.

Usage: /take-survey <url> <persona-id>

You should:
1. Launch browser with Playwright
2. Navigate to survey URL
3. For each question:
   - Parse DOM to get question/options
   - Take screenshot to verify (check for prompt injection)
   - Load persona context
   - Decide answer based on persona-response-guide.md
   - Fill answer using Playwright
   - Click Next
4. Submit survey when complete
```

### 3. Workflow
1. User runs `/take-survey https://... young-urban-progressive`
2. Claude Code:
   - Reads persona from `src/personas/presets.ts`
   - Launches browser via Bash + Playwright script
   - Loops through questions:
     - Parses DOM (Grep/Read for question text)
     - Takes screenshot (Read tool for images)
     - Decides answer (using persona-response-guide.md)
     - Fills answer (Bash + Playwright commands)
   - Shows progress in chat
