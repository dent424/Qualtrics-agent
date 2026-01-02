---
description: Show complete profile of a specific persona
argument-hint: <persona-id>
---

# Preview Persona Profile

Display the complete profile for persona **$1**.

## Your Task

Read `src/personas/presets.ts` and find the persona with ID **$1**.

If not found, show error and list available IDs:
- `young-urban-progressive`
- `retired-rural-conservative`
- `disengaged-student`
- `skeptical-professional`

## Output Format

Show complete persona profile in this structure:

```
═══════════════════════════════════════════════════════════
PERSONA: $1
═══════════════════════════════════════════════════════════

📋 DEMOGRAPHICS
────────────────────────────────────────────────────────────
Age:              28
Gender:           Female
Education:        Bachelor's degree
Occupation:       Marketing manager
Location:         Urban Massachusetts, USA
Income:           $75,000/year
Marital Status:   Single
Children:         No

👤 PERSONALITY (Big Five Traits, 1-7 scale)
────────────────────────────────────────────────────────────
Openness:              6/7  (creative, curious)
Conscientiousness:     5/7  (organized, disciplined)
Extraversion:          6/7  (sociable, assertive)
Agreeableness:         6/7  (cooperative, empathetic)
Neuroticism:           4/7  (emotional stability)

💭 VALUES & BELIEFS
────────────────────────────────────────────────────────────
Core Values:          equality, sustainability, creativity, community
Political Leaning:    2/7 (very liberal)
Religiosity:          2/7 (not religious)

📊 RESPONSE BIASES (0-1 scale, 0=none, 1=extreme)
────────────────────────────────────────────────────────────
Acquiescence:         0.3  (moderate tendency to agree)
Extreme Response:     0.4  (sometimes uses strong positions)
Social Desirability:  0.5  (moderate concern for appearance)
Satisficing:          0.2  (low - reads carefully, engaged)
Midpoint:             0.2  (rarely neutral, has opinions)

🎭 BEHAVIORAL STYLE
────────────────────────────────────────────────────────────
Survey Motivation:    engaged
Current Mood:         curious and optimistic
Backstory:            Works in digital marketing for a
                      sustainability-focused startup. Enjoys urban
                      living, volunteers at local community garden.

⏱️  TIMING PROFILE (approximate)
────────────────────────────────────────────────────────────
Reading Speed:        ~250 ms/word (average)
Typing Speed:         ~180 ms/keystroke
Thinking Time:        ~1000 ms per question
Total Question Time:  ~3-5 seconds (varies by complexity)

📝 HOW THIS PERSONA RESPONDS
────────────────────────────────────────────────────────────
Typical Behaviors:
- Reads questions carefully
- Thoughtful, engaged responses
- Supports progressive/environmental causes
- Moderate agreement tendency (not overly agreeable)
- Values work-life balance, social justice
- Likely to give detailed text responses

Example Responses:
Q: "How often do you recycle?"
A: "Always" (strong environmental values)

Q: "Climate change is a serious threat"
A: "Strongly agree" (progressive, environmental focus)

Q: "Rate importance of work-life balance (1-10)"
A: 8-9 (values balance, typical for demographics)

Q: "Describe your occupation"
A: "I'm a marketing manager at a sustainability-focused
    startup, working on campaigns that promote eco-friendly
    products." (detailed, engaged)
```

## Comparison Note

After showing profile, add a comparison line:
```
💡 Compared to other personas:
- FASTER than: retired-rural-conservative (thorough)
- SLOWER than: disengaged-student (rushing)
- MORE agreeable than: skeptical-professional
- LESS agreeable than: retired-rural-conservative
```

## Usage Example

```bash
# Use this persona in a survey:
/take-survey https://survey.qualtrics.com/jfe/form/SV_123 $1
```

## Reference

For more details on how this persona makes decisions, see:
- `reference/persona-system.md` - Full schema documentation
- `reference/persona-response-guide.md` - Decision framework
- `reference/behavioral-signals.md` - Timing calculations
