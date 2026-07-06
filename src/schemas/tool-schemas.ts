import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getAllConverters } from '../tools/tool-registry.ts'

/**
 * Dynamically generates OpenAI tool schemas from all registered converters.
 *
 * This function creates OpenAI-compatible function call schemas for each converter,
 * enabling the LLM to dynamically call conversion functions based on available tools.
 *
 * @returns Array of ChatCompletionTool objects that can be passed to OpenAI API
 */
export function buildToolSchemas(): ChatCompletionTool[] {
  // Get all registered converters and convert entries to array for mapping
  const converters = [...getAllConverters().entries()]

  // Map each converter to an OpenAI function schema
  return converters.map(([name, converter]) => ({
    type: 'function' as const,
    function: {
      // Generate function name: convert + capitalized converter name (e.g., convertDistance)
      name: `convert${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      // Use the converter's description for the function purpose
      description: converter.toolDescription,
      // Define the function parameters schema
      parameters: {
        type: 'object',
        properties: {
          // The numeric value to be converted
          value: {
            type: 'number',
            description: 'The numeric value to convert.',
          },
          // Source unit from the converter's available units
          from: {
            type: 'string',
            enum: converter.units(),
            description: 'Source unit.',
          },
          // Target unit from the converter's available units
          to: {
            type: 'string',
            enum: converter.units(),
            description: 'Target unit.',
          },
        },
        // All three parameters are required for the conversion
        required: ['value', 'from', 'to'],
      },
    },
  }))
}
