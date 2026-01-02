---
description: Show all available personas with their key characteristics
---

# List Available Personas

Display all available personas for the Qualtrics survey bot.

## Your Task

Read `src/personas/presets.ts` and present a summary of all available personas.

For each persona, show:
1. **ID** (for use with /take-survey)
2. **Demographics** (age, gender, occupation, location)
3. **Key traits** (1-2 defining characteristics)
4. **Response style** (rushing, engaged, thorough, etc.)

## Output Format

Present in a clear table or list format like this:

```
Available Personas for Survey Bot
==================================

1. young-urban-progressive
   - 28F marketing manager from Massachusetts
   - Engaged, values sustainability, politically liberal (2/7)
   - Response style: Thoughtful, moderate speed
   - Key biases: Low satisficing (0.2), moderate social desirability (0.5)

2. retired-rural-conservative
   - 72M retired factory worker from Iowa
   - Thorough, traditional values, politically conservative (6/7)
   - Response style: Careful, slow, agrees often
   - Key biases: High acquiescence (0.5), low satisficing (0.1)

3. disengaged-student
   - 20M college student from Florida
   - Rushing for course credit, distracted
   - Response style: VERY FAST, minimal effort
   - Key biases: High satisficing (0.85), high acquiescence (0.7)

4. skeptical-professional
   - 45F attorney from New York
   - Critical thinker, analytical, questions assumptions
   - Response style: Deliberate, skeptical, detail-oriented
   - Key biases: Very low acquiescence (0.15), low satisficing (0.1)
```

## Usage Guide

After listing personas, show usage example:

```bash
# To use a persona:
/take-survey <survey-url> <persona-id>

# Example:
/take-survey https://survey.qualtrics.com/jfe/form/SV_123 disengaged-student

# To see full details of one persona:
/preview-persona <persona-id>
```

## Additional Context

Explain what makes each persona unique behaviorally:
- **Response time**: disengaged-student is ~3x faster than retired-rural-conservative
- **Agreement**: skeptical-professional rarely agrees, retired-rural-conservative agrees often
- **Thoroughness**: retired-rural-conservative reads carefully, disengaged-student skims
