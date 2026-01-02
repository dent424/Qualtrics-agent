# Behavioral Signals

Human-like timing and interaction patterns for realistic survey completion.

## Overview

The `src/utils/behavioral.ts` module provides functions to simulate realistic human behavior:
- **Typing speed** - Variable inter-keystroke intervals (IKI)
- **Reading time** - Based on text length and persona
- **Thinking time** - Hesitation before answering
- **Click delays** - Mouse movement and interaction time
- **Hesitation patterns** - Occasionally reconsidering answers

All timings are **parameterized by persona attributes** to reflect different response styles.

## Key Functions

### Typing Delay

```typescript
getTypingDelay(persona: Persona): number
```

Returns delay in milliseconds between keystrokes.

**Factors:**
- **surveyMotivation**:
  - "rushing": ~120ms per keystroke
  - "engaged": ~180ms per keystroke
  - "thorough": ~220ms per keystroke
- **satisficing**: Higher = faster typing (up to 40% faster)
- **Variance**: ±40% natural variation

**Example:**
- Disengaged student (satisficing=0.85): ~80-140ms per keystroke
- Skeptical professional (satisficing=0.1): ~150-290ms per keystroke

### Reading Time

```typescript
getReadingTime(text: string, persona: Persona): number
```

Returns time in milliseconds to read given text.

**Base rate:** ~250ms per word (average human reading speed)

**Factors:**
- **surveyMotivation**:
  - "rushing": 150ms/word (skimming)
  - "engaged": 250ms/word
  - "thorough": 350ms/word (careful)
- **satisficing**: Higher = faster reading (up to 50% faster)
- **Variance**: ±20% natural variation

**Example:**
- 10-word question for disengaged student: ~750ms
- Same question for thorough persona: ~3500ms

### Thinking Time

```typescript
getThinkingTime(persona: Persona): number
```

Returns delay before answering (formulating response).

**Base:** ~1000ms

**Factors:**
- **surveyMotivation**:
  - "rushing": ~300ms
  - "engaged": ~1000ms
  - "thorough": ~2000ms
- **conscientiousness**: Higher = more deliberation (+60% to +130% of base)
- **satisficing**: Higher = less thinking (up to 60% reduction)
- **Variance**: ±50% natural variation

**Example:**
- Disengaged student: ~100-400ms
- Skeptical professional (conscientiousness=7): ~1800-3500ms

### Click Delay

```typescript
getClickDelay(persona: Persona): number
```

Returns time for mouse movement and clicking.

**Base:** ~350ms

**Factors:**
- **satisficing**: >0.7 reduces to ~200ms
- **Variance**: ±40%

### Next Button Delay

```typescript
getNextButtonDelay(persona: Persona): number
```

Returns delay before clicking "Next" after answering.

**Base:** ~800ms

**Factors:**
- **surveyMotivation**:
  - "rushing": ~300ms
  - "thorough": ~1500ms (may review answer)
- **satisficing**: Up to 50% reduction
- **Variance**: ±60%

### Total Question Time

```typescript
getTotalQuestionTime(questionText: string, optionsCount: number, persona: Persona): number
```

Combines all delays for complete question timing:
1. Reading question text
2. Reading options (~200ms each)
3. Thinking time
4. Click delay

**Example calculation:**
```
Question: "How satisfied are you with your job?" (7 words)
Options: 5 choices

Young urban progressive:
- Reading question: 7 * 250ms = 1750ms
- Reading options: 5 * 200ms = 1000ms
- Thinking: ~1000ms
- Click: ~350ms
Total: ~4100ms

Disengaged student (satisficing=0.85):
- Reading question: 7 * 75ms = 525ms (skimming)
- Reading options: 5 * 100ms = 500ms (quick scan)
- Thinking: ~200ms (minimal)
- Click: ~200ms
Total: ~1425ms
```

## Typing Patterns

```typescript
generateTypingPattern(text: string, persona: Persona): Array<{char: string, delay: number}>
```

Creates realistic typing sequence with:
- Variable IKI based on persona
- Longer pauses at word boundaries (+50-150ms)
- Occasional mid-sentence pauses (5% chance, +300-800ms)
- Pauses after punctuation (+100-300ms)

**Usage:**
```typescript
const pattern = generateTypingPattern("Marketing manager", persona);
// Returns: [
//   { char: 'M', delay: 165 },
//   { char: 'a', delay: 143 },
//   { char: 'r', delay: 198 },
//   ...
//   { char: ' ', delay: 312 },  // Longer at space
//   { char: 'm', delay: 156 },
//   ...
// ]
```

## Hesitation

```typescript
getHesitationProbability(persona: Persona): number
```

Probability (0-1) of reconsidering/changing answer.

**Factors:**
- **neuroticism**: Higher = more hesitation (+2% per point)
- **surveyMotivation**: "thorough" = +10%
- **satisficing**: Reduces hesitation
- **Cap**: Max 30% probability

**Usage:**
```typescript
if (Math.random() < getHesitationProbability(persona)) {
  // Change answer, add delay
  await page.waitForTimeout(1000);
}
```

## Practical Usage

### Text Input

```typescript
import { generateTypingPattern, formatDelay } from './behavioral.js';

async function fillTextInput(text: string, persona: Persona, page: Page) {
  const pattern = generateTypingPattern(text, persona);

  for (const { char, delay } of pattern) {
    await page.keyboard.type(char);
    await page.waitForTimeout(formatDelay(delay));
  }
}
```

### Single Choice Question

```typescript
import { getReadingTime, getThinkingTime, getClickDelay, getNextButtonDelay } from './behavioral.js';

async function answerSingleChoice(
  questionText: string,
  selectedIndex: number,
  persona: Persona,
  page: Page
) {
  // Read question
  const readTime = getReadingTime(questionText, persona);
  await page.waitForTimeout(formatDelay(readTime));

  // Think about answer
  const thinkTime = getThinkingTime(persona);
  await page.waitForTimeout(formatDelay(thinkTime));

  // Click answer
  const options = await page.locator('input[type="radio"]').all();
  await page.waitForTimeout(formatDelay(getClickDelay(persona)));
  await options[selectedIndex].check();

  // Delay before Next
  const nextDelay = getNextButtonDelay(persona);
  await page.waitForTimeout(formatDelay(nextDelay));
  await page.locator('#NextButton').click();
}
```

## Persona Timing Profiles

### Young Urban Progressive
- **Style**: Engaged, thoughtful
- **Reading**: ~250ms/word
- **Thinking**: ~1000ms
- **Typing**: ~180ms/keystroke
- **Total**: Moderate pace

### Retired Rural Conservative
- **Style**: Thorough, careful
- **Reading**: ~350ms/word (conscientiousness=6)
- **Thinking**: ~2000ms
- **Typing**: ~220ms/keystroke
- **Total**: Slow, deliberate

### Disengaged Student
- **Style**: Rushing (satisficing=0.85)
- **Reading**: ~75ms/word (skimming)
- **Thinking**: ~200ms (minimal)
- **Typing**: ~90ms/keystroke (fast, sloppy)
- **Total**: Very fast

### Skeptical Professional
- **Style**: Analytical (conscientiousness=7, low satisficing)
- **Reading**: ~300ms/word
- **Thinking**: ~2500ms (deliberate)
- **Typing**: ~200ms/keystroke
- **Total**: Slow, careful

## Debugging

```typescript
import { logTiming } from './behavioral.js';

const readTime = getReadingTime(questionText, persona);
logTiming('Reading question', readTime, persona);
// Output: [young-urban-progressive] Reading question: 1750ms

await page.waitForTimeout(formatDelay(readTime));
```

## Best Practices

1. **Always use formatDelay()** - Ensures positive integers for Playwright
2. **Combine timings naturally** - Don't stack all delays, some overlap
3. **Log for debugging** - Use logTiming() to verify realistic patterns
4. **Match persona** - High satisficing = fast everything, high conscientiousness = slow everything
5. **Add variance** - All functions include built-in randomness

## Anti-Detection Notes

These timings help avoid bot detection by:
- **Realistic patterns**: Matches human reading/typing speeds
- **Natural variance**: Not mechanically consistent
- **Persona-specific**: Different response styles look human
- **Context-aware**: Longer questions = longer reading time

Combined with screenshot verification, this creates a convincing human-like survey taker.
