import { describe, it, expect } from 'vitest'
import {
  ConversionResponseSchema,
  type ConversionResponse,
} from '../schemas/response-schemas.ts'

describe('ConversionResponseSchema', () => {
  it('parses a valid conversion response', () => {
    const input = {
      from: { value: 50, unit: 'km' },
      to: { value: 31.0686, unit: 'mi' },
      explanation: '50 kilometers equals approximately 31.07 miles.',
    }

    const result = ConversionResponseSchema.parse(input)
    expect(result).toEqual(input)
  })

  it('rejects missing fields', () => {
    const input = { from: { value: 50, unit: 'km' } }
    expect(() => ConversionResponseSchema.parse(input)).toThrow()
  })

  it('rejects invalid types', () => {
    const input = {
      from: { value: 'fifty', unit: 'km' },
      to: { value: 31, unit: 'mi' },
      explanation: 'test',
    }
    expect(() => ConversionResponseSchema.parse(input)).toThrow()
  })

  it('infers the correct TypeScript type', () => {
    const valid: ConversionResponse = {
      from: { value: 100, unit: 'C' },
      to: { value: 212, unit: 'F' },
      explanation: '100°C equals 212°F.',
    }
    expect(ConversionResponseSchema.parse(valid)).toEqual(valid)
  })
})
