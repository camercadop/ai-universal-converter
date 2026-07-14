# How to Add a New Converter

This guide explains how to add a new unit converter to the system. The tool will be auto-discovered at startup with no manual registration required.

---

## Ratio-Based Converter

Use this approach when all units can be converted through a common base unit using multiplication factors.

### Steps

1. Create a file `src/tools/convert-{type}.ts` (kebab-case).
2. Extend `RatioConverter`.
3. Define `toolDescription` and `FACTORS`.

### Example

```typescript
import { RatioConverter } from './base/ratio-converter.ts'

export class ConvertPressure extends RatioConverter {
  static readonly toolDescription = 'Convert between pressure units.'
  protected static readonly FACTORS: Record<string, number> = {
    'Pa': 1,
    'atm': 101325,
    'bar': 100000,
    'psi': 6894.76,
  }
}
```

### How FACTORS Work

Each entry maps a unit name to how many of the base unit (the one with factor `1`) it represents. Conversion formula:

```
result = value * (fromFactor / toFactor)
```

---

## Formula-Based Converter

Use this approach when conversions require custom formulas (e.g., temperature).

### Steps

1. Create a file `src/tools/convert-{type}.ts`.
2. Extend `BaseConverter`.
3. Define `toolDescription`, the list of supported units, and implement the `convert` method.

### Example

```typescript
import { BaseConverter } from './base/base-converter.ts'

export class ConvertTemperature extends BaseConverter {
  static readonly toolDescription = 'Convert between temperature units.'
  protected static readonly UNITS = ['C', 'F', 'K']

  static convert(value: number, from: string, to: string): number {
    // Custom formula logic
    if (from === 'C' && to === 'F') return value * 9 / 5 + 32
    if (from === 'F' && to === 'C') return (value - 32) * 5 / 9
    // ... other combinations
    return value
  }
}
```

---

## Verification

After creating the file, run:

```bash
npm run dev
```

Then test with a natural language prompt:

```
Convert 1 atm to psi.
```

The tool registry will auto-discover the new converter and make it available to the LLM.
