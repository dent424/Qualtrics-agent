/**
 * Type definitions for the persona system.
 * See reference/persona-system.md for detailed documentation.
 */

/**
 * Core demographic attributes describing the respondent's identity and background
 */
export interface Demographics {
  /** Age in years (18-100) */
  age: number;

  /** Gender identity */
  gender: "male" | "female" | "non-binary" | "prefer not to say";

  /** Educational attainment */
  education: "high school" | "some college" | "bachelor's" | "master's" | "doctorate";

  /** Current occupation (freeform) */
  occupation: string;

  /** Annual household income in USD */
  income: number;

  /** Geographic location */
  location: {
    /** ISO country code (e.g., "US", "UK") */
    country: string;
    /** State/province (e.g., "California", "Ontario") */
    region: string;
    /** Population density category */
    urbanicity: "urban" | "suburban" | "rural";
  };

  /** Marital status */
  maritalStatus: "single" | "married" | "divorced" | "widowed";

  /** Whether they have children */
  hasChildren: boolean;
}

/**
 * Big Five personality traits (1-7 scale)
 * Based on the Five-Factor Model of personality
 */
export interface BigFiveTraits {
  /** Openness to experience: creativity, curiosity (1=low, 7=high) */
  openness: number;

  /** Conscientiousness: organization, discipline, self-control */
  conscientiousness: number;

  /** Extraversion: sociability, assertiveness, energy */
  extraversion: number;

  /** Agreeableness: cooperation, empathy, kindness */
  agreeableness: number;

  /** Neuroticism: emotional instability, anxiety, moodiness */
  neuroticism: number;
}

/**
 * Psychological attributes based on established personality models
 */
export interface Psychographics {
  /** Big Five personality traits (1-7 scale) */
  bigFive: BigFiveTraits;

  /** Personal values (e.g., ["family", "achievement", "tradition"]) */
  values: string[];

  /** Political orientation (1=very liberal, 4=moderate, 7=very conservative) */
  politicalLeaning: number;

  /** Religious involvement (1=not religious, 7=very religious) */
  religiosity: number;
}

/**
 * Systematic tendencies in survey responding (all 0-1 scales)
 * Higher values indicate stronger bias
 */
export interface ResponseBiases {
  /** Tendency to agree with statements (0=never, 1=always) */
  acquiescenceBias: number;

  /** Preference for scale endpoints (e.g., "strongly agree" vs "agree") */
  extremeResponseBias: number;

  /** Tendency to answer in socially favorable ways */
  socialDesirabilityBias: number;

  /** Low-effort responding, rushing through survey */
  satisficing: number;

  /** Preference for neutral/middle options on scales */
  midpointBias: number;
}

/**
 * Survey-taking style and current state
 */
export interface BehavioralAttributes {
  /** Overall approach to the survey */
  surveyMotivation: "engaged" | "rushing" | "thorough" | "disengaged";

  /** Current emotional state (freeform, e.g., "tired", "curious") */
  currentMood: string;

  /** Optional narrative context for richer prompting */
  backstory?: string;
}

/**
 * Complete persona definition
 * Represents a synthetic survey respondent with full psychological profile
 */
export interface Persona {
  /** Unique identifier for this persona */
  id: string;

  /** Demographic attributes */
  demographics: Demographics;

  /** Psychological attributes */
  psychographics: Psychographics;

  /** Response biases */
  biases: ResponseBiases;

  /** Behavioral attributes */
  behavioral: BehavioralAttributes;
}

/**
 * Validation ranges for persona attributes
 */
export const VALIDATION_RANGES = {
  age: { min: 18, max: 100 },
  income: { min: 0, max: 1_000_000 },
  bigFive: { min: 1, max: 7 },
  politicalLeaning: { min: 1, max: 7 },
  religiosity: { min: 1, max: 7 },
  bias: { min: 0, max: 1 },
} as const;

/**
 * Type guard to check if a value is a valid Persona
 */
export function isValidPersona(value: unknown): value is Persona {
  if (typeof value !== "object" || value === null) return false;

  const persona = value as Partial<Persona>;

  // Check required top-level properties
  if (!persona.id || typeof persona.id !== "string") return false;
  if (!persona.demographics || !persona.psychographics) return false;
  if (!persona.biases || !persona.behavioral) return false;

  // Validate demographics
  const { demographics } = persona;
  if (
    !demographics ||
    typeof demographics.age !== "number" ||
    demographics.age < VALIDATION_RANGES.age.min ||
    demographics.age > VALIDATION_RANGES.age.max
  ) {
    return false;
  }

  // Validate Big Five scores
  const { bigFive } = persona.psychographics;
  if (!bigFive) return false;

  const bigFiveScores = [
    bigFive.openness,
    bigFive.conscientiousness,
    bigFive.extraversion,
    bigFive.agreeableness,
    bigFive.neuroticism,
  ];

  if (
    !bigFiveScores.every(
      (score) =>
        typeof score === "number" &&
        score >= VALIDATION_RANGES.bigFive.min &&
        score <= VALIDATION_RANGES.bigFive.max
    )
  ) {
    return false;
  }

  // Validate biases
  const { biases } = persona;
  const biasValues = [
    biases.acquiescenceBias,
    biases.extremeResponseBias,
    biases.socialDesirabilityBias,
    biases.satisficing,
    biases.midpointBias,
  ];

  if (
    !biasValues.every(
      (bias) =>
        typeof bias === "number" &&
        bias >= VALIDATION_RANGES.bias.min &&
        bias <= VALIDATION_RANGES.bias.max
    )
  ) {
    return false;
  }

  return true;
}
