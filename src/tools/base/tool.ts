import type { FunctionDefinition } from 'openai/resources/shared'

/**
 * Abstract base class for all tools exposed to the LLM.
 *
 * Every tool must declare:
 * - A schema describing the OpenAI function definition
 * - An execute method that processes raw JSON arguments from OpenAI
 */
export abstract class Tool {
  /** OpenAI function definition (name, description, parameters). */
  static readonly schema: FunctionDefinition

  /**
   * Executes the tool with the raw JSON arguments string from OpenAI.
   *
   * @param {string} rawArgs - Serialized JSON arguments from the tool call.
   * @returns {number | string} The tool result.
   */
  static execute(rawArgs: string): number | string {
    throw new Error('execute() must be implemented by subclass')
  }
}
