# Error Handling Guide

Strategies for handling errors when automating Qualtrics surveys.

## Philosophy: Graceful Degradation

**For a demo/newsletter, errors are OK!** The goal is:
1. Try automation
2. If something fails → Show what happened
3. Ask user for guidance
4. Continue or abort gracefully

**Don't:**
- Try to handle every edge case perfectly
- Build complex retry logic
- Silently fail

**Do:**
- Screenshot on error
- Explain what went wrong
- Ask user how to proceed
- Show progress before failure

## Common Qualtrics Issues

### 1. Unknown Question Type

**Problem:** Qualtrics has many question formats. You might encounter one not documented.

**Detection:**
```typescript
const questionType = await detectQuestionType(page);
if (questionType === 'unknown') {
  // Handle it
}
```

**Solution:**
```typescript
// Take screenshot
await page.screenshot({ path: 'unknown-question.png' });

// Show to user
console.log("⚠️  Unknown question type encountered!");
console.log("I found a question I don't recognize.");
console.log("Screenshot saved: unknown-question.png");
console.log("\nQuestion text:", questionText);

// Ask for help
console.log("\nOptions:");
console.log("1. Skip this question (not recommended)");
console.log("2. Describe the question type and I'll try to handle it");
console.log("3. Complete this question manually and I'll continue from next");

// Wait for user input
```

**Best practice:** Take screenshot, show user, ask how to proceed

### 2. Elements Not Found

**Problem:** Next button, Submit button, or question elements missing

**Detection:**
```typescript
const nextButton = await page.locator('#NextButton').count();
if (nextButton === 0) {
  // Handle it
}
```

**Solution - Liberal Timeouts:**
```typescript
// Wait up to 10 seconds for element
try {
  await page.locator('#NextButton').waitFor({
    state: 'visible',
    timeout: 10000
  });
  await page.locator('#NextButton').click();
} catch (error) {
  // Element didn't appear
  await page.screenshot({ path: 'missing-element.png' });

  console.log("⚠️  Navigation button not found");
  console.log("Screenshot saved: missing-element.png");

  // Try alternatives
  const submitExists = await page.locator('#SubmitButton').isVisible();
  if (submitExists) {
    console.log("✓ Found Submit button instead, using that");
    await page.locator('#SubmitButton').click();
  } else {
    console.log("❌ No navigation buttons found");
    console.log("Survey may be complete, or there's an error");
    console.log("\nPlease check the screenshot");
  }
}
```

**Best practice:**
- Use generous timeouts (5-10 seconds)
- Try alternative selectors (Submit instead of Next)
- Screenshot if all fail

### 3. Captcha / Bot Detection

**Problem:** Survey may show captcha or "You appear to be a bot" message

**Detection:**
```typescript
const pageText = await page.locator('body').textContent();
if (pageText?.includes('captcha') || pageText?.includes('robot')) {
  // Handle it
}
```

**Solution:**
```typescript
await page.screenshot({ path: 'captcha-detected.png' });

console.log("🤖 Bot detection triggered!");
console.log("The survey has captcha or bot detection.");
console.log("Screenshot saved: captcha-detected.png");
console.log("\nThis is expected - we ARE a bot!");
console.log("\nOptions:");
console.log("1. This proves bot detection works (good for demo)");
console.log("2. Try a different survey without bot protection");
console.log("3. Complete captcha manually and I'll continue");
```

**Best practice:**
- Don't try to bypass captcha
- Show it as proof of detection
- Good content for newsletter ("it got caught!")

### 4. Slow Page Loads

**Problem:** Qualtrics uses heavy JavaScript, pages load slowly

**Solution:**
```typescript
// Wait for network idle before proceeding
await page.goto(surveyUrl);
await page.waitForLoadState('networkidle', { timeout: 30000 });

console.log("✓ Survey page loaded");

// Wait for question to appear
await page.locator('.QuestionText').waitFor({
  state: 'visible',
  timeout: 10000
});

console.log("✓ Question visible");
```

**Best practice:**
- Use `waitForLoadState('networkidle')` after navigation
- Wait for specific elements before interacting
- Show progress messages ("Loading...", "Question visible")

### 5. Dynamic Content / AJAX Loading

**Problem:** Questions load asynchronously, not immediately present

**Solution:**
```typescript
// After clicking Next, wait for new question
await page.locator('#NextButton').click();

// Wait for loading to finish
await page.waitForLoadState('networkidle');

// Wait for new question to appear
await page.locator('.QuestionText').waitFor({
  state: 'visible',
  timeout: 10000
});

console.log("✓ Next question loaded");
```

**Best practice:**
- Always wait for networkidle after navigation
- Wait for elements to be visible, not just present
- Use generous timeouts for slow networks

### 6. Persona Not Found

**Problem:** User provides invalid persona ID

**Solution:**
```typescript
import { getPresetPersona, getPresetPersonaIds } from './src/personas/presets.js';

const persona = getPresetPersona(personaId);

if (!persona) {
  console.log("❌ Persona not found:", personaId);
  console.log("\nAvailable personas:");
  for (const id of getPresetPersonaIds()) {
    console.log(`  - ${id}`);
  }
  console.log("\nTry: /list-personas for full details");
  process.exit(1);
}

console.log(`✓ Loaded persona: ${persona.id}`);
```

**Best practice:**
- Validate persona ID before starting
- Show available options if invalid
- Exit early to avoid wasting time

### 7. Survey Structure Variations

**Problem:** Not all Qualtrics surveys use same HTML structure

**Solution - Multiple Selector Strategies:**
```typescript
// Try multiple selectors in order of preference
async function findNextButton(page: Page) {
  // Strategy 1: Standard ID
  let button = await page.locator('#NextButton').count();
  if (button > 0) return page.locator('#NextButton');

  // Strategy 2: By text content
  button = await page.locator('button:has-text("Next")').count();
  if (button > 0) return page.locator('button:has-text("Next")');

  // Strategy 3: By class
  button = await page.locator('.NextButton').count();
  if (button > 0) return page.locator('.NextButton');

  // Strategy 4: Any button with "next" in text (case insensitive)
  button = await page.locator('button:has-text(/next/i)').count();
  if (button > 0) return page.locator('button:has-text(/next/i)');

  // Not found
  return null;
}
```

**Best practice:**
- Try multiple selector strategies
- Start with most specific, fall back to general
- Return null if nothing works, don't error immediately

## Error Handling Template

Use this pattern for each critical operation:

```typescript
try {
  // Attempt operation with timeout
  await doSomething({ timeout: 10000 });
  console.log("✓ Operation successful");

} catch (error) {
  // Screenshot the current state
  await page.screenshot({
    path: `error-${Date.now()}.png`,
    fullPage: true
  });

  // Log what went wrong
  console.log("❌ Error:", error.message);
  console.log("Screenshot saved");

  // Try alternatives
  const alternative = await tryAlternativeApproach();
  if (alternative) {
    console.log("✓ Found alternative solution");
    return alternative;
  }

  // Ask user for help
  console.log("\n🤔 I need help with this.");
  console.log("Options:");
  console.log("1. Skip and continue");
  console.log("2. Try manual intervention");
  console.log("3. Abort survey");

  // For demo purposes, often best to abort gracefully
  console.log("\n⚠️  Aborting survey to avoid errors");
  console.log("You can review the screenshot to see what happened");
  process.exit(1);
}
```

## Debugging Tips

### Enable Verbose Logging

```typescript
// Show progress for every step
console.log("→ Navigating to survey...");
console.log("→ Waiting for page load...");
console.log("→ Looking for question...");
console.log("→ Found question:", questionText);
console.log("→ Deciding answer...");
console.log("→ Selected:", selectedAnswer);
console.log("→ Clicking Next...");
```

### Save Screenshots at Each Step

```typescript
let stepNumber = 1;

async function takeStepScreenshot(page: Page, description: string) {
  await page.screenshot({
    path: `step-${stepNumber}-${description}.png`
  });
  console.log(`📸 Screenshot ${stepNumber}: ${description}`);
  stepNumber++;
}

// Use throughout
await takeStepScreenshot(page, "survey-loaded");
await takeStepScreenshot(page, "question-visible");
await takeStepScreenshot(page, "answer-selected");
await takeStepScreenshot(page, "clicked-next");
```

### Slow Down for Visibility

```typescript
// Add to launch options for easier debugging
const browser = await chromium.launch({
  headless: false,
  slowMo: 100  // 100ms delay between actions (easier to watch)
});
```

## Quick Error Recovery Checklist

When something goes wrong:

1. ✅ **Screenshot** - Capture current state
2. ✅ **Log context** - What were you trying to do?
3. ✅ **Try alternatives** - Different selectors, buttons, etc.
4. ✅ **Ask user** - Show screenshot, explain issue
5. ✅ **Graceful exit** - Don't crash, explain and exit cleanly

## For Newsletter Demo

**Embrace errors!** They make good content:

- "Here's where it got caught by bot detection" ✅
- "This survey used an unusual question format" ✅
- "Watch how it recovers when a button is missing" ✅

**Bad:**
- Silent failures ❌
- Confusing error messages ❌
- Crashing without explanation ❌

**Good:**
- Clear error messages ✅
- Screenshots showing what happened ✅
- Graceful degradation ✅
- "Hey, I tried!" attitude ✅

## Summary

**Easiest error handling approach:**

1. **Liberal timeouts** - Wait 10 seconds instead of 2
2. **Multiple selectors** - Try 3-4 ways to find elements
3. **Screenshot everything** - Especially on errors
4. **Ask for help** - Show user what went wrong
5. **Exit gracefully** - Don't crash, explain and stop

**For your newsletter:**
- Show both successes AND failures
- Failures make good content
- Proves you're being honest about capabilities
- Shows interesting challenges in automation
