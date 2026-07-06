import { describe, it, expect } from 'vitest'
import { ConvertSpeed } from '../tools/convert-speed.ts'

describe('ConvertSpeed', () => {
  it('converts km/h to m/s', () => {
    expect(ConvertSpeed.convert(36, 'km/h', 'm/s')).toBeCloseTo(10, 6)
  })

  it('converts mph to km/h', () => {
    const mps = ConvertSpeed.convert(1, 'mph', 'm/s')
    // 1 mph is approximately 1.60934 km/h
    expect(ConvertSpeed.convert(mps, 'm/s', 'km/h')).toBeCloseTo(1.60934, 5)
  })
})
