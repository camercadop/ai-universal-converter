import { describe, it, expect } from 'vitest'
import { ConvertWeight } from '../tools/convert-weight.ts'

describe('ConvertWeight', () => {
  it('converts kg to lb', () => {
    expect(ConvertWeight.convert(1, 'kg', 'lb')).toBeCloseTo(2.20462, 4)
  })

  it('converts lb to kg', () => {
    expect(ConvertWeight.convert(1, 'lb', 'kg')).toBeCloseTo(0.45359, 4)
  })

  it('converts g to oz', () => {
    expect(ConvertWeight.convert(28.3495, 'g', 'oz')).toBeCloseTo(1, 3)
  })

  it('converts oz to g', () => {
    expect(ConvertWeight.convert(1, 'oz', 'g')).toBeCloseTo(28.3495, 4)
  })

  it('converts kg to ton', () => {
    expect(ConvertWeight.convert(1000, 'kg', 'ton')).toBe(1)
  })

  it('converts mg to g', () => {
    expect(ConvertWeight.convert(1000, 'mg', 'g')).toBe(1)
  })

  it('returns same value for same unit', () => {
    expect(ConvertWeight.convert(5, 'kg', 'kg')).toBe(5)
  })

  it('throws on invalid unit', () => {
    expect(() => ConvertWeight.convert(1, 'kg', 'stone')).toThrow('Invalid unit')
  })

  it('throws on invalid value', () => {
    expect(() => ConvertWeight.convert(NaN, 'kg', 'lb')).toThrow('Invalid value')
  })
})
