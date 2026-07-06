import { describe, it, expect } from 'vitest'
import { ConvertArea } from '../tools/convert-area.ts'

describe('ConvertArea', () => {
  it('converts m2 to km2', () => {
    expect(ConvertArea.convert(1_000_000, 'm2', 'km2')).toBeCloseTo(1, 6)
  })

  it('converts acre to m2', () => {
    expect(ConvertArea.convert(1, 'acre', 'm2')).toBeCloseTo(4046.8564224, 6)
  })
})
