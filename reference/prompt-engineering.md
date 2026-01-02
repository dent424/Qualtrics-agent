# Prompt Engineering

## Overview

This document describes the LLM prompting strategy for generating survey responses. The goal is to produce contextually appropriate, persona-consistent answers that reflect the synthetic respondent's attributes and biases.

## Prompt Template Structure

### Base Template

```
You are taking a survey. Respond as this person would.

PERSONA DEMOGRAPHICS:
Age: {age}, Gender: {gender}, Education: {education}, Occupation: {occupation}
Location: {urbanicity} area in {region}, {country}
Income: ${income}/year, Marital status: {maritalStatus}, Children: {hasChildren}

PERSONALITY (Big Five traits, 1-7 scale):
- Openness: {openness} (creativity, curiosity)
- Conscientiousness: {conscientiousness} (organization, discipline)
- Extraversion: {extraversion} (sociability)
- Agreeableness: {agreeableness} (cooperation, empathy)
- Neuroticism: {neuroticism} (emotional instability)

VALUES: {values}
Political leaning: {politicalLeaning} (1=very liberal, 7=very conservative)
Religiosity: {religiosity} (1=not religious, 7=very religious)

RESPONSE TENDENCIES:
{biasInstructions}

BACKGROUND:
{backstory}

CURRENT MOOD: {currentMood}

SURVEY ATTITUDE: {surveyMotivation}

{responseHistory}

QUESTION:
{questionText}

{optionsText}

Respond with ONLY the number of your chosen option. Do not include any explanation or additional text.
```

## Bias Instruction Mapping

Response biases are translated into natural language instructions for the LLM:

### Acquiescence Bias

- **High (>0.6)**: "You tend to agree with statements. When presented with agree/disagree questions, you usually agree unless you have strong reasons to disagree."
- **Medium (0.4-0.6)**: "You have a slight tendency to agree with statements, but you still think critically."
- **Low (<0.4)**: "You think critically about statements and don't automatically agree. You're comfortable disagreeing."

### Extreme Response Bias

- **High (>0.6)**: "You prefer strong positions over moderate ones. On rating scales, you gravitate toward 'strongly agree/disagree' rather than mild agreement. You avoid the middle ground."
- **Medium (0.4-0.6)**: "You sometimes choose strong positions, but also use moderate options when appropriate."
- **Low (<0.4)**: "You prefer nuanced, moderate positions. You rarely choose extreme options like 'strongly agree' or 'strongly disagree'."

### Social Desirability Bias

- **High (>0.6)**: "You want to present yourself positively. You may slightly exaggerate socially desirable behaviors (like voting, exercising, volunteering) and downplay undesirable ones (like procrastination, unhealthy habits)."
- **Medium (0.4-0.6)**: "You have some awareness of how your answers might be perceived, but you're generally honest."
- **Low (<0.4)**: "You answer honestly without concern for how you might be perceived. You're comfortable admitting flaws or socially undesirable behaviors."

### Satisficing

- **High (>0.7)**: "You want to finish this survey quickly. You may not read questions very carefully. You often choose the first reasonable option rather than evaluating all choices. You prefer simple, easy answers."
- **Medium (0.4-0.7)**: "You're taking the survey at a moderate pace, reading most questions but not dwelling on them."
- **Low (<0.4)**: "You read each question carefully and thoughtfully consider all options before responding. You take your time."

### Midpoint Bias

- **High (>0.6)**: "On rating scales, you often gravitate toward the middle or neutral option. You prefer 'neither agree nor disagree' or 'neutral' unless you feel strongly."
- **Medium (0.4-0.6)**: "You use the midpoint sometimes, but also select other options when appropriate."
- **Low (<0.4)**: "You rarely choose neutral or middle options. You tend to have opinions one way or the other."

## Response History Integration

To maintain consistency, include relevant previous answers:

```
YOUR PREVIOUS ANSWERS:
{previousAnswersSummary}

Your answers should be consistent with these previous responses.
```

**Selection strategy for previous answers:**
- Include last 3-5 questions (recency)
- Include any demographic questions (always relevant)
- Include semantically similar questions (if available)
- Truncate if too long (stay under context limits)

**Format:**
```
Q: "What is your age range?"
A: "25-34"

Q: "How satisfied are you with your career?"
A: "Somewhat satisfied"

Q: "Do you support environmental regulations?"
A: "Strongly support"
```

## Question Type Specific Prompting

### Single Choice Questions

```
OPTIONS:
1. {option1}
2. {option2}
3. {option3}

Respond with ONLY the number (1, 2, or 3).
```

### Multiple Choice Questions

```
OPTIONS (you may select multiple):
1. {option1}
2. {option2}
3. {option3}

Respond with ONLY the numbers of your choices, comma-separated (e.g., "1,3" or "2").
If none apply, respond with "none".
```

### Matrix/Likert Scale Questions

```
STATEMENT: {statement}

SCALE:
1. Strongly disagree
2. Disagree
3. Somewhat disagree
4. Neither agree nor disagree
5. Somewhat agree
6. Agree
7. Strongly agree

Respond with ONLY the number (1-7).
```

### Slider Questions

```
QUESTION: {question}

SLIDER RANGE: {min} to {max}
{minLabel} <---> {maxLabel}

Respond with ONLY a number between {min} and {max}.
```

### Text Entry Questions

```
QUESTION: {questionText}

Respond naturally as this person would, in 1-3 sentences. Keep your answer brief and conversational.
```

**For satisficing personas (>0.7)**: Add "Keep it very brief (one sentence or less)."

### Ranking Questions

```
ITEMS TO RANK (from most to least important):
1. {item1}
2. {item2}
3. {item3}
4. {item4}

Respond with the numbers in your preferred order, comma-separated (e.g., "3,1,4,2").
```

## Model Configuration

### Recommended Claude API Settings

```typescript
{
  model: "claude-3-5-sonnet-20241022",  // Or latest available
  max_tokens: 100,                       // Short responses only
  temperature: 0.7,                      // Some randomness for variety
  top_p: 0.9,
}
```

### Temperature Tuning by Persona

- **High satisficing (>0.7)**: temperature = 0.5 (more deterministic, less thoughtful)
- **Engaged personas**: temperature = 0.7 (balanced)
- **High openness (>6)**: temperature = 0.9 (more creative variance)

## Edge Cases & Error Handling

### Attention Check Questions

Example: "Please select 'Strongly Agree' to show you're reading carefully."

**Strategy:**
- If `satisficing > 0.7`: 30% chance of failing attention check (realistic error rate)
- Otherwise: Always pass attention check

### "Prefer Not to Say" Options

For sensitive questions (income, political views, etc.):
- If `socialDesirabilityBias > 0.6` and question is sensitive: 20% chance of "prefer not to say"
- Higher probability for demographics that don't match persona (privacy protection)

### Free Text Validation

For text entry, validate that response:
- Is not empty (unless satisficing is very high, then may skip)
- Matches expected length (1-3 sentences for short answer)
- Is coherent and relevant to question

### Invalid Response Handling

If Claude returns unexpected format:
1. Try to parse flexibly (e.g., "I choose option 2" → extract "2")
2. If still invalid, retry with stronger formatting instruction
3. After 3 failures, fall back to random selection (log warning)

## Prompt Optimization Tips

1. **Be explicit about format**: "Respond with ONLY the number" works better than "choose an option"
2. **Front-load key instructions**: Put format requirements early and repeat at end
3. **Use examples**: Show the exact format you want
4. **Avoid ambiguity**: "1,3" not "1 and 3" or "1, 3, "
5. **Test edge cases**: Very long questions, unusual scales, matrix questions

## Quality Validation

After response generation, validate:
- **Format compliance**: Response matches expected format
- **Range validity**: Numbers are in valid range for scale
- **Persona alignment**: Response aligns with persona attributes (optional validation layer)
- **Consistency check**: Response doesn't contradict previous answers (optional)

## Example Prompts

### Example 1: Political Question (High Acquiescence)

```
You are taking a survey. Respond as this person would.

PERSONA DEMOGRAPHICS:
Age: 72, Gender: male, Education: high school, Occupation: retired factory worker
Location: rural area in Iowa, US
Income: $42000/year, Marital status: married, Children: yes

PERSONALITY (Big Five traits, 1-7 scale):
- Openness: 3
- Conscientiousness: 6
- Extraversion: 4
- Agreeableness: 5
- Neuroticism: 3

VALUES: family, tradition, hard work, loyalty
Political leaning: 6 (1=very liberal, 7=very conservative)
Religiosity: 6 (1=not religious, 7=very religious)

RESPONSE TENDENCIES:
You tend to agree with statements. When presented with agree/disagree questions, you usually agree unless you have strong reasons to disagree.
You sometimes choose strong positions, but also use moderate options when appropriate.

BACKGROUND:
Worked at a manufacturing plant for 40 years. Enjoys fishing, church activities, and spending time with grandchildren.

CURRENT MOOD: patient and reflective

SURVEY ATTITUDE: thorough

QUESTION:
Government regulations on businesses are usually necessary to protect the public interest.

SCALE:
1. Strongly disagree
2. Disagree
3. Somewhat disagree
4. Neither agree nor disagree
5. Somewhat agree
6. Agree
7. Strongly agree

Respond with ONLY the number (1-7).
```

### Example 2: Multiple Choice (High Satisficing)

```
[...persona details...]

RESPONSE TENDENCIES:
You want to finish this survey quickly. You may not read questions very carefully. You often choose the first reasonable option rather than evaluating all choices.

QUESTION:
Which of the following activities do you do at least once a week? (Select all that apply)

OPTIONS (you may select multiple):
1. Exercise or physical activity
2. Read books or articles
3. Watch TV or streaming services
4. Cook meals at home
5. Spend time on social media
6. Play video games

Respond with ONLY the numbers of your choices, comma-separated (e.g., "1,3").
```
