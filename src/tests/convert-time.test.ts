import { describe, it, expect } from 'vitest'
import { ConvertTime } from '../tools/convert-time.ts'

describe('ConvertTime', () => {
  it('converts h to min', () => {
    expect(ConvertTime.convert(1, 'h', 'min')).toBe(60)
  })

  it('converts day to h', () => {
    expect(ConvertTime.convert(1, 'day', 'h')).toBe(24)
  })
})
