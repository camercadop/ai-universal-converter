import { describe, it, expect } from 'vitest'
import { ConvertTemperature } from '../tools/convert-temperature.ts'

describe('ConvertTemperature', () => {
  it('converts c to f', () => {
    expect(ConvertTemperature.convert(0, 'c', 'f')).toBe(32)
  })

  it('converts c to k', () => {
    expect(ConvertTemperature.convert(0, 'c', 'k')).toBe(273.15)
  })

  it('converts f to c', () => {
    expect(ConvertTemperature.convert(32, 'f', 'c')).toBe(0)
  })

  it('converts f to k', () => {
    expect(ConvertTemperature.convert(32, 'f', 'k')).toBe(273.15)
  })

  it('converts k to c', () => {
    expect(ConvertTemperature.convert(273.15, 'k', 'c')).toBe(0)
  })

  it('converts k to f', () => {
    expect(ConvertTemperature.convert(273.15, 'k', 'f')).toBe(32)
  })

  it('converts 100c to f', () => {
    expect(ConvertTemperature.convert(100, 'c', 'f')).toBe(212)
  })

  it('returns same value for same unit', () => {
    expect(ConvertTemperature.convert(25, 'c', 'c')).toBe(25)
  })

  it('throws on invalid unit', () => {
    expect(() => ConvertTemperature.convert(0, 'c', 'r')).toThrow('Invalid unit')
  })

  it('throws on invalid value', () => {
    expect(() => ConvertTemperature.convert(NaN, 'c', 'f')).toThrow('Invalid value')
  })
})
