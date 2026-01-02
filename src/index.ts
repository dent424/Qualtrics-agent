/**
 * Qualtrics Survey Bot Agent
 * Main entry point
 */

import { PRESET_PERSONAS } from "./personas/presets.js";

console.log("Qualtrics Survey Bot Agent");
console.log("==========================\n");

console.log("Available preset personas:");
for (const persona of Object.values(PRESET_PERSONAS)) {
  console.log(`  - ${persona.id}: ${persona.demographics.occupation}, age ${persona.demographics.age}`);
}

console.log("\nProject initialized successfully!");
console.log("See CLAUDE.md and reference/ documentation to get started.");
