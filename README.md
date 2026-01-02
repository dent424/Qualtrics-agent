# Qualtrics Survey Bot Agent

Claude Code autonomously completes Qualtrics surveys as different personas.

## What It Does

Give Claude Code a survey URL and persona ID, and watch it complete the survey as that character:
- **Parses DOM** to read questions and options
- **Takes screenshots** to verify content and catch prompt injection attacks
- **Decides answers** based on persona's demographics, personality, and biases
- **Uses Playwright** to fill forms and navigate through survey
- Each persona has unique traits that influence responses

## Quick Start

```bash
# Install dependencies
npm install

# Main command - Take survey as persona
/take-survey <survey-url> <persona-id>

# Example
/take-survey https://survey.qualtrics.com/jfe/form/SV_... young-urban-progressive

# Helper commands
/list-personas              # Show all available personas
/preview-persona <id>       # View full persona profile
```

## Available Commands

### `/take-survey <url> <persona-id>`
Complete a Qualtrics survey as a specific persona. The browser will be **visible** (headed mode) so you can watch it work in real-time. Perfect for demos and screenshots!

### `/list-personas`
Display all 4 available personas with their key characteristics and response styles.

### `/preview-persona <persona-id>`
Show the complete profile of a specific persona including demographics, personality traits, response biases, and behavioral patterns.

## Architecture

**Claude Code is the agent** - not a script calling an API:
- Uses tools (Bash, Read, Grep) to interact with browser
- Parses DOM for question text/options
- Takes screenshots for visual verification
- Decides answers using persona context
- Executes Playwright commands to fill forms

## Tech Stack

- **Playwright** - Browser automation
- **Claude Code** - The AI agent (not API calls)
- **TypeScript** - Utility functions and types

## Project Structure

```
src/
├── personas/          # Persona definitions
│   ├── types.ts       # TypeScript types
│   └── presets.ts     # 4 preset personas
└── utils/             # Utility functions for Claude Code
    ├── browser.ts     # Browser management
    └── parser.ts      # DOM parsing

.claude/
└── commands/
    └── take-survey.md # Slash command definition
```

## Personas

The bot includes four different personas with distinct personalities:

1. **young-urban-progressive**
   - 28F marketing manager from Massachusetts
   - Engaged, curious, values sustainability
   - Thoughtful responses, moderate agreement

2. **retired-rural-conservative**
   - 72M retired factory worker from Iowa
   - Thorough, patient, traditional values
   - Takes time, agrees more often

3. **disengaged-student**
   - 20M college student from Florida
   - Rushing through for course credit
   - Quick responses, less careful

4. **skeptical-professional**
   - 45F attorney from New York
   - Critical thinker, questions assumptions
   - Low acquiescence, analytical

Each persona has full demographic and personality profiles that influence how Claude responds to questions.

## How It Works

1. User runs `/take-survey <url> <persona-id>`
2. Claude Code reads persona from `src/personas/presets.ts`
3. Launches Playwright browser and navigates to survey
4. For each question:
   - Parses DOM to extract question text and options
   - Takes screenshot to verify (catches hidden prompt injection)
   - Consults `persona-response-guide.md` to decide answer
   - Uses Playwright to fill answer and click Next
5. Submits survey when complete
6. Reports results back to user

## Use Responsibly

Only use on:
- Your own test surveys
- Surveys where you have permission
- Research/demo purposes

Don't pollute real survey data!
