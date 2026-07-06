import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { encoding_for_model, type TiktokenModel } from 'tiktoken'
import { logger } from '../logger.ts'

/** @type {number} Default maximum number of messages to retain in history. */
const DEFAULT_MAX_MESSAGES = 50

/** @type {number} Default maximum token budget for conversation history. */
const DEFAULT_MAX_TOKENS = 8000

/** @type {TiktokenModel} Default model used for token counting. */
const DEFAULT_MODEL: TiktokenModel = 'gpt-4o-mini'

/**
 * Manages conversation history for a session, enabling context-aware responses.
 *
 * Maintains an ordered list of messages (system, user, assistant, tool) and
 * automatically prunes older messages when the history exceeds the configured
 * message count or token budget.
 *
 * @class ConversationManager
 */
export class ConversationManager {
  /** @type {ChatCompletionMessageParam[]} */
  private messages: ChatCompletionMessageParam[] = []
  /** @type {number} */
  private maxMessages: number
  /** @type {number} */
  private maxTokens: number
  /** @type {TiktokenModel} */
  private model: TiktokenModel

  /**
   * Creates a ConversationManager instance.
   *
   * @param {string} systemPrompt - The system prompt to initialize the conversation with.
   * @param {object} [options] - Configuration options.
   * @param {number} [options.maxMessages=50] - Maximum number of messages to retain before pruning.
   * @param {number} [options.maxTokens=8000] - Maximum token budget for the conversation history.
   * @param {TiktokenModel} [options.model='gpt-4o-mini'] - Model used for token counting.
   */
  constructor(
    systemPrompt: string,
    options: {
      maxMessages?: number
      maxTokens?: number
      model?: TiktokenModel
    } = {}
  ) {
    this.maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS
    this.model = options.model ?? DEFAULT_MODEL
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
   * Returns the total token count for the current conversation history.
   *
   * @returns {number} The total number of tokens in the conversation.
   */
  getTokenCount(): number {
    return this.countTokens(this.messages)
  }

  /**
   * Counts tokens for a list of messages using tiktoken.
   *
   * @private
   * @param {ChatCompletionMessageParam[]} messages - Messages to count tokens for.
   *
   * @returns {number} Total token count.
   */
  private countTokens(messages: ChatCompletionMessageParam[]): number {
    const enc = encoding_for_model(this.model)
    let total = 0

    for (const msg of messages) {
      // Every message has overhead tokens for role and formatting
      total += 4
      const content = typeof msg.content === 'string' ? msg.content : ''
      total += enc.encode(content).length
    }

    // Every reply is primed with assistant overhead
    total += 2
    enc.free()
    return total
  }

  /**
   * Prunes the conversation history to stay within the configured maximum
   * message count and token budget. Keeps the system message and the most
   * recent messages that fit within limits.
   *
   * @private
   * @returns {void}
   */
  private prune(): void {
    // Message-count pruning
    if (this.messages.length > this.maxMessages) {
      const system = this.messages[0]!
      const recent = this.messages.slice(-(this.maxMessages - 1))
      this.messages = [system, ...recent]
      logger.debug(
        'ConversationManager',
        `Pruned by message count to ${this.messages.length} messages`
      )
    }

    // Token-budget pruning: remove oldest non-system messages until within budget
    while (
      this.messages.length > 1 &&
      this.countTokens(this.messages) > this.maxTokens
    ) {
      this.messages.splice(1, 1)
    }

    if (this.messages.length <= 1) return
    logger.debug(
      'ConversationManager',
      `Token count: ${this.getTokenCount()}/${this.maxTokens}`
    )
  }
}
