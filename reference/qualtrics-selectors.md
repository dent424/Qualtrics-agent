# Qualtrics DOM Selectors & Question Types

Quick reference for automating Qualtrics surveys with Playwright.

## ⚠️ Critical Qualtrics Quirks

### Two Different Front-Ends (CRITICAL!)

**Qualtrics has TWO completely different survey layouts with DIFFERENT selectors:**

1. **Classic Layout** - Traditional Qualtrics (Flat theme, most common)
2. **New Survey Experience (NSE)** - Also called "Simple Layout" (React-based)

**You MUST detect which layout is being used** - selectors are incompatible!

**Key Differences:**

| Element | Classic Layout | NSE/Simple Layout |
|---------|---------------|-------------------|
| Next Button | `#NextButton` | `#next-button` |
| Previous Button | `#PreviousButton` | `#previous-button` |
| Question ID | `#QID1` | `#question-QID1` |
| Text Input | `.InputText` | `.text-input` |
| Dropdowns | `<select>` element | Custom component (NOT `<select>`) |
| jQuery | Included | Must load manually |
| Click Target | Input element | Label element |

**Layout Detection:**

```typescript
async function detectLayout(page: Page): Promise<'classic' | 'nse'> {
  // NSE uses #next-button, Classic uses #NextButton
  const nseButton = await page.locator('#next-button').count();
  if (nseButton > 0) return 'nse';

  const classicButton = await page.locator('#NextButton').count();
  if (classicButton > 0) return 'classic';

  // Fallback: check question ID format
  const nseQuestion = await page.locator('[id^="question-QID"]').count();
  return nseQuestion > 0 ? 'nse' : 'classic';
}
```

**Sources:**
- [Simple Layout No jQuery](https://community.qualtrics.com/custom-code-12/simple-layout-no-jquery-24301)
- [Moving Next Button NSE](https://community.qualtrics.com/custom-code-12/moving-next-button-to-the-top-of-survey-new-survey-experience-31733)
- [New Survey Taking Experience](https://www.qualtrics.com/support/survey-platform/survey-module/look-feel/simple-layout/)

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

**Navigation Buttons:**

```typescript
// Classic Layout
const nextButton = page.locator('#NextButton');
const prevButton = page.locator('#PreviousButton');

// NSE/Simple Layout
const nextButton = page.locator('#next-button');
const prevButton = page.locator('#previous-button');

// Universal fallback (works for both)
const nextButton = page.getByRole('button', { name: /next|submit/i });
const prevButton = page.getByRole('button', { name: /previous|back/i });
```

**Note:** There is NO `#SubmitButton` - only `#NextButton` (Classic) or `#next-button` (NSE) exists. The text changes to "Submit" on the last page but the ID stays the same.

**Source:** [Change Next Button to Submit](https://community.qualtrics.com/survey-platform-before-march-2021-56/change-next-forward-button-on-final-page-to-submit-finish-etc-390)

**Question Elements:**

```typescript
// These work in BOTH Classic and NSE layouts
const questionContainer = page.locator('.QuestionOuter');
const questionText = page.locator('.QuestionText');
const questionBody = page.locator('.QuestionBody');

// Targeting specific questions by ID
// Classic: #QID1, #QID2, etc.
const classicQuestion = page.locator('#QID1');

// NSE: #question-QID1, #question-QID2, etc.
const nseQuestion = page.locator('#question-QID1');
```

**Source:** [CSS Classes for Questions](https://community.qualtrics.com/custom-code-12/css-classes-for-questions-apply-css-style-to-some-questions-only-2587)

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

**Note:** In NSE, clicking the label (not the radio button directly) is more reliable.

### 2. Multiple Choice (Checkboxes)

**Playwright Code:**
```typescript
const checkboxes = await page.locator('input[type="checkbox"]').all();
for (const index of selectedIndices) {
  await checkboxes[index].check();
}
```

**Note:** In NSE, click events fire on the label/span, not the checkbox itself.

**Source:** [Simple Layout JavaScript](https://community.qualtrics.com/custom-code-12/simple-layout-javascript-to-autoadvance-on-a-single-question-nps-26666)

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

**⚠️ CRITICAL:** Qualtrics uses different classes depending on layout and context!

```typescript
async function fillTextEntry(page: Page, text: string) {
  // Try all possible text entry selectors in order

  // Option 1: Classic - Standalone Text Entry
  let input = await page.locator('.InputText').count();
  if (input > 0) {
    await page.locator('.InputText').first().fill(text);
    return;
  }

  // Option 2: NSE/Simple Layout
  input = await page.locator('.text-input').count();
  if (input > 0) {
    await page.locator('.text-input').first().fill(text);
    return;
  }

  // Option 3: Multiple Choice with "Allow Text Entry"
  input = await page.locator('.TextEntryBox').count();
  if (input > 0) {
    await page.locator('.TextEntryBox').first().fill(text);
    return;
  }

  // Option 4: Generic fallback
  input = await page.locator('input[type="text"]').count();
  if (input > 0) {
    await page.locator('input[type="text"]').first().fill(text);
    return;
  }

  console.log("❌ No text entry found!");
}
```

**Why multiple classes?**
- `.InputText` = Classic layout, standalone "Text Entry" question
- `.text-input` = NSE/Simple Layout text inputs
- `.TextEntryBox` = Multiple Choice question with "Allow text entry" enabled (both layouts)

**Sources:**
- [Fixing Text Entry Behavior](https://medium.com/@mc_bloomfield/fixing-the-qualtrics-modern-themes-text-entry-behavior-9ebaa4b91479)
- [Simple Layout Replicate Text Input](https://community.qualtrics.com/custom-code-12/simple-layout-replicate-the-text-input-of-a-text-entry-question-to-a-hidden-text-entry-question-27829)

### 6. Text Entry (Long Answer/Essay)

```typescript
// Textarea (works in both layouts)
await page.locator('textarea').fill(longText);

// Alternative with Qualtrics class
await page.locator('textarea.TextEntryBox').fill(longText);
```

### 7. Dropdown/Select

**⚠️ CRITICAL:** NSE does NOT use `<select>` elements!

```typescript
async function fillDropdown(page: Page, value: string) {
  // Classic Layout: Standard <select> element
  const classicSelect = await page.locator('select').count();
  if (classicSelect > 0) {
    await page.locator('select').selectOption(value);
    return;
  }

  // NSE: Custom component (NOT a <select>)
  // May need to click to open dropdown, then click option
  // Exact selector depends on Qualtrics version
  console.log("⚠️ NSE dropdown detected - may require custom handling");
}
```

**Sources:**
- [Can I set up type-search-and-select](https://community.qualtrics.com/custom-code-12/can-i-set-up-a-type-search-and-select-choice-question-in-qualtrics-26390)
- [How to add drop down menu](https://community.qualtrics.com/survey-platform-before-march-2021-56/how-to-add-a-drop-down-menu-within-a-multiple-choice-question-3784)

### 8. Rank Order (Drag & Drop)

**⚠️ Requires drag-and-drop automation:**

```typescript
// Get draggable items
const items = await page.locator('.rank-item').all(); // Example selector

// Drag to reorder (requires Playwright drag-and-drop API)
await page.dragAndDrop('.rank-item:nth-child(1)', '.rank-item:nth-child(3)');
```

**Note:** Drag-and-drop automation is complex. Consider using keyboard navigation if supported.

**Sources:**
- [Rank Order Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/standard-content/rank-order/)
- [Drag and Drop Ranking](https://community.qualtrics.com/custom-code-12/showing-numbers-on-drag-and-drop-rank-order-question-answers-before-dragging-16434)

### 9. Constant Sum

**Allows respondents to distribute points across options:**

```typescript
// Text inputs for each option
const sumInputs = await page.locator('.SumInput input').all();

// Fill each with a value
await sumInputs[0].fill('30');
await sumInputs[1].fill('50');
await sumInputs[2].fill('20');

// Total should equal constraint (e.g., 100)
```

**Sources:**
- [Constant Sum Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/specialty-questions/constant-sum/)
- [Formatting Constant Sum](https://community.qualtrics.com/custom-code-12/formatting-the-constant-sum-question-26454)

### 10. Side-by-Side

**Multiple questions presented in a table format:**

```typescript
// QuestionType: "SBS", Selector: "SBSMatrix"
// Element IDs follow pattern: "QR~QID29#2~3~1~TEXT"

// Access cells by table structure
const rows = await page.locator('table tbody tr').all();

for (const row of rows) {
  const inputs = await row.locator('input').all();
  // Fill or select based on input type
}
```

**Sources:**
- [Side by Side Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/standard-content/side-by-side/)
- [SBS Question Custom Validation](https://community.qualtrics.com/survey-platform-54/side-by-side-question-custom-validation-23244)

## Question Type Detection

**Comprehensive detection with layout awareness:**

```typescript
async function detectQuestionType(page: Page): Promise<string> {
  // Check for matrix (TWO possible classes!)
  if (await page.locator('table.Matrix').count() > 0) return 'matrix';
  if (await page.locator('table.ChoiceStructure').count() > 0) return 'matrix';

  // Check for slider (TWO possible selectors!)
  if (await page.locator('input[type="range"]').count() > 0) return 'slider';
  if (await page.locator('.ResultsInput').count() > 0) return 'slider';

  // Check for dropdown
  if (await page.locator('select').count() > 0) return 'dropdown';

  // Check for textarea
  if (await page.locator('textarea').count() > 0) return 'text-long';

  // Check for text input (multiple possible classes!)
  if (await page.locator('.InputText').count() > 0) return 'text-short';
  if (await page.locator('.text-input').count() > 0) return 'text-short';
  if (await page.locator('.TextEntryBox').count() > 0) return 'text-short';

  // Check for constant sum
  if (await page.locator('.SumInput').count() > 0) return 'constant-sum';

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
async function clickNextAndWait(page: Page, layout: 'classic' | 'nse' = 'classic') {
  // Click Next button (layout-aware)
  if (layout === 'nse') {
    await page.locator('#next-button').click();
  } else {
    await page.locator('#NextButton').click();
  }

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

### 1. Detect Layout First

```typescript
// ALWAYS detect layout before automation
const layout = await detectLayout(page);
console.log(`Survey layout: ${layout}`);

// Use layout-specific selectors
const nextButton = layout === 'nse' ? '#next-button' : '#NextButton';
```

### 2. Always Use Fallback Selectors

```typescript
// ✅ GOOD - tries multiple selectors
const selectors = layout === 'nse'
  ? ['.text-input', '.TextEntryBox', 'input[type="text"]']
  : ['.InputText', '.TextEntryBox', 'input[type="text"]'];

for (const sel of selectors) {
  if (await page.locator(sel).count() > 0) {
    await page.locator(sel).fill(text);
    break;
  }
}
```

### 3. Wait for Transitions

```typescript
// ✅ GOOD - waits for DOM to stabilize
await page.locator('#NextButton').click();
await page.waitForLoadState('networkidle');
await page.locator('.QuestionText').waitFor({ state: 'visible' });
```

### 4. Use Generous Timeouts

```typescript
// ✅ GOOD - Qualtrics can be slow
await page.locator('.QuestionText').waitFor({
  state: 'visible',
  timeout: 10000  // 10 seconds
});
```

### 5. Target by Question ID When Possible

```typescript
// More robust than generic selectors
const layout = await detectLayout(page);
const questionId = layout === 'nse' ? '#question-QID1' : '#QID1';

const questionText = await page.locator(`${questionId} .QuestionText`).textContent();
const inputs = await page.locator(`${questionId} input[type="radio"]`).all();
```

## Coverage Summary

| Question Type | Classic Support | NSE Support | Notes |
|--------------|----------------|-------------|-------|
| Single Choice (Radio) | ✅ Full | ✅ Full | Click label in NSE |
| Multiple Choice (Checkbox) | ✅ Full | ✅ Full | Click label in NSE |
| Matrix/Likert | ✅ Full | ✅ Full | Two table classes |
| Slider | ✅ Full | ✅ Full | Two selector types |
| Text Entry (Short) | ✅ Full | ✅ Full | Different classes |
| Text Entry (Long) | ✅ Full | ✅ Full | Textarea in both |
| Dropdown/Select | ✅ Full | ⚠️ Partial | NSE uses custom component |
| Rank Order | ⚠️ Partial | ⚠️ Partial | Requires drag-drop |
| Constant Sum | ✅ Full | ✅ Full | Standard inputs |
| Side-by-Side | ⚠️ Partial | ⚠️ Partial | Complex structure |

## Sources

**Core Documentation:**
- [JavaScript & Qualtrics: Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)
- [JavaScript Form Engine](https://medium.com/@mc_bloomfield/javascript-and-qualtrics-getting-started-34f113cbeaaa)
- [Fixing Text Entry Behavior](https://medium.com/@mc_bloomfield/fixing-the-qualtrics-modern-themes-text-entry-behavior-9ebaa4b91479)

**NSE/Simple Layout:**
- [New Survey Taking Experience](https://www.qualtrics.com/support/survey-platform/survey-module/look-feel/simple-layout/)
- [Simple Layout No jQuery](https://community.qualtrics.com/custom-code-12/simple-layout-no-jquery-24301)
- [Moving Next Button NSE](https://community.qualtrics.com/custom-code-12/moving-next-button-to-the-top-of-survey-new-survey-experience-31733)

**Selectors:**
- [CSS Classes for Questions](https://community.qualtrics.com/custom-code-12/css-classes-for-questions-apply-css-style-to-some-questions-only-2587)
- [Matrix Table Structure](https://community.qualtrics.com/custom-code-12/narrow-matrix-table-11205)
- [Next Button Customization](https://community.qualtrics.com/survey-platform-before-march-2021-56/change-next-forward-button-on-final-page-to-submit-finish-etc-390)

**Question Types:**
- [Extract Slider Value](https://community.qualtrics.com/custom-code-12/extract-slider-question-value-and-manipulate-using-javascript-7272)
- [Custom Sliders Guide](https://rpubs.com/john-henry/custom-qualtrics-sliders)
- [Rank Order Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/standard-content/rank-order/)
- [Constant Sum Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/specialty-questions/constant-sum/)
- [Side by Side Question](https://www.qualtrics.com/support/survey-platform/survey-module/editing-questions/question-types-guide/standard-content/side-by-side/)
