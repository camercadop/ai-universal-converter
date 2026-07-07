import { describe, it, expect, beforeAll } from 'vitest'
import { loadTools } from '../tools/tool-registry.ts'
import { executeTool } from '../runtime/tool-executor.ts'
import { buildToolSchemas } from '../schemas/tool-schemas.ts'

beforeAll(async () => {
  await loadTools()
})

describe('tool-schemas', () => {
  it('should define expected tool schemas', () => {
    const toolSchemas = buildToolSchemas()
    // 9 converters + calculate = 10
    expect(toolSchemas).toHaveLength(10)
  })

  it('each schema should have required structure', () => {
    const toolSchemas = buildToolSchemas()
    for (const schema of toolSchemas) {
      expect(schema.type).toBe('function')
      const fn = (schema as { type: 'function'; function: { name: string; parameters: unknown } }).function
      expect(fn.name).toBeDefined()
      expect(fn.parameters).toBeDefined()
    }
  })
})

describe('tool-executor', () => {
  it('should execute convertDistance', () => {
    const result = executeTool({
      id: 'call_1',
      function: {
        name: 'convertDistance',
        arguments: '{"value":50,"from":"km","to":"mi"}',
      },
    })
    expect(result.tool_call_id).toBe('call_1')
    expect(result.result).toBeCloseTo(31.06856, 4)
  })

  it('should execute convertWeight', () => {
    const result = executeTool({
      id: 'call_2',
      function: {
        name: 'convertWeight',
        arguments: '{"value":1,"from":"kg","to":"lb"}',
      },
    })
    expect(result.result).toBeCloseTo(2.20462, 4)
  })

  it('should execute convertTemperature', () => {
    const result = executeTool({
      id: 'call_3',
      function: {
        name: 'convertTemperature',
        arguments: '{"value":100,"from":"c","to":"f"}',
      },
    })
    expect(result.result).toBe(212)
  })

  it('should execute convertStorage', () => {
    const result = executeTool({
      id: 'call_4',
      function: {
        name: 'convertStorage',
        arguments: '{"value":1,"from":"gb","to":"mb"}',
      },
    })
    expect(result.result).toBe(1024)
  })

  it('should execute calculate', () => {
    const result = executeTool({
      id: 'call_5',
      function: {
        name: 'calculate',
        arguments: '{"expression":"350 / 100 * 8"}',
      },
    })
    expect(result.result).toBe(28)
  })

  it('should return error for unknown tool', () => {
    const result = executeTool({
      id: 'call_6',
      function: { name: 'unknownTool', arguments: '{}' },
    })
    expect(result.result).toBe('Unknown tool: unknownTool')
  })

  it('should return error for invalid arguments', () => {
    const result = executeTool({
      id: 'call_7',
      function: {
        name: 'convertDistance',
        arguments: '{"value":10,"from":"km","to":"xyz"}',
      },
    })
    expect(result.result).toContain('Invalid unit')
  })
})
