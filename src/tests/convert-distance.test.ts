import { describe, it, expect } from 'vitest'
import { ConvertDistance } from '../tools/convert-distance.ts'

describe('ConvertDistance', () => {
  it('converts km to mi', () => {
    expect(ConvertDistance.convert(1, 'km', 'mi')).toBeCloseTo(0.62137, 5)
  })

  it('converts mi to km', () => {
    expect(ConvertDistance.convert(1, 'mi', 'km')).toBeCloseTo(1.60934, 5)
  })

  it('converts m to ft', () => {
    expect(ConvertDistance.convert(1, 'm', 'ft')).toBeCloseTo(3.28084, 5)
  })

  it('converts ft to m', () => {
    expect(ConvertDistance.convert(1, 'ft', 'm')).toBeCloseTo(0.3048, 5)
  })

  it('converts cm to in', () => {
    expect(ConvertDistance.convert(2.54, 'cm', 'in')).toBeCloseTo(1, 5)
  })

  it('converts yd to m', () => {
    expect(ConvertDistance.convert(1, 'yd', 'm')).toBeCloseTo(0.9144, 5)
  })

  it('converts mm to cm', () => {
    expect(ConvertDistance.convert(10, 'mm', 'cm')).toBeCloseTo(1, 5)
  })

  it('returns same value for same unit', () => {
    expect(ConvertDistance.convert(42, 'km', 'km')).toBe(42)
  })

  it('throws on invalid unit', () => {
    expect(() => ConvertDistance.convert(1, 'km', 'lightyear')).toThrow('Invalid unit')
  })

  it('throws on invalid value', () => {
    expect(() => ConvertDistance.convert(NaN, 'km', 'mi')).toThrow('Invalid value')
  })
})
