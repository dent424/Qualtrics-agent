/**
 * Behavioral signals for human-like survey interactions
 *
 * These functions generate realistic timing patterns based on persona attributes:
 * - satisficing: Higher = faster, less careful
 * - conscientiousness: Higher = slower, more deliberate
 * - surveyMotivation: "rushing" | "engaged" | "thorough"
 */

import type { Persona } from "../personas/types.js";

/** Random number between min and max */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Random integer between min and max (inclusive) */
function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

/**
 * Calculate inter-keystroke interval (IKI) for typing
 * Returns delay in milliseconds between keystrokes
 *
 * Humans typically type at 150-300ms per character with variance
 */
export function getTypingDelay(persona: Persona): number {
  const { satisficing } = persona.biases;
  const { surveyMotivation } = persona.behavioral;

  // Base typing speed (ms per keystroke)
  let baseDelay = 180; // Average human

  // Faster typing for rushing personas
  if (surveyMotivation === "rushing") {
    baseDelay = 120;
  } else if (surveyMotivation === "thorough") {
    baseDelay = 220;
  }

  // Satisficing makes typing faster/sloppier
  baseDelay = baseDelay * (1 - satisficing * 0.4);

  // Add natural variance (±40%)
  const variance = baseDelay * 0.4;
  return randomBetween(baseDelay - variance, baseDelay + variance);
}

/**
 * Calculate reading time for text
 * Returns delay in milliseconds
 *
 * Average reading speed: 200-250 words per minute
 * = ~250ms per word for average reader
 */
export function getReadingTime(text: string, persona: Persona): number {
  const { satisficing } = persona.biases;
  const { surveyMotivation } = persona.behavioral;

  // Count words (rough estimate)
  const wordCount = text.split(/\s+/).length;

  // Base reading speed (ms per word)
  let msPerWord = 250; // Average reader

  if (surveyMotivation === "rushing") {
    msPerWord = 150; // Skimming
  } else if (surveyMotivation === "thorough") {
    msPerWord = 350; // Careful reading
  }

  // High satisficing = faster/skipping
  msPerWord = msPerWord * (1 - satisficing * 0.5);

  const baseTime = wordCount * msPerWord;

  // Minimum reading time (even speeders take some time)
  const minTime = wordCount * 50;

  // Add variance (±20%)
  const variance = baseTime * 0.2;
  const finalTime = randomBetween(baseTime - variance, baseTime + variance);

  return Math.max(minTime, finalTime);
}

/**
 * Calculate thinking/hesitation time before answering
 * Returns delay in milliseconds
 *
 * Time to consider the question and formulate response
 */
export function getThinkingTime(persona: Persona): number {
  const { satisficing } = persona.biases;
  const { conscientiousness } = persona.psychographics.bigFive;
  const { surveyMotivation } = persona.behavioral;

  // Base thinking time
  let baseTime = 1000; // 1 second average

  if (surveyMotivation === "rushing") {
    baseTime = 300; // Minimal thought
  } else if (surveyMotivation === "thorough") {
    baseTime = 2000; // Deliberate consideration
  }

  // Conscientiousness increases thinking time
  baseTime = baseTime * (0.6 + conscientiousness * 0.1);

  // Satisficing decreases thinking time
  baseTime = baseTime * (1 - satisficing * 0.6);

  // Add variance (±50%)
  const variance = baseTime * 0.5;
  return randomBetween(baseTime - variance, baseTime + variance);
}

/**
 * Calculate click delay (time between deciding and clicking)
 * Returns delay in milliseconds
 *
 * Includes mouse movement and click execution time
 */
export function getClickDelay(persona: Persona): number {
  const { satisficing } = persona.biases;

  // Base delay for mouse movement + click (200-500ms)
  let baseDelay = 350;

  // Rushing personas click faster
  if (satisficing > 0.7) {
    baseDelay = 200;
  }

  // Add variance (±40%)
  const variance = baseDelay * 0.4;
  return randomBetween(baseDelay - variance, baseDelay + variance);
}

/**
 * Calculate delay before clicking "Next" button
 * Returns delay in milliseconds
 *
 * Humans don't click Next immediately after answering
 */
export function getNextButtonDelay(persona: Persona): number {
  const { satisficing } = persona.biases;
  const { surveyMotivation } = persona.behavioral;

  // Base delay
  let baseDelay = 800;

  if (surveyMotivation === "rushing") {
    baseDelay = 300; // Quick to move on
  } else if (surveyMotivation === "thorough") {
    baseDelay = 1500; // May review answer
  }

  // Satisficing reduces delay
  baseDelay = baseDelay * (1 - satisficing * 0.5);

  // Add variance (±60%)
  const variance = baseDelay * 0.6;
  return randomBetween(baseDelay - variance, baseDelay + variance);
}

/**
 * Determine if persona should hesitate/change answer
 * Returns probability (0-1)
 *
 * Some personas reconsider their answers more often
 */
export function getHesitationProbability(persona: Persona): number {
  const { neuroticism } = persona.psychographics.bigFive;
  const { satisficing } = persona.biases;
  const { surveyMotivation } = persona.behavioral;

  // Base probability
  let probability = 0.05; // 5% base chance

  // High neuroticism = more hesitation
  probability += neuroticism * 0.02;

  // Thorough personas reconsider more
  if (surveyMotivation === "thorough") {
    probability += 0.1;
  }

  // Satisficing personas don't reconsider
  probability = probability * (1 - satisficing);

  return Math.min(0.3, probability); // Cap at 30%
}

/**
 * Calculate total time for answering a question
 * Combines reading, thinking, and interaction time
 */
export function getTotalQuestionTime(
  questionText: string,
  optionsCount: number,
  persona: Persona
): number {
  // Reading time for question
  const readingTime = getReadingTime(questionText, persona);

  // Reading time for options (brief)
  const optionsReadingTime = optionsCount * 200 * (1 - persona.biases.satisficing * 0.5);

  // Thinking time
  const thinkingTime = getThinkingTime(persona);

  // Interaction time (moving to answer + clicking)
  const clickDelay = getClickDelay(persona);

  return readingTime + optionsReadingTime + thinkingTime + clickDelay;
}

/**
 * Generate realistic typing pattern for text input
 * Returns array of character-delay pairs
 *
 * Includes natural pauses at word boundaries and thinking breaks
 */
export function generateTypingPattern(
  text: string,
  persona: Persona
): Array<{ char: string; delay: number }> {
  const pattern: Array<{ char: string; delay: number }> = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let delay = getTypingDelay(persona);

    // Longer pause at spaces (word boundaries)
    if (char === " ") {
      delay += randomBetween(50, 150);
    }

    // Occasional thinking pause mid-sentence (5% chance)
    if (Math.random() < 0.05 && i > 0 && i < text.length - 1) {
      delay += randomBetween(300, 800);
    }

    // Slightly longer delay after punctuation
    if (i > 0 && /[.,!?]/.test(text[i - 1])) {
      delay += randomBetween(100, 300);
    }

    pattern.push({ char, delay });
  }

  return pattern;
}

/**
 * Format delay for Playwright waitForTimeout
 * Ensures delay is a positive integer
 */
export function formatDelay(ms: number): number {
  return Math.max(0, Math.round(ms));
}

/**
 * Log behavioral timing for debugging
 */
export function logTiming(action: string, timeMs: number, persona: Persona): void {
  const personaInfo = `[${persona.id}]`;
  const timeInfo = `${Math.round(timeMs)}ms`;
  console.log(`${personaInfo} ${action}: ${timeInfo}`);
}
