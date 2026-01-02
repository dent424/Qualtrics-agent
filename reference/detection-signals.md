# Detection Signals

## Overview

This document catalogs the behavioral signals studied for bot detection research. The goal is to systematically vary these signals and measure their impact on detection accuracy.

## Signal Categories

### 1. Timing Signals

Time-based patterns that may differentiate bots from humans.

#### Response Time Distributions

**Signal**: Time from question display to answer submission

**Human characteristics:**
- Wide variance across individuals
- Longer times for complex questions (text, matrix)
- Reading time proportional to text length
- Think time varies by question difficulty
- Skewed distribution (long right tail)

**Bot risks:**
- Too consistent (low variance)
- Too fast (no reading time)
- Too uniform across question types
- Perfectly correlated with text length (too algorithmic)

**Research parameters to vary:**
```typescript
{
  meanResponseTime: number;     // Average time per question
  varianceMultiplier: number;   // How much variance (0.5-2.0)
  readingSpeed: number;         // Words per minute (150-300 for humans)
  thinkTimeMin: number;         // Minimum thinking time
  questionTypeDiffs: boolean;   // Whether to vary by question type
}
```

**Measurement approach:**
- Track per-question response times
- Calculate distribution statistics (mean, median, stddev, skewness)
- Compare to known human baselines
- Test detection at various speed settings

#### Inter-Keystroke Intervals (IKI)

**Signal**: Time between keystrokes in text entry fields

**Human characteristics:**
- Highly variable (50-300ms typical range)
- Longer pauses at word boundaries
- Longer pauses during thinking/composition
- Occasional corrections (backspace patterns)
- Flight time (key up to key down) vs. dwell time (key down to key up)

**Bot risks:**
- Too consistent (robotic typing)
- No pauses at word boundaries
- Perfect typing (no backspaces/corrections)
- Typing speed too fast or too uniform

**Research parameters to vary:**
```typescript
{
  meanIKI: number;              // Average interval (150ms typical)
  ikiVariance: number;          // Variance in intervals
  wordBoundaryPause: number;    // Extra pause at spaces (50-200ms)
  correctionRate: number;       // Probability of typos/corrections (0-0.1)
  burstPauses: boolean;         // Longer pauses mid-composition
}
```

#### Hesitation Patterns

**Signal**: Pauses before submitting answers

**Human characteristics:**
- Longer hesitation on difficult/sensitive questions
- Re-reading question before submitting
- Changing answer before submission
- Hover over submit button before clicking

**Bot risks:**
- No hesitation (instant submission)
- No answer changes
- No re-reading behavior

**Research parameters to vary:**
```typescript
{
  hesitationProbability: number;   // Chance of hesitating (0-1)
  hesitationDuration: number;      // How long to pause (1-5 seconds)
  answerChangeRate: number;        // Probability of changing answer
  rereadProbability: number;       // Chance of scrolling back to question
}
```

#### Page Dwell Time

**Signal**: Total time spent on survey page before any interaction

**Human characteristics:**
- Initial orientation time (reading instructions)
- Scanning the page
- Varies by survey complexity

**Bot risks:**
- Zero dwell time (instant interaction)
- Doesn't scale with page complexity

### 2. Interaction Signals

Mouse, scroll, and click patterns.

#### Mouse Movement Trajectories

**Signal**: Path of mouse cursor from point A to point B

**Human characteristics:**
- Curved paths (Fitts's Law)
- Sub-movements and corrections
- Not perfectly straight
- Speed varies along path
- Occasional random movements

**Bot risks:**
- Perfectly straight lines
- Instant teleportation
- No sub-movements
- Constant velocity
- Mouse appears only when needed (no ambient movement)

**Research parameters to vary:**
```typescript
{
  curvatureLevel: number;          // How curved paths are (0-1)
  subMovements: number;            // Number of corrections per path
  ambientMovement: boolean;        // Random movements when idle
  velocityVariation: number;       // Speed variance along path
  overshootProbability: number;    // Chance of overshooting target
}
```

**Implementation approach:**
- Bézier curves for natural paths
- Perlin noise for micro-adjustments
- Speed profiles (acceleration/deceleration)

#### Scroll Behavior

**Signal**: How user scrolls through survey

**Human characteristics:**
- Smooth scrolling with momentum
- Reading patterns (scroll to read, pause, scroll back)
- Variance in scroll amounts
- Occasional overshooting

**Bot risks:**
- No scrolling (everything visible)
- Instant jumps to elements
- Perfectly measured scrolls
- No back-scrolling (re-reading)

**Research parameters to vary:**
```typescript
{
  scrollStyle: "smooth" | "instant" | "stepped";
  readingScrolls: boolean;         // Scroll to bring text into view
  backScrollProbability: number;   // Chance of scrolling back up
  overshootRate: number;           // Scroll past target, correct
}
```

#### Click Patterns

**Signal**: Precision and variation in click positions

**Human characteristics:**
- Click positions vary slightly (not pixel-perfect)
- Occasional mis-clicks
- Click and hold duration varies
- Sometimes click near target, not center

**Bot risks:**
- Pixel-perfect clicks (always center of button)
- Instant click duration
- No mis-clicks ever
- Clicking on invisible elements (outside viewport)

**Research parameters to vary:**
```typescript
{
  clickPositionJitter: number;     // Pixels of variance from center (0-20)
  clickDurationVariance: number;   // Variance in mouse-down time
  misclickRate: number;            // Probability of clicking wrong element
  targetPreference: "center" | "random" | "realistic";
}
```

#### Focus/Blur Events

**Signal**: Tab navigation and window focus

**Human characteristics:**
- Tab navigation between fields
- Occasional window switching (multitasking)
- Focus/blur event patterns

**Bot risks:**
- No tab navigation (only mouse)
- No focus events (automated form filling)
- Window never loses focus

### 3. Response Pattern Signals

Content-based patterns in survey responses.

#### Attention Check Performance

**Signal**: Success rate on attention check questions

**Human characteristics:**
- Most humans pass (80-95%)
- Some fail due to inattention (5-20%)
- Failure rate higher for low-motivation respondents

**Bot risks:**
- 100% pass rate (too perfect)
- 0% pass rate (not reading)
- Random answering (50% on binary checks)

**Research parameters to vary:**
```typescript
{
  attentionCheckFailRate: number;  // Probability of failing (0-0.3)
  correlateWithSatisficing: boolean; // Higher fail rate for rushers
}
```

#### Response Consistency (Semantic Coherence)

**Signal**: Logical consistency across related questions

**Human characteristics:**
- Mostly consistent
- Occasional contradictions (genuine attitude complexity or inattention)
- Patterns align with stated demographics/attitudes

**Bot risks:**
- Perfect consistency (too coherent)
- Random contradictions (no semantic understanding)
- Inconsistent with stated demographics

**Measurement approach:**
- Embed consistency checks (ask similar questions differently)
- Validate demographic consistency
- Check temporal stability (same question repeated)

#### Straight-Lining Detection

**Signal**: Selecting same response across matrix questions

**Human characteristics:**
- Some straight-lining on tedious matrices
- More common in low-motivation respondents
- Usually broken by occasional variance

**Bot risks:**
- Excessive straight-lining (all same answer)
- Alternating patterns (e.g., 1,2,1,2,1,2)
- No straight-lining (too varied, suspicious for long matrices)

**Research parameters to vary:**
```typescript
{
  straightLineProbability: number;  // Chance of straight-lining matrix (0-1)
  correlateWithSatisficing: boolean;
  breakupRate: number;              // Occasionally vary answer
}
```

#### Position Bias Patterns

**Signal**: Preference for certain option positions

**Human characteristics:**
- Primacy effect (favor first options)
- Recency effect (favor last options)
- Varies by question type and length

**Bot risks:**
- Always selecting first option (extreme primacy)
- Perfectly uniform (no bias at all)
- Obvious patterns (always middle, always last)

**Research parameters to vary:**
```typescript
{
  primacyBias: number;     // Preference for early options (0-1)
  recencyBias: number;     // Preference for late options (0-1)
  middleBias: number;      // Preference for middle options (0-1)
}
```

### 4. Technical Fingerprinting

Browser and device characteristics.

#### Browser/Device Fingerprint Consistency

**Signal**: Stability of technical attributes

**Human characteristics:**
- Consistent browser fingerprint within session
- User-agent, screen resolution, fonts, plugins stay constant
- Timezone matches IP geolocation

**Bot risks:**
- Inconsistent fingerprints (switching contexts)
- Generic/suspicious user-agents ("HeadlessChrome")
- Missing browser features (no plugins, fonts, etc.)
- Timezone mismatches

**Mitigation strategies:**
- Use real browser (Playwright with headed mode)
- Set realistic user-agent
- Consistent viewport size
- Enable browser features (JavaScript, cookies, etc.)

#### WebGL/Canvas Fingerprinting

**Signal**: Rendering signatures from graphics APIs

**Human characteristics:**
- Unique but stable fingerprints based on hardware/drivers
- Canvas rendering produces specific hashes

**Bot risks:**
- Generic/default fingerprints
- Fingerprints that don't match claimed device
- Blocked canvas access

**Mitigation:**
- Use real browser rendering (not spoofed)
- Accept fingerprinting as legitimate device

#### Timezone/Language Consistency

**Signal**: Timezone and language match expected location

**Human characteristics:**
- Timezone aligns with IP geolocation
- Browser language matches location
- Dates/times formatted correctly

**Bot risks:**
- UTC timezone (server timezone)
- English language from non-English IP
- Timezone changes mid-survey

#### VPN/Proxy Detection

**Signal**: IP reputation and network characteristics

**Human characteristics:**
- Residential IP addresses
- Consistent IP throughout survey
- IP geolocation matches claimed location

**Bot risks:**
- Data center IPs
- Known VPN/proxy IPs
- IP changes mid-survey
- IP geolocation mismatch with demographics

**Note:** This is external to bot behavior but important for detection research

## Signal Combination Strategies

Effective bot detection uses **multiple signals** in combination:

### Low-Effort Bot (Easy to Detect)

- Instant response times (< 1 second per question)
- No mouse movement
- No scrolling
- Straight-lining on matrices
- Generic user-agent

### Sophisticated Bot (Hard to Detect)

- Realistic timing distributions
- Natural mouse movements and scrolling
- Semantic response consistency
- Passes attention checks
- Real browser fingerprint

### Deliberate Bot Personas (For Testing)

Create personas that vary along detection difficulty:

1. **Obvious Bot**: All signals are robotic
2. **Moderate Bot**: Realistic timing but poor interaction signals
3. **Sophisticated Bot**: All signals realistic except one weakness
4. **Nearly Human**: All signals realistic (best-case bot)

## Experimental Design

For each detection signal:

1. **Baseline**: Collect human data on signal distribution
2. **Vary parameter**: Create bot personas at different signal levels
3. **Measure detection**: Test against detection methods
4. **Identify threshold**: Find where detection degrades

**Example experiment:**
- IV: Response time distribution (5 levels from instant to very slow)
- DV: Detection accuracy (by Qualtrics, by ML classifier)
- Hypothesis: Detection accuracy decreases as response time approaches human baseline
