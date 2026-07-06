import { describe, it, expect, beforeAll } from 'vitest'
import { ConversionEngine } from '../app.ts'
import { executeTool } from '../runtime/tool-executor.ts'

beforeAll(async () => {
  await ConversionEngine.init()
})

describe('multi-tool execution', () => {
  it('chains two conversions (km -> mi -> ft)', () => {
    const step1 = executeTool({
      id: 't1',
      function: {
        name: 'convertDistance',
        arguments: JSON.stringify({ value: 10, from: 'km', to: 'mi' }),
      },
    })

    expect(typeof step1.result).toBe('number')
    const step2 = executeTool({
      id: 't2',
      function: {
        name: 'convertDistance',
        arguments: JSON.stringify({
          value: step1.result,
          from: 'mi',
          to: 'ft',
        }),
      },
    })

    // 10 km in feet ≈ 32808.39895
    expect(step2.result).toBeCloseTo(32808.39895, 4)
  })
})
