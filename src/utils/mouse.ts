/**
 * Human-like mouse movement utilities
 *
 * Uses ghost-cursor to generate realistic mouse movements with Bezier curves
 * instead of Playwright's default straight-line movements.
 *
 * This helps avoid bot detection by mimicking natural human cursor patterns.
 */

import { createCursor, GhostCursor } from 'ghost-cursor';
import type { Page } from 'playwright';

let ghostCursor: GhostCursor | null = null;

/**
 * Initialize ghost cursor for a page
 */
export async function initGhostCursor(page: Page): Promise<GhostCursor> {
  ghostCursor = createCursor(page);
  return ghostCursor;
}

/**
 * Click an element with human-like mouse movement
 *
 * @param page - Playwright page
 * @param selector - CSS selector for element to click
 * @param options - Click options
 */
export async function humanClick(
  page: Page,
  selector: string,
  options?: {
    button?: 'left' | 'right' | 'middle';
    clickCount?: number;
    delay?: number;
  }
): Promise<void> {
  if (!ghostCursor) {
    ghostCursor = await initGhostCursor(page);
  }

  const element = await page.locator(selector);
  await ghostCursor.click(selector, options);
}

/**
 * Move mouse to an element with human-like movement
 *
 * @param page - Playwright page
 * @param selector - CSS selector for target element
 */
export async function humanMove(
  page: Page,
  selector: string
): Promise<void> {
  if (!ghostCursor) {
    ghostCursor = await initGhostCursor(page);
  }

  await ghostCursor.move(selector);
}

/**
 * Move mouse to random position on page (simulates wandering)
 *
 * @param page - Playwright page
 */
export async function randomMove(page: Page): Promise<void> {
  if (!ghostCursor) {
    ghostCursor = await initGhostCursor(page);
  }

  const viewportSize = page.viewportSize();
  if (!viewportSize) return;

  const x = Math.random() * viewportSize.width;
  const y = Math.random() * viewportSize.height;

  await ghostCursor.moveTo({ x, y });
}

/**
 * Fill input with human-like typing and mouse movement
 *
 * @param page - Playwright page
 * @param selector - CSS selector for input element
 * @param text - Text to type
 * @param typingDelay - Delay between keystrokes (from behavioral.ts)
 */
export async function humanFill(
  page: Page,
  selector: string,
  text: string,
  typingDelay?: number
): Promise<void> {
  if (!ghostCursor) {
    ghostCursor = await initGhostCursor(page);
  }

  // Move to input with human-like movement
  await ghostCursor.move(selector);

  // Click to focus
  await ghostCursor.click(selector);

  // Type with delays (Playwright's type method already adds delays)
  if (typingDelay) {
    await page.locator(selector).pressSequentially(text, { delay: typingDelay });
  } else {
    await page.locator(selector).fill(text);
  }
}

/**
 * Check a checkbox or radio button with human-like movement
 *
 * @param page - Playwright page
 * @param selector - CSS selector for checkbox/radio
 */
export async function humanCheck(
  page: Page,
  selector: string
): Promise<void> {
  if (!ghostCursor) {
    ghostCursor = await initGhostCursor(page);
  }

  await ghostCursor.click(selector);
}

/**
 * Scroll page with human-like randomness
 *
 * @param page - Playwright page
 * @param direction - 'up' or 'down'
 * @param amount - Pixels to scroll
 */
export async function humanScroll(
  page: Page,
  direction: 'up' | 'down',
  amount?: number
): Promise<void> {
  const scrollAmount = amount || (200 + Math.random() * 300); // 200-500px
  const delta = direction === 'down' ? scrollAmount : -scrollAmount;

  // Add some randomness to scroll
  const steps = 5 + Math.floor(Math.random() * 5); // 5-10 steps
  const stepSize = delta / steps;

  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepSize);
    await page.waitForTimeout(30 + Math.random() * 50); // 30-80ms between steps
  }
}
