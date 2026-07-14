# How to Add a Standalone Tool

This guide explains how to add a tool that is not a unit converter (e.g., a calculator, formatter, or lookup utility).

---

## Steps

1. Create a file `src/tools/{tool-name}.ts` (kebab-case).
2. Extend the `Tool` abstract class.
3. Define a static `schema` (OpenAI function definition) and a static `execute` method.

---

## Example

```typescript
import type { FunctionDefinition } from 'openai/resources/shared'
import { Tool } from './base/tool.ts'

export class FormatNumber extends Tool {
  static readonly schema: FunctionDefinition = {
    name: 'formatNumber',
    description: 'Format a number with thousand separators and decimal places.',
    parameters: {
      type: 'object',
      properties: {
        value: { type: 'number', description: 'The number to format.' },
        decimals: { type: 'number', description: 'Number of decimal places.' },
      },
      required: ['value'],
    },
  }

  static execute(rawArgs: string): string {
    const { value, decimals = 2 } = JSON.parse(rawArgs)
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
}
```

---

## Contract

| Requirement | Detail |
|---|---|
| `schema` | Must be a valid OpenAI `FunctionDefinition` with `name`, `description`, and `parameters`. |
| `execute` | Receives a raw JSON string. Must parse it internally and return a `number` or `string`. |
| Export | Must be a named export (no default exports). |

---

## Verification

Run the application and test with a prompt that would trigger your tool:

```bash
npm run dev
```

```
Format the number 1500000.5 with 2 decimal places.
```

The tool registry auto-discovers any file in `src/tools/` that satisfies the `Tool` contract.
