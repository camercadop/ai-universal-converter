import { ConversionEngine } from '../app.ts'

/**
 * Represents an OpenAI tool call input.
 *
 * @interface ToolCallInput
 * @property {string} id - The unique tool call identifier.
 * @property {object} function - The function name and serialized arguments.
 */
export interface ToolCallInput {
  id: string
  function: { name: string; arguments: string }
}

/**
 * Represents the result of a tool execution.
 *
 * @interface ToolCallResult
 * @property {string} tool_call_id - The original tool call identifier.
 * @property {number | string} result - The conversion result or error message.
 */
export interface ToolCallResult {
  tool_call_id: string
  result: number | string
}

/**
 * Executes an OpenAI tool call by dispatching to the local ConversionEngine.
 *
 * @param {ToolCallInput} toolCall - The tool call to execute.
 * @returns {ToolCallResult} The execution result or error message.
 */
export function executeTool(toolCall: ToolCallInput): ToolCallResult {
  const { name, arguments: rawArgs } = toolCall.function
  const type = name.replace('convert', '').toLowerCase()

  if (!ConversionEngine.getAvailableTypes().includes(type)) {
    return { tool_call_id: toolCall.id, result: `Unknown tool: ${name}` }
  }

  try {
    const { value, from, to } = JSON.parse(rawArgs) as {
      value: number
      from: string
      to: string
    }
    const result = ConversionEngine.convert(type, value, from, to)
    return { tool_call_id: toolCall.id, result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Execution failed'
    return { tool_call_id: toolCall.id, result: message }
  }
}
