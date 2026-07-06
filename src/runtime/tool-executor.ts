import chalk from 'chalk'
import { getTool } from '../tools/tool-registry.ts'
import { logger } from '../logger.ts'

/**
 * Represents an OpenAI tool call input.
 *
 * @interface ToolCallInput
 * @property {string} id - The unique tool call identifier.
 * @property {object} function - The function name and serialized arguments.
 * @property {string} function.name - The function name
 * @property {string} function.arguments - Serialized function arguments
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
 * @property {number | string} result - The tool result or error message.
 */
export interface ToolCallResult {
  tool_call_id: string
  result: number | string
}

/**
 * Executes an OpenAI tool call by dispatching to the appropriate registered tool.
 *
 * Looks up the tool by name in the registry and calls its execute method.
 * Includes comprehensive error handling and logging for debugging.
 *
 * @param {ToolCallInput} toolCall - The tool call to execute, containing the function name and arguments.
 *
 * @returns {ToolCallResult} The execution result or error message with the original tool call ID.
 */
export function executeTool(toolCall: ToolCallInput): ToolCallResult {
  // Extract function name and raw arguments from the tool call
  const { name, arguments: rawArgs } = toolCall.function

  // Look up the tool in the registry
  const tool = getTool(name)
  if (!tool) {
    logger.warn('ToolExecutor', `Unknown tool requested: ${chalk.red(name)}`)
    return { tool_call_id: toolCall.id, result: `Unknown tool: ${name}` }
  }

  try {
    // Log the execution details for debugging and monitoring
    logger.debug('ToolExecutor', `Executing ${chalk.yellow(name)}`, { rawArgs })

    // Execute the tool with the raw arguments
    const result = tool.execute(rawArgs)

    // Log successful execution with the result
    logger.info('ToolExecutor', `${chalk.yellow(name)} → ${chalk.green.bold(String(result))}`)

    // Return the successful result with the original tool call ID
    return { tool_call_id: toolCall.id, result }
  } catch (error) {
    // Handle any errors during argument parsing or execution
    const message = error instanceof Error ? error.message : 'Execution failed'
    logger.error('ToolExecutor', `${chalk.yellow(name)} failed: ${chalk.red(message)}`)
    return { tool_call_id: toolCall.id, result: message }
  }
}
