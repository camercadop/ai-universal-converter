import chalk from 'chalk'
import { ConversionEngine } from '../app.ts'
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
 * @property {number | string} result - The conversion result or error message.
 */
export interface ToolCallResult {
  tool_call_id: string
  result: number | string
}

/**
 * Executes an OpenAI tool call by dispatching to the local ConversionEngine.
 *
 * This function processes OpenAI function call requests, validates the tool type,
 * parses the arguments, and executes the conversion using the ConversionEngine.
 * It includes comprehensive error handling and logging for debugging.
 *
 * @param {ToolCallInput} toolCall - The tool call to execute, containing the function name and arguments.
 *
 * @returns {ToolCallResult} The execution result or error message with the original tool call ID.
 */
export function executeTool(toolCall: ToolCallInput): ToolCallResult {
  // Extract function name and raw arguments from the tool call
  const { name, arguments: rawArgs } = toolCall.function

  // Derive the converter type from the function name (e.g., "convertDistance" -> "distance")
  const type = name.replace('convert', '').toLowerCase()

  // Validate that the requested tool type is available in the ConversionEngine
  if (!ConversionEngine.getAvailableTypes().includes(type)) {
    logger.warn('ToolExecutor', `Unknown tool requested: ${chalk.red(name)}`)
    return { tool_call_id: toolCall.id, result: `Unknown tool: ${name}` }
  }

  try {
    // Parse the JSON arguments from the OpenAI tool call
    const { value, from, to } = JSON.parse(rawArgs) as {
      value: number
      from: string
      to: string
    }

    // Log the execution details for debugging and monitoring
    logger.debug('ToolExecutor', `Executing ${chalk.yellow(name)}`, {
      value,
      from,
      to,
    })

    // Perform the actual conversion using the ConversionEngine
    const result = ConversionEngine.convert(type, value, from, to)

    // Log successful execution with the result
    logger.info(
      'ToolExecutor',
      `${chalk.yellow(name)} → ${chalk.green.bold(String(result))}`
    )

    // Return the successful result with the original tool call ID
    return { tool_call_id: toolCall.id, result }
  } catch (error) {
    // Handle any errors during argument parsing or conversion execution
    const message = error instanceof Error ? error.message : 'Execution failed'
    logger.error(
      'ToolExecutor',
      `${chalk.yellow(name)} failed: ${chalk.red(message)}`
    )
    return { tool_call_id: toolCall.id, result: message }
  }
}
