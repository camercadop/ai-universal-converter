import { describe, it, expect } from 'vitest'
import { ConvertVolume } from '../tools/convert-volume.ts'

describe('ConvertVolume', () => {
  it('converts l to m3', () => {
    expect(ConvertVolume.convert(1000, 'l', 'm3')).toBeCloseTo(1, 6)
  })

  it('converts us-gal to l', () => {
    expect(ConvertVolume.convert(1, 'us-gal', 'l')).toBeCloseTo(3.785411784, 9)
  })
})
