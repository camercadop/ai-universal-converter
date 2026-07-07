import type { FunctionDefinition } from 'openai/resources/shared'

/**
 * Abstract base class for all tools exposed to the LLM.
 *
 * Every tool must declare:
 * - A schema describing the OpenAI function definition
 * - An execute method that processes raw JSON arguments from OpenAI
 * - Keywords for tool selection optimization (optional)
 */
export abstract class Tool {
  /** OpenAI function definition (name, description, parameters). */
  static readonly schema: FunctionDefinition

  /** Keywords that help the tool selection optimizer match user queries to this tool. */
  static readonly keywords: string[] = []

  /** When true, this tool is always included in filtered schemas if any other tool matches. */
  static readonly alwaysInclude: boolean = false

  /**
   * Executes the tool with the raw JSON arguments string from OpenAI.
   *
   * @param {string} rawArgs - Serialized JSON arguments from the tool call.
   *
   * @returns {number | string} The tool result.
   */
  static execute(rawArgs: string): number | string {
    throw new Error('execute() must be implemented by subclass')
  }
}
