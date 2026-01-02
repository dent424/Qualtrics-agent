# Qualtrics DOM Selectors & Question Types

Quick reference for automating Qualtrics surveys with Playwright.

## ⚠️ Critical Qualtrics Quirks

### DOM Replication During Transitions

**IMPORTANT:** Qualtrics replicates the DOM while page transitions are running. Never select elements immediately after clicking Next!

```typescript
// ❌ WRONG - might select old DOM
await page.locator('#NextButton').click();
const question = await page.locator('.QuestionText').textContent(); // RACE CONDITION!

// ✅ CORRECT - wait for transition to complete
await page.locator('#NextButton').click();
await page.waitForLoadState('networkidle', { timeout: 10000 });
await page.locator('.QuestionText').waitFor({ state: 'visible' });
const question = await page.locator('.QuestionText').textContent(); // SAFE
```

### Two Survey Engines

Qualtrics uses two different engines:
- **JavaScript Form Engine (JFE)** - Single Page App (most common, uses AJAX)
- **Legacy SurveyEngine** - Traditional page reloads

Both use same selectors but different timing. Always wait for `networkidle` after navigation.

**Source:** [JavaScript & Qualtrics Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)

## Common DOM Structure

### Main Page Elements

```typescript
// Next button (also becomes "Submit" on last page - but ID stays #NextButton!)
page.locator('#NextButton')
page.getByRole('button', { name: /next|submit/i })

// Previous button
page.locator('#PreviousButton')

// Question container
page.locator('.QuestionOuter')

// Question text
page.locator('.QuestionText')

// Question body (contains inputs)
page.locator('.QuestionBody')
```

**Note:** There is NO `#SubmitButton` - only `#NextButton` exists. The text changes to "Submit" on the last page but the ID remains `#NextButton`.

**Source:** [Change Next Button to Submit](https://community.qualtrics.com/survey-platform-before-march-2021-56/change-next-forward-button-on-final-page-to-submit-finish-etc-390)

## Question Types

### 1. Single Choice (Radio Buttons)

**Playwright Code:**
```typescript
// Get all radio options
const radios = await page.locator('input[type="radio"]').all();
await radios[selectedIndex].check();

// Or by label
await page.getByLabel('25-34').check();
```

### 2. Multiple Choice (Checkboxes)

**Playwright Code:**
```typescript
const checkboxes = await page.locator('input[type="checkbox"]').all();
for (const index of selectedIndices) {
  await checkboxes[index].check();
}
```

### 3. Matrix/Likert Scales

**⚠️ IMPORTANT:** Qualtrics uses TWO different table classes for matrices!

**Detection:**
```typescript
// Check BOTH possible matrix classes
const isMatrix1 = await page.locator('table.Matrix').count() > 0;
const isMatrix2 = await page.locator('table.ChoiceStructure').count() > 0;

if (isMatrix1 || isMatrix2) {
  // It's a matrix question
}
```

**Playwright Code:**
```typescript
// Works with both table.Matrix and table.ChoiceStructure
const rows = await page.locator('table tbody tr').all();

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const radio = row.locator('input[type="radio"]').nth(columnIndex);
  await radio.check();
}
```

**Source:** [Matrix Table Selectors](https://community.qualtrics.com/custom-code-12/narrow-matrix-table-11205)

### 4. Slider Questions

**⚠️ TWO possible selectors:**

```typescript
// Try both selectors
async function setSlider(page: Page, value: number) {
  // Option 1: Standard HTML5 range input
  let slider = await page.locator('input[type="range"]').count();
  if (slider > 0) {
    await page.locator('input[type="range"]').fill(String(value));
    return;
  }

  // Option 2: Qualtrics .ResultsInput class
  slider = await page.locator('.ResultsInput').count();
  if (slider > 0) {
    await page.locator('.ResultsInput').fill(String(value));
    return;
  }
}
```

**Sources:**
- [Extract Slider Value](https://community.qualtrics.com/custom-code-12/extract-slider-question-value-and-manipulate-using-javascript-7272)
- [Custom Sliders Guide](https://rpubs.com/john-henry/custom-qualtrics-sliders)

### 5. Text Entry (Short Answer)

**⚠️ CRITICAL:** Qualtrics uses TWO different classes for text entry!

```typescript
async function fillTextEntry(page: Page, text: string) {
  // Try all possible text entry selectors in order

  // Option 1: Standalone Text Entry questions
  let input = await page.locator('.InputText').count();
  if (input > 0) {
    await page.locator('.InputText').fill(text);
    return;
  }

  // Option 2: Multiple Choice with "Allow Text Entry" option
  input = await page.locator('.TextEntryBox').count();
  if (input > 0) {
    await page.locator('.TextEntryBox').fill(text);
    return;
  }

  // Option 3: Generic fallback
  input = await page.locator('input[type="text"]').count();
  if (input > 0) {
    await page.locator('input[type="text"]').fill(text);
    return;
  }

  console.log("❌ No text entry found!");
}
```

**Why two classes?**
- `.InputText` = Standalone "Text Entry" question type
- `.TextEntryBox` = Multiple Choice question with "Allow text entry" enabled

**Source:** [Fixing Text Entry Behavior](https://medium.com/@mc_bloomfield/fixing-the-qualtrics-modern-themes-text-entry-behavior-9ebaa4b91479)

### 6. Text Entry (Long Answer/Essay)

```typescript
// Textarea
await page.locator('textarea').fill(longText);

// Alternative Qualtrics class
await page.locator('textarea.TextEntryBox').fill(longText);
```

## Question Type Detection

**Robust detection with fallbacks:**

```typescript
async function detectQuestionType(page: Page): Promise<string> {
  // Check for matrix (TWO possible classes!)
  if (await page.locator('table.Matrix').count() > 0) return 'matrix';
  if (await page.locator('table.ChoiceStructure').count() > 0) return 'matrix';

  // Check for slider (TWO possible selectors!)
  if (await page.locator('input[type="range"]').count() > 0) return 'slider';
  if (await page.locator('.ResultsInput').count() > 0) return 'slider';

  // Check for textarea
  if (await page.locator('textarea').count() > 0) return 'text-long';

  // Check for text input (TWO possible classes!)
  if (await page.locator('.InputText').count() > 0) return 'text-short';
  if (await page.locator('.TextEntryBox').count() > 0) return 'text-short';

  // Check for checkboxes
  if (await page.locator('input[type="checkbox"]').count() > 0) return 'multiple-choice';

  // Check for radio buttons
  if (await page.locator('input[type="radio"]').count() > 0) return 'single-choice';

  return 'unknown';
}
```

## Safe Navigation Pattern

**Always use this pattern after clicking Next:**

```typescript
async function clickNextAndWait(page: Page) {
  // Click Next button
  await page.locator('#NextButton').click();

  // CRITICAL: Wait for transition to complete
  // Qualtrics replicates DOM during transitions!
  try {
    // Try JFE/SPA approach (most common)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    // Fallback to legacy approach
    await page.waitForLoadState('load', { timeout: 10000 });
  }

  // Wait for new question to be visible and stable
  await page.locator('.QuestionText').waitFor({
    state: 'visible',
    timeout: 10000
  });

  console.log("✓ Next question ready");
}
```

## Best Practices

### 1. Always Use Fallback Selectors

```typescript
// ✅ GOOD - tries multiple selectors
const selectors = ['.InputText', '.TextEntryBox', 'input[type="text"]'];
for (const sel of selectors) {
  if (await page.locator(sel).count() > 0) {
    await page.locator(sel).fill(text);
    break;
  }
}
```

### 2. Wait for Transitions

```typescript
// ✅ GOOD - waits for DOM to stabilize
await page.locator('#NextButton').click();
await page.waitForLoadState('networkidle');
await page.locator('.QuestionText').waitFor({ state: 'visible' });
```

### 3. Use Generous Timeouts

```typescript
// ✅ GOOD - Qualtrics can be slow
await page.locator('.QuestionText').waitFor({
  state: 'visible',
  timeout: 10000  // 10 seconds
});
```

## Sources

- [JavaScript & Qualtrics: Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)
- [JavaScript Form Engine](https://medium.com/@mc_bloomfield/javascript-and-qualtrics-getting-started-34f113cbeaaa)
- [Fixing Text Entry Behavior](https://medium.com/@mc_bloomfield/fixing-the-qualtrics-modern-themes-text-entry-behavior-9ebaa4b91479)
- [CSS Classes for Questions](https://community.qualtrics.com/custom-code-12/css-classes-for-questions-apply-css-style-to-some-questions-only-2587)
- [Matrix Table Structure](https://community.qualtrics.com/custom-code-12/narrow-matrix-table-11205)
- [Next Button Customization](https://community.qualtrics.com/survey-platform-before-march-2021-56/change-next-forward-button-on-final-page-to-submit-finish-etc-390)
- [Extract Slider Value](https://community.qualtrics.com/custom-code-12/extract-slider-question-value-and-manipulate-using-javascript-7272)
- [Custom Sliders Guide](https://rpubs.com/john-henry/custom-qualtrics-sliders)
