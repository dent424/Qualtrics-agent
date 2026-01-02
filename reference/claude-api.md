# Claude API Reference

Quick reference for using Anthropic's Claude API with TypeScript.

## Installation & Setup

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Reads from env variable
});
```

## Basic Message Creation

```typescript
const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: 'Hello, Claude!'
    }
  ]
});

console.log(message.content);
// Output: [{ type: 'text', text: 'Hello! How can I help you today?' }]
```

## Message Format

### Request Structure

```typescript
await client.messages.create({
  model: string,           // Model ID
  max_tokens: number,      // Maximum tokens in response
  messages: Array<{        // Conversation history
    role: 'user' | 'assistant',
    content: string
  }>,
  temperature?: number,    // 0-1, default 1 (randomness)
  system?: string          // System prompt
});
```

### Response Structure

```typescript
{
  id: string,
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: string  // The actual response text
    }
  ],
  model: string,
  stop_reason: 'end_turn' | 'max_tokens',
  usage: {
    input_tokens: number,
    output_tokens: number
  }
}
```

## Common Patterns

### Simple Question & Answer

```typescript
async function askClaude(question: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: question }]
  });

  // Extract text from response
  const textContent = message.content.find(block => block.type === 'text');
  return textContent?.text || '';
}

// Usage
const answer = await askClaude('What is 2+2?');
console.log(answer);  // "4" (or similar response)
```

### With System Prompt

System prompts set context for the entire conversation:

```typescript
const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 500,
  system: 'You are a helpful survey respondent. Answer questions honestly and concisely.',
  messages: [
    {
      role: 'user',
      content: 'What is your age range?'
    }
  ]
});
```

### Conversation History

For multi-turn conversations, include previous messages:

```typescript
const messages = [
  { role: 'user', content: 'My name is John' },
  { role: 'assistant', content: 'Nice to meet you, John!' },
  { role: 'user', content: 'What is my name?' }
];

const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 100,
  messages: messages
});
// Response will reference "John"
```

## Models

Available Claude models (as of 2025):

```typescript
// Latest Sonnet (recommended for most use cases)
model: 'claude-sonnet-4-5-20250929'

// Opus (most capable, slower, more expensive)
model: 'claude-opus-4-5-20251101'

// Haiku (fastest, cheapest, less capable)
model: 'claude-haiku-3-5-20250219'
```

## Parameters

### Temperature

Controls randomness (0-1):

```typescript
temperature: 0.0   // Deterministic, focused
temperature: 0.7   // Balanced (good default)
temperature: 1.0   // Creative, varied
```

### Max Tokens

Maximum length of response:

```typescript
max_tokens: 100    // Short responses
max_tokens: 1024   // Medium responses (good default)
max_tokens: 4096   // Long responses
```

## Error Handling

```typescript
try {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  console.log(message.content[0].text);
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Practical Example: Survey Response Generator

```typescript
async function generateSurveyResponse(
  questionText: string,
  options: string[],
  personaContext: string
): Promise<number> {
  const prompt = `${personaContext}

QUESTION: ${questionText}

OPTIONS:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

Respond with ONLY the number of your chosen option. No explanation.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 10,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].text.trim();
  const selectedOption = parseInt(responseText, 10);

  return selectedOption;
}

// Usage
const personaContext = "You are a 28-year-old marketing manager who values sustainability.";
const question = "How often do you recycle?";
const options = ["Never", "Sometimes", "Often", "Always"];

const choice = await generateSurveyResponse(question, options, personaContext);
console.log(`Selected: ${options[choice - 1]}`);
```

## Best Practices

1. **Set appropriate max_tokens**: Don't request more than needed
2. **Use system prompts**: Better than putting instructions in user messages
3. **Handle rate limits**: Add retry logic for 429 errors
4. **Parse responses carefully**: Extract text from content array
5. **Use temperature wisely**: Lower for consistent outputs, higher for creativity
6. **Store API key securely**: Use environment variables, never hardcode

## Cost Optimization

- Use Haiku for simple tasks (cheaper)
- Use Sonnet for complex reasoning (balanced)
- Keep max_tokens reasonable
- Cache system prompts when possible

## Sources

- [Claude API TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [NPM Package](https://www.npmjs.com/package/@anthropic-ai/sdk)
- [API Documentation](https://docs.anthropic.com/)
- [TypeScript SDK Reference](https://docs.claude.com/en/docs/claude-code/sdk/sdk-typescript)
- [2025 Integration Guide](https://collabnix.com/claude-api-integration-guide-2025-complete-developer-tutorial-with-code-examples/)
