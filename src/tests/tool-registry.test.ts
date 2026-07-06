import { describe, it, expect, beforeAll } from 'vitest'
import { loadConverters, getConverter, getAvailableConverters } from '../tools/tool-registry.ts'

describe('ToolRegistry', () => {
  beforeAll(async () => {
    await loadConverters()
  })

  it('discovers all converters', () => {
    const available = getAvailableConverters()
    expect(available).toContain('distance')
    expect(available).toContain('weight')
    expect(available).toContain('storage')
    expect(available).toContain('temperature')
  })

  it('retrieves a converter by name', () => {
    const converter = getConverter('distance')
    expect(converter).toBeDefined()
    expect(converter!.convert(1, 'km', 'm')).toBe(1000)
  })

  it('returns undefined for unknown converter', () => {
    expect(getConverter('unknown')).toBeUndefined()
  })
})
