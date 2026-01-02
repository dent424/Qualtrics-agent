# Qualtrics Survey Bot Agent

Browser automation agent for taking Qualtrics surveys, designed for bot detection research.

## Purpose

Study which behavioral signals reliably discriminate bots from humans in online survey contexts. The bot is the experimental manipulation—we vary agent behaviors systematically to identify detection-relevant features.

## Reference Documentation

Read these before implementing features in the relevant area:

- `reference/architecture.md` - Technical stack and component overview
- `reference/persona-system.md` - Synthetic respondent framework and presets
- `reference/prompt-engineering.md` - LLM prompting for response generation
- `reference/detection-signals.md` - Behavioral signals under study
- `reference/qualtrics-integration.md` - Survey platform specifics

## Tech Stack

- TypeScript
- Playwright for browser automation
- Claude API for response generation

## Key Commands

- `npm run dev` - Development mode
- `npm test` - Run tests
- `npm run lint` - Lint and format

## Project Structure

- `src/` - Source code
  - `browser/` - Playwright automation
  - `personas/` - Persona definitions and engine
  - `prompts/` - LLM prompt templates
  - `signals/` - Behavioral signal generation
- `reference/` - Project documentation (read-only)
- `tests/` - Test suites

## Code Standards

- Strict TypeScript
- All persona attributes typed
- Behavioral parameters must be configurable
- Timing distributions parameterized (not hardcoded)

## Research Questions

This tool helps investigate:

1. Which behavioral signals best discriminate LLM-powered bots from humans?
2. How do existing detection systems perform against sophisticated bots?
3. What detection methods remain robust as bot capabilities improve?

## Ethical Use

This is a research tool for studying bot detection. Should only be used on:
- Test surveys where you have explicit permission
- Research studies with proper IRB approval
- Bot detection development and validation

Do not use this tool to pollute real survey data or circumvent legitimate data collection.
