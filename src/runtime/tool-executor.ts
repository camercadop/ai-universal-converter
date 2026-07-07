import chalk from 'chalk'
import { getTool } from '../tools/tool-registry.ts'
import { logger } from '../logger.ts'
import { ToolCache } from './tool-cache.ts'
import type { ObservabilityManager } from './observability.ts'

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

const cache = new ToolCache()

/**
 * Executes an OpenAI tool call by dispatching to the appropriate registered tool.
 *
 * Includes caching for deterministic results and observability hooks
 * for latency tracking and tool statistics.
 *
 * @param {ToolCallInput} toolCall - The tool call to execute, containing the function name and arguments.
 * @param {ObservabilityManager} [observability] - Optional observability manager for tracing.
 *
 * @returns {ToolCallResult} The execution result or error message with the original tool call ID.
 */
export function executeTool(
  toolCall: ToolCallInput,
  observability?: ObservabilityManager
): ToolCallResult {
  // Extract function name and raw arguments from the tool call
  const { name, arguments: rawArgs } = toolCall.function
  const start = performance.now()

  // Look up the tool in the registry
  const tool = getTool(name)
  if (!tool) {
    logger.warn('ToolExecutor', `Unknown tool requested: ${chalk.red(name)}`)
    observability?.recordToolCall(name, 0, false, true)

    return { tool_call_id: toolCall.id, result: `Unknown tool: ${name}` }
  }

  // Check cache for previously computed results (deterministic tools)
  const cached = cache.get(name, rawArgs)
  if (cached.hit) {
    const duration = performance.now() - start
    logger.debug(
      'ToolExecutor',
      `${chalk.yellow(name)} → ${chalk.magenta('[cached]')} ${chalk.green.bold(String(cached.result))}`
    )

    const endStep = observability?.startStep(name, 'tool_execution')
    endStep?.({ result: cached.result, cached: true })
    observability?.recordToolCall(name, duration, true)

    return { tool_call_id: toolCall.id, result: cached.result! }
  }

  try {
    // Execute the tool and record observability step
    const endStep = observability?.startStep(name, 'tool_execution')
    const result = tool.execute(rawArgs)
    const duration = performance.now() - start

    // Cache the result for future identical calls
    cache.set(name, rawArgs, result)

    // Log successful execution with the result
    logger.info(
      'ToolExecutor',
      `${chalk.yellow(name)} → ${chalk.green.bold(String(result))}`
    )
    endStep?.({ result, cached: false })
    observability?.recordToolCall(name, duration, false)

    return { tool_call_id: toolCall.id, result }
  } catch (error) {
    // Handle any errors during argument parsing or execution
    const duration = performance.now() - start
    const message = error instanceof Error ? error.message : 'Execution failed'
    logger.error(
      'ToolExecutor',
      `${chalk.yellow(name)} failed: ${chalk.red(message)}`
    )
    observability?.recordToolCall(name, duration, false, true)
    return { tool_call_id: toolCall.id, result: message }
  }
}

/**
 * Clears the tool result cache. Useful for testing or session resets.
 */
export function clearToolCache(): void {
  cache.clear()
}
