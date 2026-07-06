import chalk from 'chalk'
import type { z } from 'zod'
import { ConversionEngine } from '../app.ts'
import { LLMRuntime } from '../runtime/llm-runtime.ts'
import { logger } from '../logger.ts'
import { SYSTEM_PROMPT } from './prompts.ts'

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
    this.runtime = model
      ? new LLMRuntime(SYSTEM_PROMPT, model)
      : new LLMRuntime(SYSTEM_PROMPT)
  }

  /**
   * Initializes the conversion engine by loading all available converters.
   *
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    await ConversionEngine.init()
    logger.info('ConverterAgent', `Initialized with types: ${chalk.cyan.bold(ConversionEngine.getAvailableTypes().join(', '))}`)
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

  /**
   * Sends a natural language message and returns a schema-validated structured response.
   *
   * @param {string} message - The user's input message.
   * @param {T} schema - A Zod schema defining the expected response shape.
   * @param {string} name - A name for the response format.
   *
   * @returns {Promise<z.infer<T>>} The validated structured response.
   */
  async askStructured<T extends z.ZodType>(
    message: string,
    schema: T,
    name: string
  ): Promise<z.infer<T>> {
    return this.runtime.structuredChat(message, schema, name)
  }

  /**
   * Resets the conversation history, starting a fresh session.
   *
   * @returns {void}
   */
  resetSession(): void {
    this.runtime.resetSession(SYSTEM_PROMPT)
    logger.info('ConverterAgent', 'Session reset')
  }
}
