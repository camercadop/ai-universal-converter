# How to Write Tests

This guide explains how to write tests following the project's conventions.

---

## Test Framework

The project uses **Vitest**. Tests live in `src/tests/` with a `.test.ts` suffix.

---

## Running Tests

```bash
npm test
```

---

## Conventions

- Test files are colocated in `src/tests/` (not next to source files).
- File naming: `{module-name}.test.ts` (kebab-case).
- Test both happy paths and error cases.
- Use `toBeCloseTo` for floating-point assertions (avoid exact equality on decimals).
- Do not mock external services unless strictly necessary for isolation.

---

## Example: Testing a Converter

```typescript
import { describe, it, expect } from 'vitest'
import { ConvertPressure } from '../tools/convert-pressure.ts'

describe('ConvertPressure', () => {
  it('converts atm to Pa', () => {
    const result = ConvertPressure.execute(
      JSON.stringify({ value: 1, from: 'atm', to: 'Pa' })
    )
    expect(result).toBeCloseTo(101325, 0)
  })

  it('converts psi to bar', () => {
    const result = ConvertPressure.execute(
      JSON.stringify({ value: 14.5, from: 'psi', to: 'bar' })
    )
    expect(result).toBeCloseTo(0.9997, 2)
  })

  it('returns same value for identical units', () => {
    const result = ConvertPressure.execute(
      JSON.stringify({ value: 42, from: 'bar', to: 'bar' })
    )
    expect(result).toBe(42)
  })

  it('throws on unsupported unit', () => {
    expect(() =>
      ConvertPressure.execute(
        JSON.stringify({ value: 1, from: 'atm', to: 'invalid' })
      )
    ).toThrow()
  })
})
```

---

## What to Test

| Category | Guideline |
|---|---|
| Converters | Test at least one conversion per direction, identity conversion, and invalid unit handling. |
| Standalone tools | Test valid input, edge cases, and malformed input. |
| Runtime modules | Test public method contracts; avoid testing internal implementation details. |

---

## Floating-Point Precision

Always use `toBeCloseTo` with an appropriate number of decimal places:

```typescript
expect(result).toBeCloseTo(62.137, 2)
```

The second argument is the number of significant decimal digits to check.
