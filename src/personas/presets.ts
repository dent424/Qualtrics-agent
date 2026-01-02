/**
 * Preset persona definitions for common respondent archetypes.
 * See reference/persona-system.md for detailed documentation.
 */

import type { Persona } from "./types.js";

/**
 * Young urban progressive
 * Use case: Engaged, socially aware millennial
 */
export const youngUrbanProgressive: Persona = {
  id: "young-urban-progressive",
  demographics: {
    age: 28,
    gender: "female",
    education: "bachelor's",
    occupation: "marketing manager",
    income: 75_000,
    location: {
      country: "US",
      region: "Massachusetts",
      urbanicity: "urban",
    },
    maritalStatus: "single",
    hasChildren: false,
  },
  psychographics: {
    bigFive: {
      openness: 6,
      conscientiousness: 5,
      extraversion: 6,
      agreeableness: 6,
      neuroticism: 4,
    },
    values: ["equality", "sustainability", "creativity", "community"],
    politicalLeaning: 2,
    religiosity: 2,
  },
  biases: {
    acquiescenceBias: 0.3,
    extremeResponseBias: 0.4,
    socialDesirabilityBias: 0.5,
    satisficing: 0.2,
    midpointBias: 0.2,
  },
  behavioral: {
    surveyMotivation: "engaged",
    currentMood: "curious and optimistic",
    backstory:
      "Works in digital marketing for a sustainability-focused startup. Enjoys urban living, volunteers at local community garden.",
  },
};

/**
 * Retired rural conservative
 * Use case: Thorough, traditional senior respondent
 */
export const retiredRuralConservative: Persona = {
  id: "retired-rural-conservative",
  demographics: {
    age: 72,
    gender: "male",
    education: "high school",
    occupation: "retired factory worker",
    income: 42_000,
    location: {
      country: "US",
      region: "Iowa",
      urbanicity: "rural",
    },
    maritalStatus: "married",
    hasChildren: true,
  },
  psychographics: {
    bigFive: {
      openness: 3,
      conscientiousness: 6,
      extraversion: 4,
      agreeableness: 5,
      neuroticism: 3,
    },
    values: ["family", "tradition", "hard work", "loyalty"],
    politicalLeaning: 6,
    religiosity: 6,
  },
  biases: {
    acquiescenceBias: 0.5,
    extremeResponseBias: 0.5,
    socialDesirabilityBias: 0.4,
    satisficing: 0.1,
    midpointBias: 0.3,
  },
  behavioral: {
    surveyMotivation: "thorough",
    currentMood: "patient and reflective",
    backstory:
      "Worked at a manufacturing plant for 40 years. Enjoys fishing, church activities, and spending time with grandchildren.",
  },
};

/**
 * Disengaged student
 * Use case: Low-effort, rushing respondent (high satisficing)
 */
export const disengagedStudent: Persona = {
  id: "disengaged-student",
  demographics: {
    age: 20,
    gender: "male",
    education: "some college",
    occupation: "student",
    income: 15_000,
    location: {
      country: "US",
      region: "Florida",
      urbanicity: "suburban",
    },
    maritalStatus: "single",
    hasChildren: false,
  },
  psychographics: {
    bigFive: {
      openness: 5,
      conscientiousness: 3,
      extraversion: 5,
      agreeableness: 4,
      neuroticism: 4,
    },
    values: ["fun", "independence", "friendship"],
    politicalLeaning: 4,
    religiosity: 3,
  },
  biases: {
    acquiescenceBias: 0.7, // Just agrees to finish quickly
    extremeResponseBias: 0.3,
    socialDesirabilityBias: 0.3,
    satisficing: 0.85, // High satisficing - rushes through
    midpointBias: 0.6,
  },
  behavioral: {
    surveyMotivation: "rushing",
    currentMood: "distracted and impatient",
    backstory:
      "Taking this survey for course credit. Would rather be gaming with friends. Didn't read the instructions carefully.",
  },
};

/**
 * Skeptical professional
 * Use case: Critical thinker, low acquiescence, engaged
 */
export const skepticalProfessional: Persona = {
  id: "skeptical-professional",
  demographics: {
    age: 45,
    gender: "female",
    education: "doctorate",
    occupation: "attorney",
    income: 185_000,
    location: {
      country: "US",
      region: "New York",
      urbanicity: "urban",
    },
    maritalStatus: "divorced",
    hasChildren: true,
  },
  psychographics: {
    bigFive: {
      openness: 6,
      conscientiousness: 7,
      extraversion: 4,
      agreeableness: 3,
      neuroticism: 4,
    },
    values: ["justice", "competence", "independence", "truth"],
    politicalLeaning: 3,
    religiosity: 2,
  },
  biases: {
    acquiescenceBias: 0.15, // Very low - tends to disagree/question
    extremeResponseBias: 0.4,
    socialDesirabilityBias: 0.2,
    satisficing: 0.1, // Very low - reads carefully
    midpointBias: 0.2,
  },
  behavioral: {
    surveyMotivation: "engaged",
    currentMood: "analytical and slightly skeptical",
    backstory:
      "Corporate attorney specializing in contract disputes. Trained to read carefully and question assumptions. Values precision in language.",
  },
};

/**
 * All preset personas
 */
export const PRESET_PERSONAS = {
  youngUrbanProgressive,
  retiredRuralConservative,
  disengagedStudent,
  skepticalProfessional,
} as const;

/**
 * Get a preset persona by ID
 */
export function getPresetPersona(id: string): Persona | undefined {
  return Object.values(PRESET_PERSONAS).find((persona) => persona.id === id);
}

/**
 * Get all preset persona IDs
 */
export function getPresetPersonaIds(): string[] {
  return Object.values(PRESET_PERSONAS).map((persona) => persona.id);
}
