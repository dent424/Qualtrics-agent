# Qualtrics Survey Bot Agent

Claude Code autonomously completes Qualtrics surveys as different personas.

## What It Does

Give Claude Code a survey URL and persona ID, and watch it complete the survey as that character:
- **Parses DOM** to read questions and options
- **Takes screenshots** to verify content and catch prompt injection attacks
- **Decides answers** based on persona's demographics, personality, and biases
- **Uses Playwright** to fill forms and navigate through survey
- Each persona has unique traits that influence responses

## Prerequisites

- **Node.js** 18.0.0 or higher ([download](https://nodejs.org/))
- **Claude Code** (Claude desktop app or VS Code extension)
- **Git** (to clone the repository)

## Setup (First Time)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Qualtrics-agent.git
cd Qualtrics-agent

# 2. Install dependencies (this also installs Playwright browsers automatically)
npm install

# That's it! The postinstall script handles Playwright browser installation.
```

## Quick Start

```bash
# Main command - Take survey as persona
/take-survey <survey-url> <persona-id>

# Example
/take-survey https://survey.qualtrics.com/jfe/form/SV_... young-urban-progressive

# Helper commands
/list-personas              # Show all available personas
/preview-persona <id>       # View full persona profile
```

**Note:** Commands must be run inside Claude Code (desktop app or VS Code extension), not in terminal.

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

## Troubleshooting

### "Command not found: /take-survey"

**Problem:** Slash commands not recognized

**Solutions:**
1. Make sure you're in Claude Code (desktop app or VS Code extension), not terminal
2. Verify you're in the project directory: `/home/user/Qualtrics-agent`
3. Check that `.claude/commands/` folder exists with command files

### "Playwright browser not found"

**Problem:** Chromium browser not installed

**Solutions:**
```bash
# Manually install Playwright browsers
npx playwright install chromium

# Or reinstall everything
rm -rf node_modules
npm install
```

### "Cannot find module './src/utils/behavioral.js'"

**Problem:** TypeScript files not accessible

**Solutions:**
1. The slash command will handle this - just run `/take-survey`
2. If issues persist, check that `src/utils/behavioral.ts` exists

### "Browser opens but nothing happens"

**Problem:** Possible Qualtrics-specific issue

**Solutions:**
1. Check the Qualtrics URL is correct and publicly accessible
2. Try a different survey
3. Check Claude Code console for errors
4. Take a screenshot and share with Claude Code for debugging

### "Persona not found"

**Problem:** Invalid persona ID

**Solutions:**
1. Run `/list-personas` to see valid IDs
2. Use exact ID: `young-urban-progressive`, `retired-rural-conservative`, `disengaged-student`, or `skeptical-professional`
3. IDs are case-sensitive and use hyphens

### "Node version error"

**Problem:** Node.js version too old

**Solutions:**
```bash
# Check your Node version
node --version

# Must be 18.0.0 or higher
# Update Node.js: https://nodejs.org/
```

### General Debugging

If something isn't working:
1. Check you ran `npm install` successfully
2. Verify you're inside the project directory
3. Run `/list-personas` to test if slash commands work
4. Share error messages with Claude Code for help

## Use Responsibly

Only use on:
- Your own test surveys
- Surveys where you have permission
- Research/demo purposes

Don't pollute real survey data!
