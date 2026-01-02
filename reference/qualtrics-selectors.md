# Qualtrics DOM Selectors & Question Types

Quick reference for automating Qualtrics surveys with Playwright.

## Common DOM Structure

Qualtrics surveys use consistent CSS classes and HTML structure:

### Main Page Elements

```typescript
// Next button
page.locator('#NextButton')
page.getByRole('button', { name: 'Next' })
page.getByRole('button', { name: /next/i })

// Previous button
page.locator('#PreviousButton')

// Submit button
page.locator('#SubmitButton')
page.getByRole('button', { name: /submit/i })

// Question container
page.locator('.QuestionOuter')

// Question text
page.locator('.QuestionText')

// Question body (contains inputs)
page.locator('.QuestionBody')
```

## Question Types

### 1. Single Choice (Radio Buttons)

**HTML Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">What is your age range?</div>
  <div class="QuestionBody">
    <fieldset>
      <div class="ChoiceStructure">
        <label>
          <input type="radio" name="QR~..." value="1">
          <span>18-24</span>
        </label>
      </div>
      <div class="ChoiceStructure">
        <label>
          <input type="radio" name="QR~..." value="2">
          <span>25-34</span>
        </label>
      </div>
    </fieldset>
  </div>
</div>
```

**Playwright Code:**
```typescript
// Get all radio options
const radios = await page.locator('input[type="radio"]').all();

// Select the 3rd option (0-indexed)
await radios[2].check();

// Or select by label text
await page.getByLabel('25-34').check();
```

### 2. Multiple Choice (Checkboxes)

**HTML Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Select all that apply:</div>
  <div class="QuestionBody">
    <fieldset>
      <div class="ChoiceStructure">
        <label>
          <input type="checkbox" name="QR~..." value="1">
          <span>Option 1</span>
        </label>
      </div>
      <div class="ChoiceStructure">
        <label>
          <input type="checkbox" name="QR~..." value="2">
          <span>Option 2</span>
        </label>
      </div>
    </fieldset>
  </div>
</div>
```

**Playwright Code:**
```typescript
// Get all checkbox options
const checkboxes = await page.locator('input[type="checkbox"]').all();

// Select multiple options (indices 0, 2, 3)
const selectedIndices = [0, 2, 3];
for (const index of selectedIndices) {
  await checkboxes[index].check();
}

// Or by label
await page.getByLabel('Option 1').check();
await page.getByLabel('Option 3').check();
```

### 3. Matrix/Likert Scale

**HTML Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Rate your agreement:</div>
  <table class="Matrix">
    <thead>
      <tr>
        <th></th>
        <th>Disagree</th>
        <th>Neutral</th>
        <th>Agree</th>
      </tr>
    </thead>
    <tbody>
      <tr data-row="1">
        <td>Statement 1</td>
        <td><input type="radio" name="QR~QID1~1" value="1"></td>
        <td><input type="radio" name="QR~QID1~1" value="2"></td>
        <td><input type="radio" name="QR~QID1~1" value="3"></td>
      </tr>
      <tr data-row="2">
        <td>Statement 2</td>
        <td><input type="radio" name="QR~QID1~2" value="1"></td>
        <td><input type="radio" name="QR~QID1~2" value="2"></td>
        <td><input type="radio" name="QR~QID1~2" value="3"></td>
      </tr>
    </tbody>
  </table>
</div>
```

**Playwright Code:**
```typescript
// Get all rows
const rows = await page.locator('table.Matrix tbody tr').all();

// For each row, select a column
// responses = [2, 1, 3] means row 1 picks col 2, row 2 picks col 1, etc.
const responses = [2, 1, 3];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const columnIndex = responses[i] - 1; // Convert to 0-indexed
  const radio = row.locator('input[type="radio"]').nth(columnIndex);
  await radio.check();
}
```

**Common CSS Classes:**
```typescript
// Matrix table
page.locator('table.Matrix')

// Matrix rows
page.locator('table.Matrix tbody tr')
page.locator('tr.ChoiceRow')

// Specific column in matrix
page.locator('td.c1')  // First column
page.locator('td.c2')  // Second column
page.locator('td.c3')  // Third column
```

### 4. Text Entry (Short Answer)

**HTML Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">What is your occupation?</div>
  <div class="QuestionBody">
    <input type="text" class="TextEntryBox">
  </div>
</div>
```

**Playwright Code:**
```typescript
// Fill text input
await page.locator('input.TextEntryBox').fill('Marketing Manager');

// Or by type
await page.locator('input[type="text"]').fill('Marketing Manager');
```

### 5. Text Entry (Long Answer/Essay)

**HTML Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Please explain:</div>
  <div class="QuestionBody">
    <textarea class="TextEntryBox"></textarea>
  </div>
</div>
```

**Playwright Code:**
```typescript
// Fill textarea
await page.locator('textarea.TextEntryBox').fill('This is a longer response...');
```

### 6. Slider

**HTML Structure:**
```html
<div class="QuestionOuter">
  <div class="QuestionText">Rate from 0-100:</div>
  <div class="QuestionBody">
    <input type="range" min="0" max="100" class="slider">
  </div>
</div>
```

**Playwright Code:**
```typescript
// Set slider value
await page.locator('input[type="range"]').fill('75');

// Or using .evaluate for more control
await page.locator('input[type="range"]').evaluate((el, value) => {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}, '75');
```

## Question Type Detection

```typescript
async function detectQuestionType(page) {
  // Check for matrix
  if (await page.locator('table.Matrix').count() > 0) {
    return 'matrix';
  }

  // Check for slider
  if (await page.locator('input[type="range"]').count() > 0) {
    return 'slider';
  }

  // Check for textarea (long text)
  if (await page.locator('textarea.TextEntryBox').count() > 0) {
    return 'text-long';
  }

  // Check for text input (short text)
  if (await page.locator('input.TextEntryBox').count() > 0) {
    return 'text-short';
  }

  // Check for checkboxes
  if (await page.locator('input[type="checkbox"]').count() > 0) {
    return 'multiple-choice';
  }

  // Check for radio buttons
  if (await page.locator('input[type="radio"]').count() > 0) {
    return 'single-choice';
  }

  return 'unknown';
}
```

## Extracting Question Data

```typescript
// Get question text
const questionText = await page.locator('.QuestionText').textContent();

// Get all option labels for single/multiple choice
const options = await page.locator('.ChoiceStructure label').allTextContents();

// Get number of options
const optionCount = await page.locator('input[type="radio"]').count();

// For matrix: get row statements
const statements = await page.locator('table.Matrix tbody tr td:first-child').allTextContents();

// For matrix: get column headers
const headers = await page.locator('table.Matrix thead th').allTextContents();
```

## Common Patterns

### Complete Single Choice Question

```typescript
// 1. Get question text
const question = await page.locator('.QuestionText').textContent();

// 2. Get options
const options = await page.locator('.ChoiceStructure label').allTextContents();

// 3. Select an option (e.g., option 2)
const radios = await page.locator('input[type="radio"]').all();
await radios[1].check();

// 4. Click Next
await page.locator('#NextButton').click();
```

### Complete Matrix Question

```typescript
// 1. Get rows
const rows = await page.locator('table.Matrix tbody tr').all();

// 2. For each row, select a random column
for (const row of rows) {
  const radios = await row.locator('input[type="radio"]').all();
  const randomIndex = Math.floor(Math.random() * radios.length);
  await radios[randomIndex].check();
}

// 3. Click Next
await page.locator('#NextButton').click();
```

## Useful CSS Selectors

```typescript
// Question container
'.QuestionOuter'

// All single choice questions
'input[type="radio"]'

// All multiple choice questions
'input[type="checkbox"]'

// All text inputs
'.TextEntryBox'
'input[type="text"]'

// All textareas
'textarea.TextEntryBox'

// Matrix tables
'table.Matrix'

// Choice labels
'.ChoiceStructure label'
'label.SingleAnswer'      // Radio button labels
'label.MultipleAnswer'    // Checkbox labels

// Radio buttons (alternative selectors)
'label.q-radio'

// Question ID (useful for targeting specific questions)
'#QID1'  // Question 1
'#QID2'  // Question 2
```

## Navigation

```typescript
// Wait for page to load
await page.waitForLoadState('networkidle');

// Wait for next button to be visible
await page.locator('#NextButton').waitFor({ state: 'visible' });

// Click next
await page.locator('#NextButton').click();

// Check if we're on the last page (Submit button appears)
const isLastPage = await page.locator('#SubmitButton').isVisible();

// Submit survey
if (isLastPage) {
  await page.locator('#SubmitButton').click();
}
```

## Best Practices

1. **Always wait for elements**: Use `waitFor()` or rely on auto-waiting
2. **Use `.count()` to check existence**: Before trying to interact
3. **Get all elements first**: Use `.all()` then iterate, don't use `.nth()` in loops
4. **Check for Next/Submit button**: To know if survey is complete
5. **Handle loading states**: Wait for `networkidle` after navigation

## Sources

- [Qualtrics CSS Classes Community Discussion](https://community.qualtrics.com/custom-code-12/is-there-a-master-list-of-all-the-question-labels-used-in-css-19933)
- [Qualtrics Question Types Documentation](https://community.qualtrics.com/survey-platform-54/)
- [JavaScript & Qualtrics Best Practices](https://medium.com/@mc_bloomfield/javascript-qualtrics-c4bf4fb93fff)
