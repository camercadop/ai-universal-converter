import { describe, it, expect } from 'vitest'
import { ConvertStorage } from '../tools/convert-storage.ts'

describe('ConvertStorage', () => {
  it('converts kb to b', () => {
    expect(ConvertStorage.convert(1, 'kb', 'b')).toBe(1024)
  })

  it('converts mb to kb', () => {
    expect(ConvertStorage.convert(1, 'mb', 'kb')).toBe(1024)
  })

  it('converts gb to mb', () => {
    expect(ConvertStorage.convert(1, 'gb', 'mb')).toBe(1024)
  })

  it('converts tb to gb', () => {
    expect(ConvertStorage.convert(1, 'tb', 'gb')).toBe(1024)
  })

  it('converts b to mb', () => {
    expect(ConvertStorage.convert(1_048_576, 'b', 'mb')).toBe(1)
  })

  it('converts gb to tb', () => {
    expect(ConvertStorage.convert(1024, 'gb', 'tb')).toBe(1)
  })

  it('returns same value for same unit', () => {
    expect(ConvertStorage.convert(512, 'mb', 'mb')).toBe(512)
  })

  it('throws on invalid unit', () => {
    expect(() => ConvertStorage.convert(1, 'gb', 'pb')).toThrow('Invalid unit')
  })

  it('throws on invalid value', () => {
    expect(() => ConvertStorage.convert(NaN, 'gb', 'mb')).toThrow('Invalid value')
  })
})
