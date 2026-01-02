# Qualtrics Survey Bot Agent

A browser automation agent for taking Qualtrics surveys using LLM-powered response generation. Designed for bot detection research.

## Purpose

This tool is designed to study which behavioral signals reliably discriminate bots from humans in online survey contexts. The bot serves as an experimental manipulation—we systematically vary agent behaviors to identify detection-relevant features.

## Research Questions

1. Which behavioral signals best discriminate LLM-powered bots from humans?
2. How do existing detection systems perform against sophisticated bots?
3. What detection methods remain robust as bot capabilities improve?

## Quick Start

### Installation

```bash
npm install
```

### Run Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Quick reference for development
- **[reference/](./reference/)** - Detailed technical documentation
  - [architecture.md](./reference/architecture.md) - System architecture and components
  - [persona-system.md](./reference/persona-system.md) - Synthetic respondent framework
  - [prompt-engineering.md](./reference/prompt-engineering.md) - LLM prompting strategy
  - [detection-signals.md](./reference/detection-signals.md) - Behavioral signals under study
  - [qualtrics-integration.md](./reference/qualtrics-integration.md) - Platform-specific details

## Tech Stack

- **TypeScript** - Type-safe development with strict mode
- **Playwright** - Browser automation (preferred over Puppeteer)
- **Claude API** - LLM-powered response generation
- **Vitest** - Fast unit testing

## Project Structure

```
qualtrics-bot-agent/
├── CLAUDE.md              # Quick reference
├── README.md              # This file
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── reference/             # Technical documentation
│   ├── architecture.md
│   ├── persona-system.md
│   ├── prompt-engineering.md
│   ├── detection-signals.md
│   └── qualtrics-integration.md
├── src/                   # Source code
│   ├── browser/           # Playwright automation
│   ├── personas/          # Persona definitions and engine
│   │   ├── types.ts       # TypeScript types
│   │   └── presets.ts     # Preset personas
│   ├── prompts/           # LLM prompt templates
│   ├── signals/           # Behavioral signal generation
│   └── index.ts           # Main entry point
└── tests/                 # Test suites
```

## Preset Personas

The system includes four preset synthetic respondents:

1. **young-urban-progressive** - Engaged millennial, 28F, marketing manager
2. **retired-rural-conservative** - Thorough senior, 72M, retired factory worker
3. **disengaged-student** - Rushing student, 20M, high satisficing (0.85)
4. **skeptical-professional** - Critical thinker, 45F, attorney, low acquiescence

See [reference/persona-system.md](./reference/persona-system.md) for full details.

## Development

### Code Standards

- Strict TypeScript with full type safety
- All persona attributes must be typed
- Behavioral parameters must be configurable (not hardcoded)
- Timing distributions must be parameterized

### Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled code
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check without emitting

## Ethical Use

This is a research tool for studying bot detection. It should **only** be used on:

- Test surveys where you have explicit permission
- Research studies with proper IRB approval
- Bot detection development and validation

**Do not use this tool to:**
- Pollute real survey data
- Circumvent legitimate data collection
- Manipulate survey results

## License

MIT

## Contributing

This is a research project. Contributions should focus on:
- Improving behavioral realism
- Adding new detection signals to study
- Enhancing persona diversity
- Better documentation
