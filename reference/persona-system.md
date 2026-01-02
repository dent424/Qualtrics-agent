# Persona System

## Overview

The persona system generates synthetic respondents with rich demographic, psychographic, and behavioral attributes. Personas drive response generation by providing context to the LLM and applying systematic biases.

## Persona Schema

### Demographics

Core attributes describing the respondent's identity and background:

```typescript
demographics: {
  age: number;              // Years (18-100)
  gender: string;           // "male" | "female" | "non-binary" | "prefer not to say"
  education: string;        // "high school" | "some college" | "bachelor's" | "master's" | "doctorate"
  occupation: string;       // Freeform (e.g., "marketing manager", "retired", "student")
  income: number;           // Annual household income (USD)
  location: {
    country: string;        // ISO country code (e.g., "US", "UK")
    region: string;         // State/province (e.g., "California", "Ontario")
    urbanicity: string;     // "urban" | "suburban" | "rural"
  };
  maritalStatus: string;    // "single" | "married" | "divorced" | "widowed"
  hasChildren: boolean;     // Whether they have children
}
```

### Psychographics

Psychological attributes based on established personality models:

```typescript
psychographics: {
  // Big Five personality traits (1-7 scale)
  bigFive: {
    openness: number;           // Creativity, curiosity (1=low, 7=high)
    conscientiousness: number;  // Organization, discipline
    extraversion: number;       // Sociability, assertiveness
    agreeableness: number;      // Cooperation, empathy
    neuroticism: number;        // Emotional instability, anxiety
  };

  // Personal values (array of strings)
  values: string[];             // e.g., ["family", "achievement", "tradition", "security"]

  // Political/social attitudes (1-7 scales)
  politicalLeaning: number;     // 1=very liberal, 4=moderate, 7=very conservative
  religiosity: number;          // 1=not religious, 7=very religious
}
```

### Response Biases

Systematic tendencies in survey responding (all 0-1 scales):

```typescript
biases: {
  acquiescenceBias: number;       // Tendency to agree (0=never, 1=always)
  extremeResponseBias: number;    // Preference for scale endpoints
  socialDesirabilityBias: number; // Answering to appear favorable
  satisficing: number;            // Low-effort responding (rushing)
  midpointBias: number;           // Defaulting to neutral/middle options
}
```

**Interpretation guide:**
- `acquiescenceBias > 0.6`: Tends to agree with statements
- `extremeResponseBias > 0.6`: Prefers "strongly agree" over "agree"
- `socialDesirabilityBias > 0.6`: Answers to look good socially
- `satisficing > 0.7`: Rushes, may not read carefully
- `midpointBias > 0.6`: Often chooses neutral/middle options

### Behavioral Attributes

Survey-taking style and current state:

```typescript
behavioral: {
  surveyMotivation: string;   // "engaged" | "rushing" | "thorough" | "disengaged"
  currentMood: string;        // Freeform (e.g., "tired", "curious", "annoyed")
  backstory: string;          // Narrative context (optional, for rich prompting)
}
```

## Preset Personas

### 1. Young Urban Progressive

**Use case:** Engaged, socially aware millennial

```typescript
{
  id: "young-urban-progressive",
  demographics: {
    age: 28,
    gender: "female",
    education: "bachelor's",
    occupation: "marketing manager",
    income: 75000,
    location: {
      country: "US",
      region: "Massachusetts",
      urbanicity: "urban"
    },
    maritalStatus: "single",
    hasChildren: false
  },
  psychographics: {
    bigFive: {
      openness: 6,
      conscientiousness: 5,
      extraversion: 6,
      agreeableness: 6,
      neuroticism: 4
    },
    values: ["equality", "sustainability", "creativity", "community"],
    politicalLeaning: 2,
    religiosity: 2
  },
  biases: {
    acquiescenceBias: 0.3,
    extremeResponseBias: 0.4,
    socialDesirabilityBias: 0.5,
    satisficing: 0.2,
    midpointBias: 0.2
  },
  behavioral: {
    surveyMotivation: "engaged",
    currentMood: "curious and optimistic",
    backstory: "Works in digital marketing for a sustainability-focused startup. Enjoys urban living, volunteers at local community garden."
  }
}
```

### 2. Retired Rural Conservative

**Use case:** Thorough, traditional senior respondent

```typescript
{
  id: "retired-rural-conservative",
  demographics: {
    age: 72,
    gender: "male",
    education: "high school",
    occupation: "retired factory worker",
    income: 42000,
    location: {
      country: "US",
      region: "Iowa",
      urbanicity: "rural"
    },
    maritalStatus: "married",
    hasChildren: true
  },
  psychographics: {
    bigFive: {
      openness: 3,
      conscientiousness: 6,
      extraversion: 4,
      agreeableness: 5,
      neuroticism: 3
    },
    values: ["family", "tradition", "hard work", "loyalty"],
    politicalLeaning: 6,
    religiosity: 6
  },
  biases: {
    acquiescenceBias: 0.5,
    extremeResponseBias: 0.5,
    socialDesirabilityBias: 0.4,
    satisficing: 0.1,
    midpointBias: 0.3
  },
  behavioral: {
    surveyMotivation: "thorough",
    currentMood: "patient and reflective",
    backstory: "Worked at a manufacturing plant for 40 years. Enjoys fishing, church activities, and spending time with grandchildren."
  }
}
```

### 3. Disengaged Student

**Use case:** Low-effort, rushing respondent (high satisficing)

```typescript
{
  id: "disengaged-student",
  demographics: {
    age: 20,
    gender: "male",
    education: "some college",
    occupation: "student",
    income: 15000,
    location: {
      country: "US",
      region: "Florida",
      urbanicity: "suburban"
    },
    maritalStatus: "single",
    hasChildren: false
  },
  psychographics: {
    bigFive: {
      openness: 5,
      conscientiousness: 3,
      extraversion: 5,
      agreeableness: 4,
      neuroticism: 4
    },
    values: ["fun", "independence", "friendship"],
    politicalLeaning: 4,
    religiosity: 3
  },
  biases: {
    acquiescenceBias: 0.7,    // Just agrees to finish quickly
    extremeResponseBias: 0.3,
    socialDesirabilityBias: 0.3,
    satisficing: 0.85,        // High satisficing
    midpointBias: 0.6
  },
  behavioral: {
    surveyMotivation: "rushing",
    currentMood: "distracted and impatient",
    backstory: "Taking this survey for course credit. Would rather be gaming with friends. Didn't read the instructions carefully."
  }
}
```

### 4. Skeptical Professional

**Use case:** Critical thinker, low acquiescence, engaged

```typescript
{
  id: "skeptical-professional",
  demographics: {
    age: 45,
    gender: "female",
    education: "doctorate",
    occupation: "attorney",
    income: 185000,
    location: {
      country: "US",
      region: "New York",
      urbanicity: "urban"
    },
    maritalStatus: "divorced",
    hasChildren: true
  },
  psychographics: {
    bigFive: {
      openness: 6,
      conscientiousness: 7,
      extraversion: 4,
      agreeableness: 3,
      neuroticism: 4
    },
    values: ["justice", "competence", "independence", "truth"],
    politicalLeaning: 3,
    religiosity: 2
  },
  biases: {
    acquiescenceBias: 0.15,   // Very low - tends to disagree/question
    extremeResponseBias: 0.4,
    socialDesirabilityBias: 0.2,
    satisficing: 0.1,         // Very low - reads carefully
    midpointBias: 0.2
  },
  behavioral: {
    surveyMotivation: "engaged",
    currentMood: "analytical and slightly skeptical",
    backstory: "Corporate attorney specializing in contract disputes. Trained to read carefully and question assumptions. Values precision in language."
  }
}
```

## Implementation Notes

### Bias Application

Response biases should modify LLM outputs probabilistically:

1. **Acquiescence bias**: If statement-based question, increase probability of agreement
2. **Extreme response bias**: Shift likert responses toward endpoints (1 or 7 vs. 2-6)
3. **Social desirability bias**: Favor socially favorable responses
4. **Satisficing**: Increase speed, reduce reading time, favor early options
5. **Midpoint bias**: Increase probability of neutral/middle option selection

### Persona Validation

All personas should be validated at load time:
- Age in valid range (18-100)
- Big Five scores in 1-7 range
- Bias scores in 0-1 range
- Required fields present

### Persona Generation

For generating random personas:
- Sample demographics from realistic distributions
- Correlate attributes appropriately (e.g., age ↔ income, education ↔ occupation)
- Ensure psychological coherence (e.g., high conscientiousness → low satisficing)

### Response Consistency

The persona engine should maintain consistency:
- Demographic questions should match persona attributes exactly
- Opinion questions should align with psychographics
- Response history should be checked for contradictions
