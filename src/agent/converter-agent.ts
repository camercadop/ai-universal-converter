import { ConversionEngine } from '../app.ts'
import { LLMRuntime } from '../runtime/llm-runtime.ts'

/**
 * High-level agent that initializes the conversion engine and exposes a chat interface.
 *
 * @class ConverterAgent
 */
export class ConverterAgent {
  /** @type {LLMRuntime} */
  private runtime: LLMRuntime

  /**
   * Creates a ConverterAgent instance.
   *
   * @param {string} [model] - The OpenAI model to use.
   */
  constructor(model?: string) {
    this.runtime = new LLMRuntime(model)
  }

  /**
   * Initializes the conversion engine by loading all available converters.
   *
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    await ConversionEngine.init()
  }

  /**
   * Sends a natural language message and returns the assistant's response.
   *
   * @param {string} message - The user's input message.
   *
   * @returns {Promise<string>} The assistant's response.
   */
  async ask(message: string): Promise<string> {
    return this.runtime.chat(message)
  }
}
