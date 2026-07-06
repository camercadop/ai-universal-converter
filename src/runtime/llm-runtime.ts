import 'dotenv/config'
import OpenAI from 'openai'
import chalk from 'chalk'
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from 'openai/resources/chat/completions'
import { buildToolSchemas } from '../schemas/tool-schemas.ts'
import { executeTool, type ToolCallInput } from './tool-executor.ts'
import { logger } from '../logger.ts'

/** @type {string} System prompt for the conversion assistant. */
const SYSTEM_PROMPT =
  'You are a unit conversion assistant. Use the provided tools to perform conversions. Be concise in your responses.'

/**
 * Wraps the OpenAI Chat Completions API with tool-calling support.
 *
 * @class LLMRuntime
 */
export class LLMRuntime {
  /** @type {OpenAI} */
  private client: OpenAI
  /** @type {string} */
  private model: string

  /**
   * Creates an LLMRuntime instance.
   *
   * @param {string} [model='gpt-4o-mini'] - The OpenAI model to use.
   */
  constructor(model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini') {
    this.client = new OpenAI()
    this.model = model
  }

  /**
   * Sends a user message to OpenAI and resolves tool calls until a final response is produced.
   *
   * This method implements a conversation loop that:
   * 1. Sends the current message history to OpenAI
   * 2. Checks if the response contains tool calls
   * 3. If tool calls are present, executes them and adds results to the conversation
   * 4. Repeats until OpenAI provides a final text response without tool calls
   * 5. Returns the final assistant response
   *
   * @param {string} userMessage - The user's natural language input.
   *
   * @returns {Promise<string>} The assistant's final text response.
   */
  async chat(userMessage: string): Promise<string> {
    logger.info('LLMRuntime', `User message received`, {
      length: userMessage.length,
    })
    logger.debug('LLMRuntime', `System prompt: ${chalk.dim(SYSTEM_PROMPT)}`)
    logger.debug('LLMRuntime', `User prompt: ${chalk.white(userMessage)}`)

    // Initialize the message history with system and user messages
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]

    // Main conversation loop - continues until we get a final text response
    while (true) {
      // Log the request being sent to OpenAI for debugging
      logger.debug('LLMRuntime', `Sending request to OpenAI`, {
        model: this.model,
        messageCount: messages.length,
      })

      // Send the conversation to OpenAI with available tool schemas
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: buildToolSchemas(),
      })

      // Extract the first choice from the response
      const choice = response.choices[0]!
      const assistantMessage = choice.message

      // Add the assistant's response to the conversation history
      messages.push(assistantMessage)

      // Check if the response contains tool calls that need to be executed
      if (
        choice.finish_reason === 'tool_calls' &&
        assistantMessage.tool_calls
      ) {
        // Log which tools were requested for monitoring
        logger.info(
          'LLMRuntime',
          `Tool calls requested: ${chalk.yellow.bold(assistantMessage.tool_calls.map((tc) => (tc as ToolCallInput).function.name).join(', '))}`
        )

        // Execute each tool call and create tool message responses
        const toolMessages: ChatCompletionToolMessageParam[] =
          assistantMessage.tool_calls.map((tc) => {
            const result = executeTool(tc as ToolCallInput)
            return {
              role: 'tool' as const,
              tool_call_id: result.tool_call_id,
              content: String(result.result),
            }
          })

        // Add the tool results to the conversation history
        messages.push(...toolMessages)

        // Continue the loop to get another response from OpenAI
        continue
      }

      // Log the final response and return it
      logger.info('LLMRuntime', `Final response received`, {
        length: assistantMessage.content?.length ?? 0,
      })

      return assistantMessage.content ?? ''
    }
  }
}
