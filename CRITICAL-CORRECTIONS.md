# CRITICAL CORRECTIONS - Qualtrics DOM Structure

Based on deep research of actual Qualtrics surveys, here are critical issues with our current documentation.

## 🚨 Major Issues Found

### 1. Text Entry Has TWO Different Classes

**WRONG (current docs):**
```typescript
await page.locator('input.TextEntryBox').fill(text);
```

**CORRECT:**
```typescript
// Try BOTH selectors - Qualtrics uses different classes!

// Option 1: Standalone Text Entry questions use .InputText
const textInput1 = await page.locator('.InputText').count();
if (textInput1 > 0) {
  await page.locator('.InputText').fill(text);
  return;
}

// Option 2: Multiple Choice with "Allow Text Entry" uses .TextEntryBox
const textInput2 = await page.locator('.TextEntryBox').count();
if (textInput2 > 0) {
  await page.locator('.TextEntryBox').fill(text);
  return;
}

// Fallback: Any text input
await page.locator('input[type="text"]').fill(text);
```

**Source:** [Fixing Text Entry Behavior](https://medium.com/@mc_bloomfield/fixing-the-qualtrics-modern-themes-text-entry-behavior-9ebaa4b91479)

### 2. Matrix Tables Use TWO Different Classes

**WRONG (current docs):**
```typescript
if (await page.locator('table.Matrix').count() > 0) {
  return 'matrix';
}
```

**CORRECT:**
```typescript
// Check BOTH matrix table classes!

// Option 1: table.Matrix
if (await page.locator('table.Matrix').count() > 0) {
  return 'matrix';
}

// Option 2: table.ChoiceStructure (also used for matrices!)
if (await page.locator('table.ChoiceStructure').count() > 0) {
  return 'matrix';
}
```

**Source:** [Matrix Table Selectors](https://community.qualtrics.com/custom-code-12/narrow-matrix-table-11205)

### 3. DOM Replication During Transitions

**CRITICAL ISSUE:**

Qualtrics replicates the DOM while page transitions are running. You cannot reliably select elements during transitions - you might get the old DOM or the new DOM!

**CORRECT APPROACH:**
```typescript
// After clicking Next, WAIT for transition to complete
await page.locator('#NextButton').click();

// 1. Wait for network idle (SPA transition)
await page.waitForLoadState('networkidle');

// 2. Wait for specific element to be stable
await page.locator('.QuestionText').waitFor({ state: 'visible' });

// 3. Now safe to select elements
const questionText = await page.locator('.QuestionText').textContent();
```

**Source:** [JavaScript & Qualtrics Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)

### 4. Two Survey Engines

**Background:**

Qualtrics has TWO different survey engines:

1. **Legacy SurveyEngine** - Traditional page-based surveys
2. **JavaScript Form Engine (JFE)** - Single Page Application

**Impact:**

- JFE uses AJAX to load questions (DOM changes asynchronously)
- Legacy engine does full page reloads
- Selectors are similar but timing is VERY different
- JFE requires waiting for network idle
- Legacy engine requires waiting for load event

**Detection:**
```typescript
// JFE uses SPA-style navigation
// Legacy does full page reloads

// After clicking Next:
try {
  // JFE: networkidle will resolve quickly
  await page.waitForLoadState('networkidle', { timeout: 3000 });
  console.log("Detected JFE (SPA engine)");
} catch {
  // Legacy: Full page reload
  await page.waitForLoadState('load');
  console.log("Detected Legacy engine");
}
```

**Source:** [JavaScript Form Engine](https://medium.com/@mc_bloomfield/javascript-and-qualtrics-getting-started-34f113cbeaaa)

### 5. Submit Button Doesn't Exist

**WRONG:**
```typescript
const submitButton = page.locator('#SubmitButton');
```

**CORRECT:**

Qualtrics doesn't have a separate Submit button! The `#NextButton` just changes its text to "Submit" on the last page.

```typescript
// There's ONLY #NextButton
// On last page, it might say "Submit" but ID is still #NextButton
await page.locator('#NextButton').click();

// Don't look for #SubmitButton - it doesn't exist!
```

**Source:** [Change Next Button to Submit](https://community.qualtrics.com/survey-platform-before-march-2021-56/change-next-forward-button-on-final-page-to-submit-finish-etc-390)

## Updated Selector Strategies

### Robust Text Entry Detection

```typescript
async function fillTextEntry(page: Page, text: string) {
  // Try all possible text entry selectors in order
  const selectors = [
    '.InputText',           // Standalone Text Entry questions
    '.TextEntryBox',        // MC with "Allow Text Entry"
    'input[type="text"]',   // Generic fallback
    'textarea',             // Long text entry
  ];

  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`✓ Found text entry using: ${selector}`);
      await page.locator(selector).fill(text);
      return true;
    }
  }

  console.log("❌ No text entry found!");
  return false;
}
```

### Robust Matrix Detection

```typescript
async function detectMatrix(page: Page): Promise<boolean> {
  // Check both matrix table classes
  const matrixCount = await page.locator('table.Matrix').count();
  const choiceCount = await page.locator('table.ChoiceStructure').count();

  if (matrixCount > 0) {
    console.log("✓ Found matrix using: table.Matrix");
    return true;
  }

  if (choiceCount > 0) {
    console.log("✓ Found matrix using: table.ChoiceStructure");
    return true;
  }

  return false;
}
```

### Safe Navigation Pattern

```typescript
async function clickNextAndWait(page: Page) {
  // Click Next
  await page.locator('#NextButton').click();

  // CRITICAL: Wait for transition to complete
  // Qualtrics replicates DOM during transitions!

  try {
    // Try JFE/SPA approach (most common)
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    console.log("✓ JFE transition complete");
  } catch {
    // Fallback to legacy approach
    await page.waitForLoadState('load', { timeout: 10000 });
    console.log("✓ Legacy page load complete");
  }

  // Wait for question to be visible and stable
  await page.locator('.QuestionText').waitFor({
    state: 'visible',
    timeout: 10000
  });

  console.log("✓ Next question ready");
}
```

## Summary of Required Changes

1. ❌ Remove `#SubmitButton` references - doesn't exist
2. ✅ Add `.InputText` selector for text entry
3. ✅ Add `table.ChoiceStructure` check for matrices
4. ✅ Add DOM replication warnings
5. ✅ Add proper wait strategies for transitions
6. ✅ Add fallback selector arrays for all question types

## Sources

- [JavaScript & Qualtrics: Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)
- [Fixing Text Entry Behavior](https://medium.com/@mc_bloomfield/fixing-the-qualtrics-modern-themes-text-entry-behavior-9ebaa4b91479)
- [JavaScript Form Engine Overview](https://medium.com/@mc_bloomfield/javascript-and-qualtrics-getting-started-34f113cbeaaa)
- [CSS Classes for Questions](https://community.qualtrics.com/custom-code-12/css-classes-for-questions-apply-css-style-to-some-questions-only-2587)
- [Matrix Table Structure](https://community.qualtrics.com/custom-code-12/narrow-matrix-table-11205)
- [Next Button Customization](https://community.qualtrics.com/survey-platform-before-march-2021-56/change-next-forward-button-on-final-page-to-submit-finish-etc-390)
