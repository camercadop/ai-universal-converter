import type { ChatCompletionTool } from 'openai/resources/chat/completions'
import { getAllTools } from '../tools/tool-registry.ts'

/**
 * Dynamically generates OpenAI tool schemas from all registered tools.
 *
 * Each tool declares its own schema, so this function simply wraps them
 * in the ChatCompletionTool format expected by the OpenAI API.
 *
 * @returns {ChatCompletionTool[]} Array of ChatCompletionTool objects that can be passed to OpenAI API.
 */
export function buildToolSchemas(): ChatCompletionTool[] {
  return [...getAllTools().values()].map((tool) => ({
    type: 'function' as const,
    function: tool.schema,
  }))
}

/**
 * Returns a filtered subset of tool schemas relevant to the user message.
 *
 * Each tool declares its own keywords. This function matches the user's input
 * against those keywords to determine which tools are likely needed.
 * Always includes `calculate` when any tool matches (for compound queries).
 * Falls back to all schemas when no keywords match.
 *
 * @param {string} userMessage - The user's natural language input.
 *
 * @returns {ChatCompletionTool[]} Filtered array of relevant tool schemas.
 */
export function buildFilteredToolSchemas(
  userMessage: string
): ChatCompletionTool[] {
  const msg = userMessage.toLowerCase()
  const allTools = getAllTools()

  const matched = new Set<string>()

  for (const [name, tool] of allTools) {
    // Infer domain keyword from schema name (e.g. 'convertDistance' → 'distance')
    const domain = name.replace('convert', '').toLowerCase()
    const keywords = [...(tool.keywords ?? []), ...(domain ? [domain] : [])]
    if (keywords.length > 0 && keywords.some((kw) => msg.includes(kw))) {
      matched.add(name)
    }
  }

  // Include tools marked as alwaysInclude when any other tool matched
  if (matched.size > 0) {
    for (const [name, tool] of allTools) {
      if (tool.alwaysInclude) matched.add(name)
    }
  }

  // Fallback: if nothing matched, send all tools
  if (matched.size === 0) {
    return buildToolSchemas()
  }

  return [...allTools.entries()]
    .filter(([name]) => matched.has(name))
    .map(([, tool]) => ({
      type: 'function' as const,
      function: tool.schema,
    }))
}
