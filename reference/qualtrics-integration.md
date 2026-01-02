# Qualtrics Integration

## Overview

This document covers Qualtrics-specific implementation details, including question types, DOM selectors, bot detection features, and alternative approaches.

## Qualtrics Question Types

### 1. Single Choice (Radio Buttons)

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">What is your age range?</div>
  <div class="QuestionBody">
    <fieldset>
      <div class="ChoiceStructure">
        <label>
          <input type="radio" name="QR~..." value="1">
          <span class="LabelText">18-24</span>
        </label>
      </div>
      <div class="ChoiceStructure">
        <label>
          <input type="radio" name="QR~..." value="2">
          <span class="LabelText">25-34</span>
        </label>
      </div>
      <!-- more options -->
    </fieldset>
  </div>
</div>
```

**Playwright interaction:**
```typescript
// Find all radio options
const options = await page.locator('.ChoiceStructure input[type="radio"]').all();

// Select by index
await options[selectedIndex].click();
```

### 2. Multiple Choice (Checkboxes)

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Select all that apply:</div>
  <div class="QuestionBody">
    <fieldset>
      <div class="ChoiceStructure">
        <label>
          <input type="checkbox" name="QR~..." value="1">
          <span class="LabelText">Option 1</span>
        </label>
      </div>
      <!-- more options -->
    </fieldset>
  </div>
</div>
```

**Playwright interaction:**
```typescript
// Find all checkbox options
const options = await page.locator('.ChoiceStructure input[type="checkbox"]').all();

// Select multiple (selectedIndices = [0, 2, 3])
for (const index of selectedIndices) {
  await options[index].click();
}
```

### 3. Matrix/Likert Scales

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Rate your agreement with each statement:</div>
  <table class="Matrix">
    <thead>
      <tr>
        <th></th>
        <th>Strongly Disagree</th>
        <th>Disagree</th>
        <th>Neutral</th>
        <th>Agree</th>
        <th>Strongly Agree</th>
      </tr>
    </thead>
    <tbody>
      <tr data-row="1">
        <td class="StatementText">Statement 1</td>
        <td><input type="radio" name="QR~QID1~1" value="1"></td>
        <td><input type="radio" name="QR~QID1~1" value="2"></td>
        <!-- more columns -->
      </tr>
      <tr data-row="2">
        <td class="StatementText">Statement 2</td>
        <!-- more inputs -->
      </tr>
    </tbody>
  </table>
</div>
```

**Playwright interaction:**
```typescript
// Get all statement rows
const rows = await page.locator('table.Matrix tbody tr').all();

// For each row, select a column
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const selectedColumn = responses[i]; // e.g., 3 for "Neutral"
  const radio = row.locator(`input[type="radio"]`).nth(selectedColumn);
  await radio.click();
}
```

### 4. Slider Questions

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Rate your satisfaction (0-100):</div>
  <div class="SliderContainer">
    <input type="range" min="0" max="100" value="50" class="slider">
    <div class="SliderLabels">
      <span>Not at all satisfied</span>
      <span>Extremely satisfied</span>
    </div>
  </div>
</div>
```

**Playwright interaction:**
```typescript
// Set slider value
const slider = page.locator('input.slider');
await slider.fill(String(selectedValue)); // e.g., "75"

// Alternative: Use keyboard for more realistic interaction
await slider.focus();
await slider.press('Home'); // Go to minimum
for (let i = 0; i < selectedValue; i++) {
  await slider.press('ArrowRight'); // Increment
}
```

### 5. Text Entry (Short Answer)

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">What is your occupation?</div>
  <div class="QuestionBody">
    <input type="text" class="TextEntryBox" maxlength="100">
  </div>
</div>
```

**Playwright interaction:**
```typescript
const textBox = page.locator('input.TextEntryBox');

// Type with realistic timing (simulate IKI)
await textBox.click();
for (const char of responseText) {
  await textBox.type(char);
  await page.waitForTimeout(getRandomIKI()); // 50-200ms variance
}
```

### 6. Text Entry (Long Answer/Essay)

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Please explain your reasoning:</div>
  <div class="QuestionBody">
    <textarea class="TextEntryBox" rows="5"></textarea>
  </div>
</div>
```

**Playwright interaction:**
```typescript
const textarea = page.locator('textarea.TextEntryBox');

// Type with pauses for thinking
await textarea.click();
const sentences = responseText.split('. ');
for (const sentence of sentences) {
  await typeWithIKI(textarea, sentence + '. ');
  await page.waitForTimeout(randomThinkPause()); // Longer pause between sentences
}
```

### 7. Ranking (Drag and Drop)

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Rank these items from most to least important:</div>
  <div class="RankingContainer">
    <div class="RankItem" data-item-id="1">Item 1</div>
    <div class="RankItem" data-item-id="2">Item 2</div>
    <div class="RankItem" data-item-id="3">Item 3</div>
  </div>
</div>
```

**Playwright interaction:**
```typescript
// Desired order: [3, 1, 2] (item 3 first, then 1, then 2)
const items = await page.locator('.RankItem').all();

for (let i = 0; i < desiredOrder.length; i++) {
  const itemIndex = desiredOrder[i] - 1; // Convert to 0-indexed
  const source = items[itemIndex];
  const targetPosition = i;

  // Drag to position
  await source.dragTo(items[targetPosition]);
}
```

### 8. Embedded Images/Media

**DOM Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">
    <img src="..." alt="Product image">
    <p>Based on this image, would you purchase this product?</p>
  </div>
  <div class="QuestionBody">
    <!-- Radio buttons for Yes/No -->
  </div>
</div>
```

**Handling:**
- Extract image URLs
- Optionally use vision model (Claude with image input) to analyze
- For research purposes, may use predefined responses to image types

## Qualtrics DOM Selectors (Common)

### Key Element Selectors

```typescript
const selectors = {
  // Question container
  question: '.QuestionOuter',
  questionText: '.QuestionText',
  questionBody: '.QuestionBody',

  // Single choice
  radioInput: 'input[type="radio"]',
  radioLabel: '.ChoiceStructure label',

  // Multiple choice
  checkboxInput: 'input[type="checkbox"]',
  checkboxLabel: '.ChoiceStructure label',

  // Matrix
  matrixTable: 'table.Matrix',
  matrixRow: 'table.Matrix tbody tr',
  matrixStatement: '.StatementText',

  // Slider
  sliderInput: 'input.slider, input[type="range"]',

  // Text entry
  textInput: 'input.TextEntryBox',
  textArea: 'textarea.TextEntryBox',

  // Navigation
  nextButton: '#NextButton',
  previousButton: '#PreviousButton',
  submitButton: '#SubmitButton',

  // Progress
  progressBar: '#ProgressBar',
  progressText: '.ProgressText',
};
```

### Question Type Detection

```typescript
async function detectQuestionType(questionElement: Locator): Promise<QuestionType> {
  // Check for matrix
  if (await questionElement.locator('table.Matrix').count() > 0) {
    return 'matrix';
  }

  // Check for slider
  if (await questionElement.locator('input[type="range"]').count() > 0) {
    return 'slider';
  }

  // Check for textarea
  if (await questionElement.locator('textarea').count() > 0) {
    return 'text-long';
  }

  // Check for text input
  if (await questionElement.locator('input[type="text"]').count() > 0) {
    return 'text-short';
  }

  // Check for checkboxes
  if (await questionElement.locator('input[type="checkbox"]').count() > 0) {
    return 'multiple-choice';
  }

  // Check for radio buttons
  if (await questionElement.locator('input[type="radio"]').count() > 0) {
    return 'single-choice';
  }

  return 'unknown';
}
```

## Qualtrics Bot Detection Features

### Built-in Bot Detection

Qualtrics offers several bot detection options in survey settings:

1. **RelevantID Bot Detection**
   - Third-party fraud detection service
   - Analyzes device fingerprints, IP addresses, behavioral patterns
   - Can be enabled per survey

2. **reCAPTCHA Integration**
   - Google reCAPTCHA v2 or v3
   - v2: Challenge-response (image selection)
   - v3: Invisible scoring (0.0-1.0 bot likelihood)

3. **Survey-Level Settings**
   - "Prevent ballot box stuffing" (limit responses per IP/cookie)
   - Require specific referrer URLs
   - Geographic restrictions

### Timing-Based Detection

**Question-level timing:**
- Qualtrics records time spent on each question
- Can flag responses that are too fast (e.g., < 2 seconds per question)

**Survey-level timing:**
- Total survey duration tracked
- Speeders (e.g., < 50% of median time) can be filtered

**Research approach:**
- Test various timing profiles against thresholds
- Identify minimum safe timing to avoid detection

### Attention Checks

Common attention check patterns:

1. **Instructional manipulation checks:**
   - "Please select 'Strongly Agree' to show you're reading carefully"

2. **Impossible questions:**
   - "I have visited the planet Mars"

3. **Consistency checks:**
   - Ask same question twice, expect same answer

4. **Trap questions:**
   - Nonsense options that should never be selected

### Response Pattern Detection

Qualtrics can flag:
- **Straight-lining**: All same answer in matrix questions
- **Random responding**: Inconsistent patterns detected by algorithms
- **Gibberish text**: Text entry with nonsense content

## Alternative Approaches

### 1. Qualtrics API (Direct Response Injection)

**Approach:** Use Qualtrics REST API to submit responses directly, bypassing UI.

**Pros:**
- Cleaner, more reliable
- No browser automation complexity
- Faster execution

**Cons:**
- Bypasses all interaction signals (mouse, timing, etc.)
- Easier to detect (no browser fingerprint)
- May not work for all survey types
- Less realistic for bot detection research

**Use case:** Control condition for "obvious bot" in research

**Example:**
```typescript
// Qualtrics API response submission (simplified)
fetch('https://survey.qualtrics.com/API/v3/responses', {
  method: 'POST',
  headers: {
    'X-API-TOKEN': apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    surveyId: 'SV_...',
    responses: {
      'QID1': '1',
      'QID2': 'Text response',
      // ...
    }
  })
});
```

### 2. Qualtrics "Test Survey" Feature

**Approach:** Use Qualtrics's built-in test mode for development.

**Pros:**
- Easy to access (no special links needed)
- Data clearly marked as test
- Good for development/debugging

**Cons:**
- Test responses may not trigger bot detection
- Not representative of real respondent experience

**Use case:** Development and debugging question parsing

### 3. Preview Links

**Approach:** Use Qualtrics preview links for testing.

**Pros:**
- Simulates real survey flow
- No data recorded (doesn't pollute real responses)
- Easy to regenerate

**Cons:**
- May have different bot detection settings
- Preview mode may bypass some features

**Use case:** Safe testing environment without affecting real data

### 4. Anonymous Links with Query Strings

**Approach:** Use anonymous survey links with embedded data for persona IDs.

**Example:**
```
https://survey.qualtrics.com/jfe/form/SV_...?personaId=young-urban-progressive&botVersion=v1.2
```

**Pros:**
- Track which bot/persona completed which response
- Easy to correlate data for analysis
- Can pass parameters to survey

**Cons:**
- Embedded data visible in URL
- May need to disable referrer tracking

## Best Practices

### Development Workflow

1. **Start with preview links**: Develop and debug question parsing
2. **Test with anonymous links**: Validate full survey flow
3. **Run experiments with real links**: Collect data for analysis
4. **Use API as control**: Compare against "obvious bot" baseline

### Error Handling

- **Screenshot on errors**: Capture page state for debugging
- **Retry logic**: Handle network failures, page load issues
- **Graceful degradation**: Skip unrecognized question types, log warning
- **Validation**: Check that responses were recorded (look for success page)

### Data Management

- **Session IDs**: Generate unique ID for each bot run
- **Logs**: Record all actions, timings, responses
- **Response export**: Download Qualtrics data for analysis
- **Metadata**: Track bot version, persona ID, parameters used

## Common Issues & Solutions

### Issue: Qualtrics uses dynamic IDs

**Problem:** Element IDs change between sessions

**Solution:** Use stable CSS classes or data attributes, not IDs

### Issue: AJAX question loading

**Problem:** Questions don't appear immediately

**Solution:** Use Playwright's auto-waiting or explicit waits
```typescript
await page.locator('.QuestionOuter').waitFor({ state: 'visible' });
```

### Issue: Embedded JavaScript validation

**Problem:** Qualtrics may run client-side validation before allowing next question

**Solution:** Ensure responses are valid before submitting (e.g., required fields filled)

### Issue: Progress bar delays

**Problem:** Qualtrics shows loading animation between pages

**Solution:** Wait for loading indicators to disappear
```typescript
await page.locator('.LoadingIndicator').waitFor({ state: 'hidden' });
```

## Security & Rate Limiting

- **Respect survey owner's intent**: Use only on surveys where you have permission
- **Rate limiting**: Add delays between survey attempts (e.g., 1-5 minutes)
- **IP rotation**: Consider using different IPs for large-scale experiments
- **Ethical use**: This is a research tool, not for data pollution

## Future Considerations

- **New question types**: Qualtrics regularly adds features (heat maps, conjoint, etc.)
- **Enhanced bot detection**: Qualtrics may improve detection algorithms
- **API changes**: REST API may add/deprecate endpoints
- **Third-party integrations**: Additional fraud detection services
