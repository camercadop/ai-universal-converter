import chalk from 'chalk'
import { logger } from '../logger.ts'

/**
 * Represents a single step within an execution trace.
 *
 * @interface TraceStep
 * @property {string} name - The step name (e.g. tool name or 'OpenAI Chat').
 * @property {'llm_call' | 'tool_execution' | 'tool_selection'} type - The step category.
 * @property {number} startTime - The high-resolution start timestamp.
 * @property {number} duration - The step duration in milliseconds.
 * @property {Record<string, unknown>} metadata - Additional context (result, cached, tokens).
 */
export interface TraceStep {
  name: string
  type: 'llm_call' | 'tool_execution' | 'tool_selection'
  startTime: number
  duration: number
  metadata: Record<string, unknown>
}

/**
 * Accumulated token usage across all LLM round-trips in a single trace.
 *
 * @interface TokenUsage
 */
export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/**
 * A complete execution trace for a single user request.
 *
 * @interface Trace
 */
export interface Trace {
  traceId: string
  startTime: number
  totalDuration: number
  steps: TraceStep[]
  tokenUsage: TokenUsage
  toolCalls: number
  cacheHits: number
  cacheMisses: number
}

/**
 * Aggregated statistics for a single tool across all requests.
 *
 * @interface ToolStats
 */
export interface ToolStats {
  callCount: number
  totalLatency: number
  avgLatency: number
  cacheHits: number
  failures: number
}

/**
 * Provides full observability into the request lifecycle.
 *
 * Tracks execution traces, latency, token usage, tool statistics,
 * and renders a reasoning visualization tree in the CLI when TRACE=true.
 *
 * @class ObservabilityManager
 */
export class ObservabilityManager {
  private currentTrace: Trace | null = null
  private toolStats = new Map<string, ToolStats>()
  private verbose: boolean

  /**
   * @param {boolean} [verbose] - Enable CLI trace output. Defaults to TRACE=true env var.
   */
  constructor(verbose = process.env.TRACE === 'true') {
    this.verbose = verbose
  }

  /**
   * Starts a new execution trace for the current request.
   *
   * @returns {Trace} The newly created trace object.
   */
  startTrace(): Trace {
    this.currentTrace = {
      traceId: crypto.randomUUID(),
      startTime: performance.now(),
      totalDuration: 0,
      steps: [],
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      toolCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
    }
    return this.currentTrace
  }

  /**
   * Starts timing a step. Returns a function to call when the step completes.
   *
   * @param {string} name - The step name (tool name or 'OpenAI Chat').
   * @param {TraceStep['type']} type - The step category.
   *
   * @returns {(metadata?: Record<string, unknown>) => void} Call this to end the step.
   */
  startStep(
    name: string,
    type: TraceStep['type']
  ): (metadata?: Record<string, unknown>) => void {
    const start = performance.now()
    return (metadata: Record<string, unknown> = {}) => {
      const duration = performance.now() - start
      this.currentTrace?.steps.push({
        name,
        type,
        startTime: start,
        duration,
        metadata,
      })
    }
  }

  /**
   * Records token usage from an OpenAI API response into the current trace.
   *
   * @param usage - The usage object from the OpenAI response.
   */
  recordTokenUsage(
    usage:
      | {
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
        }
      | undefined
  ): void {
    if (!usage || !this.currentTrace) return
    this.currentTrace.tokenUsage.promptTokens += usage.prompt_tokens ?? 0
    this.currentTrace.tokenUsage.completionTokens +=
      usage.completion_tokens ?? 0
    this.currentTrace.tokenUsage.totalTokens += usage.total_tokens ?? 0
  }

  /**
   * Records a tool call for both the current trace and aggregated tool statistics.
   *
   * @param {string} name - The tool name.
   * @param {number} duration - Execution duration in milliseconds.
   * @param {boolean} cached - Whether the result came from cache.
   * @param {boolean} [failed=false] - Whether the execution failed.
   */
  recordToolCall(
    name: string,
    duration: number,
    cached: boolean,
    failed = false
  ): void {
    if (this.currentTrace) {
      this.currentTrace.toolCalls++
      if (cached) this.currentTrace.cacheHits++
      else this.currentTrace.cacheMisses++
    }

    const stats = this.toolStats.get(name) ?? {
      callCount: 0,
      totalLatency: 0,
      avgLatency: 0,
      cacheHits: 0,
      failures: 0,
    }
    stats.callCount++
    if (!cached) stats.totalLatency += duration
    stats.avgLatency = stats.totalLatency / (stats.callCount - stats.cacheHits)
    if (cached) stats.cacheHits++
    if (failed) stats.failures++
    this.toolStats.set(name, stats)
  }

  /**
   * Ends the current trace, calculates total duration, and prints the
   * reasoning visualization if verbose mode is enabled.
   *
   * @returns {Trace | null} The completed trace, or null if no trace was active.
   */
  endTrace(): Trace | null {
    if (!this.currentTrace) return null
    this.currentTrace.totalDuration =
      performance.now() - this.currentTrace.startTime

    if (this.verbose) this.printTrace(this.currentTrace)

    const trace = this.currentTrace
    this.currentTrace = null
    return trace
  }

  /**
   * Returns aggregated tool statistics across all requests.
   *
   * @returns {Map<string, ToolStats>} Per-tool metrics.
   */
  getToolStats(): Map<string, ToolStats> {
    return this.toolStats
  }

  /**
   * Prints the reasoning visualization tree to the CLI.
   * Shows each step with icon, duration, cache status, and result.
   */
  private printTrace(trace: Trace): void {
    const lines: string[] = [
      `┌ ${chalk.bold('Trace')} ${chalk.dim(trace.traceId.slice(0, 8))}`,
    ]

    for (const step of trace.steps) {
      const icon =
        step.type === 'llm_call'
          ? '🤖'
          : step.type === 'tool_execution'
            ? '🔧'
            : '🎯'
      const dur = chalk.dim(`(${step.duration.toFixed(0)}ms)`)
      const meta = step.metadata.result
        ? ` → ${chalk.green(String(step.metadata.result))}`
        : ''
      const cache = step.metadata.cached ? chalk.magenta(' [cached]') : ''
      lines.push(`├─ ${icon} ${chalk.yellow(step.name)} ${dur}${cache}${meta}`)
    }

    const { tokenUsage: t } = trace
    lines.push(
      `└ ${chalk.bold('Total')}: ${trace.totalDuration.toFixed(0)}ms | ${t.totalTokens} tokens (${t.promptTokens}↑ ${t.completionTokens}↓) | ${trace.toolCalls} tool calls` +
        (trace.cacheHits ? ` | ${trace.cacheHits} cache hits` : '')
    )

    logger.info('Trace', lines.join('\n'))
  }
}
