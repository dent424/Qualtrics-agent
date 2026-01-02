# Playwright API Reference

Quick reference for Playwright browser automation in TypeScript.

## Installation & Setup

```bash
npm install playwright
```

```typescript
import { chromium } from 'playwright';

// Launch browser
const browser = await chromium.launch({
  headless: false  // Set to true for headless mode
});

const page = await browser.newPage();
await page.goto('https://example.com');

// Clean up
await browser.close();
```

## Locators

Playwright uses locators to find elements. Locators auto-wait for elements to be actionable.

### Common Locator Methods

```typescript
// By role (preferred)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'I agree' })
page.getByRole('radio')

// By label text
page.getByLabel('Email address')
page.getByLabel('Password')

// By text content
page.getByText('Welcome back')
page.getByText(/sign in/i)  // Regex, case insensitive

// By CSS selector (when needed)
page.locator('.submit-button')
page.locator('#email-input')
page.locator('input[name="username"]')

// Get multiple elements
const items = await page.locator('.item').all();
for (const item of items) {
  await item.click();
}
```

## Form Interactions

### Text Input

```typescript
// Fill text input
await page.getByLabel('Email').fill('test@example.com');
await page.locator('input[name="email"]').fill('test@example.com');

// Clear and fill
await page.getByLabel('Email').clear();
await page.getByLabel('Email').fill('newemail@example.com');
```

### Checkboxes & Radio Buttons

```typescript
// Check a checkbox
await page.getByLabel('I agree').check();

// Check a radio button
await page.getByLabel('Option A').check();

// Uncheck
await page.getByLabel('I agree').uncheck();

// Check using role
await page.getByRole('checkbox', { name: 'Subscribe' }).check();
await page.getByRole('radio', { name: 'Female' }).check();
```

### Clicking Elements

```typescript
// Basic click
await page.getByRole('button', { name: 'Submit' }).click();
await page.locator('.next-button').click();

// Click the nth element
await page.locator('.option').nth(2).click();  // Click 3rd option (0-indexed)

// Double click
await page.locator('.item').dblclick();
```

### Dropdowns/Select

```typescript
// Select by value
await page.locator('select').selectOption('value1');

// Select by label
await page.locator('select').selectOption({ label: 'Option 1' });

// Select multiple
await page.locator('select').selectOption(['value1', 'value2']);
```

## Navigation

```typescript
// Go to URL
await page.goto('https://example.com');

// Click link and wait for navigation
await page.getByRole('link', { name: 'Next Page' }).click();

// Reload
await page.reload();
```

## Waiting

Playwright auto-waits for most actions, but you can wait explicitly:

```typescript
// Wait for element to be visible
await page.locator('.loading').waitFor({ state: 'visible' });
await page.locator('.loading').waitFor({ state: 'hidden' });

// Wait for specific time (avoid if possible)
await page.waitForTimeout(1000);  // 1 second

// Wait for URL
await page.waitForURL('**/success');
```

## Getting Element Information

```typescript
// Get text content
const text = await page.locator('.title').textContent();

// Get count of matching elements
const count = await page.locator('.item').count();

// Check if visible
const isVisible = await page.locator('.banner').isVisible();

// Check if checked
const isChecked = await page.locator('#checkbox').isChecked();

// Get attribute
const href = await page.locator('a').getAttribute('href');
```

## Common Patterns for Forms

```typescript
// Login form
await page.getByLabel('Username').fill('john');
await page.getByLabel('Password').fill('secret');
await page.getByRole('button', { name: 'Sign in' }).click();

// Radio button selection (click nth option)
const radios = await page.locator('input[type="radio"]').all();
await radios[2].check();  // Select 3rd option

// Checkbox selection (select multiple)
await page.getByLabel('Option 1').check();
await page.getByLabel('Option 3').check();

// Handle question in table/matrix
const rows = await page.locator('table tr').all();
for (let i = 0; i < rows.length; i++) {
  const radio = rows[i].locator('input[type="radio"]').first();
  await radio.check();
}
```

## Error Handling

```typescript
try {
  await page.getByRole('button', { name: 'Submit' }).click({ timeout: 5000 });
} catch (error) {
  console.error('Button not found or not clickable:', error);
}

// Check if element exists before acting
const count = await page.locator('.next-button').count();
if (count > 0) {
  await page.locator('.next-button').click();
}
```

## Human-Like Mouse Movements

**IMPORTANT:** Standard Playwright clicks follow straight lines, which advanced anti-bot systems can detect. Use the `mouse.ts` utilities for realistic Bezier curve movements.

### Available Functions

```typescript
import { humanClick, humanFill, humanCheck, humanMove, humanScroll } from './utils/mouse';

// Click with human-like cursor movement
await humanClick(page, '#next-button');

// Fill input with realistic movement + typing
await humanFill(page, 'input[name="email"]', 'test@example.com', 150);

// Check checkbox/radio with human movement
await humanCheck(page, 'input[type="checkbox"]');

// Move cursor to element (without clicking)
await humanMove(page, '.question-text');

// Scroll with natural randomness
await humanScroll(page, 'down', 300);
```

### When to Use

✅ **Use human-like movements for:**
- Surveys with fraud detection enabled
- Avoiding reCAPTCHA flags
- Production automation
- Research requiring realistic behavior

⚠️ **Standard Playwright is fine for:**
- Testing/debugging
- Internal tools
- Demos without anti-bot detection

### How It Works

The `mouse.ts` utilities use the `ghost-cursor` library to generate Bezier curves between points, mimicking natural human cursor paths instead of straight lines.

**Standard Playwright:**
```
Start → (straight line) → Target
```

**Ghost Cursor:**
```
Start → (curved path with acceleration/deceleration) → Target
```

This makes automation much harder to detect via mouse movement analysis.

## Best Practices

1. **Prefer role-based locators**: More robust than CSS selectors
2. **Let Playwright auto-wait**: Don't use `waitForTimeout` unless necessary
3. **Use `.all()` for multiple elements**: Better than loops with `.nth()`
4. **Check visibility before complex actions**: Use `isVisible()` when needed
5. **Headless mode**: Use `headless: true` for production, `false` for debugging
6. **Use human-like movements**: Use `humanClick()` etc. to avoid bot detection

## Sources

- [Playwright Actions Documentation](https://playwright.dev/docs/input)
- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [Playwright API Reference](https://playwright.dev/docs/api/class-locator)
- [GitHub Repository](https://github.com/microsoft/playwright)
