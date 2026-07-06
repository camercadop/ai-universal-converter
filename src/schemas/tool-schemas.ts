import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getAllTools } from '../tools/tool-registry.ts'

/**
 * Dynamically generates OpenAI tool schemas from all registered tools.
 *
 * Each tool declares its own schema, so this function simply wraps them
 * in the ChatCompletionTool format expected by the OpenAI API.
 *
 * @returns {ChatCompletionTool[]} Array of ChatCompletionTool objects that can be passed to OpenAI API
 */
export function buildToolSchemas(): ChatCompletionTool[] {
  return [...getAllTools().values()].map((tool) => ({
    type: 'function' as const,
    function: tool.schema,
  }))
}
