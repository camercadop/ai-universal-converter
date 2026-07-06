import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { logger } from '../logger.ts'

/** @type {number} Default maximum number of messages to retain in history. */
const DEFAULT_MAX_MESSAGES = 50

/**
 * Manages conversation history for a session, enabling context-aware responses.
 *
 * Maintains an ordered list of messages (system, user, assistant, tool) and
 * automatically prunes older messages when the history exceeds the configured limit.
 *
 * @class ConversationManager
 */
export class ConversationManager {
  /** @type {ChatCompletionMessageParam[]} */
  private messages: ChatCompletionMessageParam[] = []
  /** @type {number} */
  private maxMessages: number

  /**
   * Creates a ConversationManager instance.
   *
   * @param {string} systemPrompt - The system prompt to initialize the conversation with.
   * @param {number} [maxMessages=50] - Maximum number of messages to retain before pruning.
   */
  constructor(systemPrompt: string, maxMessages = DEFAULT_MAX_MESSAGES) {
    this.maxMessages = maxMessages
    this.messages = [{ role: 'system', content: systemPrompt }]
  }

  /**
   * Returns the full conversation history.
   *
   * @returns {ChatCompletionMessageParam[]} The current message history.
   */
  getMessages(): ChatCompletionMessageParam[] {
    return this.messages
  }

  /**
   * Adds a single message to the conversation history.
   *
   * @param {ChatCompletionMessageParam} message - The message to add.
   *
   * @returns {void}
   */
  addMessage(message: ChatCompletionMessageParam): void {
    this.messages.push(message)
    this.prune()
  }

  /**
   * Adds multiple messages to the conversation history at once.
   *
   * @param {ChatCompletionMessageParam[]} messages - The messages to add.
   *
   * @returns {void}
   */
  addMessages(messages: ChatCompletionMessageParam[]): void {
    this.messages.push(...messages)
    this.prune()
  }

  /**
   * Clears the conversation history and resets with a new system prompt.
   *
   * @param {string} systemPrompt - The system prompt to reinitialize with.
   *
   * @returns {void}
   */
  clear(systemPrompt: string): void {
    this.messages = [{ role: 'system', content: systemPrompt }]
    logger.info('ConversationManager', 'Session cleared')
  }

  /**
   * Prunes the conversation history to stay within the configured maximum.
   * Keeps the system message and the most recent messages.
   *
   * @private
   * @returns {void}
   */
  private prune(): void {
    if (this.messages.length <= this.maxMessages) return

    // Keep system message + most recent messages
    const system = this.messages[0]!
    const recent = this.messages.slice(-(this.maxMessages - 1))
    this.messages = [system, ...recent]
    logger.debug('ConversationManager', `Pruned to ${this.messages.length} messages`)
  }
}
