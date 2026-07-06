import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getAllConverters } from '../tools/tool-registry.ts'

/**
 * Dynamically generates OpenAI tool schemas from all registered converters.
 */
export function buildToolSchemas(): ChatCompletionTool[] {
  return [...getAllConverters().entries()].map(([name, converter]) => ({
    type: 'function' as const,
    function: {
      name: `convert${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      description: converter.toolDescription,
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'The numeric value to convert.' },
          from: { type: 'string', enum: converter.units(), description: 'Source unit.' },
          to: { type: 'string', enum: converter.units(), description: 'Target unit.' },
        },
        required: ['value', 'from', 'to'],
      },
    },
  }))
}
