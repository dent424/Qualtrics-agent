# Qualtrics Survey Bot Agent

An AI agent that completes Qualtrics surveys using Claude. Different personas respond with different personalities and styles.

## What It Does

Give it a Qualtrics survey URL and a persona, and watch Claude complete the survey as that character:
- Reads questions automatically
- Generates contextually appropriate responses
- Fills in answers and navigates through the survey
- Each persona has unique demographics, personality traits, and response styles

## Quick Start

```bash
# Install dependencies
npm install

# Set your Claude API key
export ANTHROPIC_API_KEY=your_key_here

# Run a demo
npm run demo <survey-url> <persona-id>

# Example
npm run demo https://survey.qualtrics.com/jfe/form/SV_... young-urban-progressive
```

## Tech Stack

- **Playwright** - Browser automation
- **Claude API** - Response generation
- **TypeScript** - Type safety

## Project Structure

```
src/
├── personas/          # Persona definitions
│   ├── types.ts       # TypeScript types
│   └── presets.ts     # 4 preset personas
├── survey-bot.ts      # Main automation logic
└── demo.ts            # CLI entry point
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

1. Opens survey URL in Playwright browser
2. Detects question type (single choice, multiple choice, text entry, etc.)
3. Extracts question text and options
4. Sends to Claude with persona context
5. Parses Claude's response
6. Fills in the answer
7. Clicks "Next" and repeats

## Use Responsibly

Only use on:
- Your own test surveys
- Surveys where you have permission
- Research/demo purposes

Don't pollute real survey data!
