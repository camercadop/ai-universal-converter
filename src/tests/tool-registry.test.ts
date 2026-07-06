import { describe, it, expect, beforeAll } from 'vitest'
import { loadTools, getTool, getAllTools, getAvailableToolNames } from '../tools/tool-registry.ts'

describe('ToolRegistry', () => {
  beforeAll(async () => {
    await loadTools()
  })

  it('discovers at least one tool', () => {
    expect(getAvailableToolNames().length).toBeGreaterThan(0)
  })

  it('every registered tool has a valid schema and execute', () => {
    for (const [name, tool] of getAllTools()) {
      expect(tool.schema.name).toBe(name)
      expect(tool.schema.description).toBeDefined()
      expect(typeof tool.execute).toBe('function')
    }
  })

  it('retrieves a registered tool by name', () => {
    const [name] = getAvailableToolNames()
    expect(getTool(name!)).toBeDefined()
  })

  it('returns undefined for unknown tool', () => {
    expect(getTool('nonExistentTool')).toBeUndefined()
  })
})
