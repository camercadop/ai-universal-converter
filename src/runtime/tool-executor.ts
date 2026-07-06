import chalk from 'chalk'
import { ConversionEngine } from '../app.ts'
import { logger } from '../logger.ts'

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
    logger.warn('ToolExecutor', `Unknown tool requested: ${chalk.red(name)}`)
    return { tool_call_id: toolCall.id, result: `Unknown tool: ${name}` }
  }

  try {
    const { value, from, to } = JSON.parse(rawArgs) as {
      value: number
      from: string
      to: string
    }
    logger.debug('ToolExecutor', `Executing ${chalk.yellow(name)}`, { value, from, to })
    const result = ConversionEngine.convert(type, value, from, to)
    logger.info('ToolExecutor', `${chalk.yellow(name)} → ${chalk.green.bold(String(result))}`)
    return { tool_call_id: toolCall.id, result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Execution failed'
    logger.error('ToolExecutor', `${chalk.yellow(name)} failed: ${chalk.red(message)}`)
    return { tool_call_id: toolCall.id, result: message }
  }
}
