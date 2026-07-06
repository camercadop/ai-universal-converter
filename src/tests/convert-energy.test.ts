import { describe, it, expect } from 'vitest'
import { ConvertEnergy } from '../tools/convert-energy.ts'

describe('ConvertEnergy', () => {
  it('converts kJ to J', () => {
    expect(ConvertEnergy.convert(1, 'kj', 'j')).toBe(1000)
  })

  it('converts kcal to kJ', () => {
    expect(ConvertEnergy.convert(1, 'kcal', 'kj')).toBeCloseTo(4.184, 6)
  })
})
