# Architecture

## Overview

The Qualtrics Survey Bot Agent is a browser automation system that completes Qualtrics surveys using LLM-powered response generation. The architecture is designed for bot detection research, with parameterized behavioral controls for systematic experimentation.

## Technology Stack

### Browser Automation: Playwright

**Why Playwright over Puppeteer:**
- More robust API with better error handling
- Built-in auto-waiting reduces flakiness
- Better support for modern web features
- Native TypeScript support
- Cross-browser testing capabilities (Chromium, Firefox, WebKit)

**Why headless browsers are required:**
- Qualtrics is JavaScript-heavy with dynamic rendering
- Survey questions load asynchronously via AJAX
- Client-side validation and logic
- Event handlers for interactions
- Cannot be automated via HTTP requests alone

### Runtime: Node.js + TypeScript

- Type safety for complex persona schemas
- Better IDE support for development
- Strict mode for catching errors early

## Core Components

### 1. Survey Parser

**Responsibility**: Extract structured data from Qualtrics survey pages

**Key functions:**
- Detect question type (single choice, multiple choice, matrix, slider, text entry, ranking)
- Extract question text and remove Qualtrics metadata
- Parse answer options with labels and values
- Identify required vs. optional fields
- Detect attention check patterns

**Implementation approach:**
- DOM queries for Qualtrics-specific selectors
- Question type classification via CSS classes and element structure
- Normalization of question formats

### 2. Persona Engine

**Responsibility**: Generate contextually appropriate responses based on synthetic respondent profiles

**Key functions:**
- Load persona definitions (demographics, psychographics, biases)
- Build LLM prompts with persona context
- Apply response biases to modify raw LLM outputs
- Maintain response consistency across survey

**Implementation approach:**
- Persona schema validation
- Prompt template rendering
- Bias application layer (post-processing LLM responses)
- Response history tracking for consistency

### 3. Response History Tracker

**Responsibility**: Maintain internal consistency across survey questions

**Key functions:**
- Store previous responses with question context
- Provide relevant history to LLM for consistency
- Detect contradictions (optional validation mode)

**Implementation approach:**
- In-memory history buffer
- Semantic similarity matching for relevant context
- Optional validation rules for logical consistency

### 4. Timing Controller

**Responsibility**: Generate realistic timing patterns for bot detection research

**Key functions:**
- Per-question-type timing distributions
- Reading time estimation (based on text length)
- Think time before responding
- Keystroke timing for text entry
- Hesitation patterns

**Implementation approach:**
- Configurable distribution parameters (mean, stddev, min, max)
- Question type → timing profile mapping
- Parameterized delay injection
- Random walk models for hesitation

**Example timing profiles:**
```typescript
{
  singleChoice: { mean: 3500, stddev: 1200, min: 1500, max: 15000 },
  multipleChoice: { mean: 5000, stddev: 1800, min: 2000, max: 20000 },
  textEntry: { mean: 8000, stddev: 3000, min: 3000, max: 45000 },
  matrix: { mean: 12000, stddev: 4000, min: 5000, max: 60000 }
}
```

### 5. Behavioral Layer

**Responsibility**: Generate human-like interaction signals

**Key functions:**
- Mouse movement trajectories (Bézier curves, noise)
- Scroll behavior (smooth scroll, momentum)
- Click patterns (slight position variance)
- Focus/blur events (tab navigation simulation)
- Viewport interactions (reading patterns)

**Implementation approach:**
- Playwright's `mouse.move()` with interpolated points
- Parameterized movement curves
- Configurable "humanness" levels
- Random micro-adjustments

## Data Flow

```
1. Load Survey URL
   ↓
2. Parse Current Question
   ↓
3. Load Persona Context + Response History
   ↓
4. Generate LLM Prompt
   ↓
5. Call Claude API → Get Response
   ↓
6. Apply Response Biases
   ↓
7. Calculate Timing Delays
   ↓
8. Execute Behavioral Actions (mouse, scroll)
   ↓
9. Submit Response
   ↓
10. Record Response to History
   ↓
11. Navigate to Next Question (repeat)
```

## Configuration System

All behavioral parameters should be externally configurable:

- Timing distribution parameters
- Mouse movement curve parameters
- Response bias weights
- Behavioral layer intensity (0-1 scale)

Configuration file format: JSON or YAML persona definitions

## Error Handling

- Graceful degradation for unrecognized question types
- Retry logic for network failures
- Screenshot capture on errors (for debugging)
- Validation of persona schemas at runtime

## Extensibility Points

- Custom question type handlers (plugin architecture)
- Alternative LLM providers (not just Claude)
- Behavioral signal generators (modular)
- Post-survey analysis hooks (data export)

## Performance Considerations

- Parallel survey execution (multiple personas)
- Rate limiting for API calls
- Browser instance pooling
- Headless vs. headed mode toggle

## Security & Ethics

- This is a research tool for studying bot detection
- Should not be used to pollute real survey data
- Use only on test surveys or with explicit permission
- Rate limiting to avoid DDoS behavior
- Watermarking responses (optional flag in data)
