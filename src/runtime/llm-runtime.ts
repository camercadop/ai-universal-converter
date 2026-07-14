import 'dotenv/config'
import OpenAI from 'openai'
import chalk from 'chalk'
import type { ChatCompletionToolMessageParam } from 'openai/resources/chat/completions'
import { zodResponseFormat } from 'openai/helpers/zod'
import type { z } from 'zod'
import {
  buildToolSchemas,
  buildFilteredToolSchemas,
} from '../schemas/tool-schemas.ts'
import { executeTool, type ToolCallInput } from './tool-executor.ts'
import { ConversationManager } from './conversation-manager.ts'
import { ObservabilityManager } from './observability.ts'
import { logger } from '../logger.ts'

/**
 * Wraps the OpenAI Chat Completions API with tool-calling support,
 * conversational memory, parallel execution, caching, and observability.
 *
 * @class LLMRuntime
 */
export class LLMRuntime {
  /** @type {OpenAI} */
  private client: OpenAI
  /** @type {string} */
  private model: string
  /** @type {ConversationManager} */
  private conversation: ConversationManager
  /** @type {ObservabilityManager} */
  private observability: ObservabilityManager
  /** @type {boolean} */
  private enableToolFiltering: boolean

  /**
   * Creates an LLMRuntime instance.
   *
   * @param {string} systemPrompt - The system prompt defining assistant behavior.
   * @param {string} [model='gpt-4o-mini'] - The OpenAI model to use.
   */
  constructor(
    systemPrompt: string,
    model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  ) {
    this.client = new OpenAI()
    this.model = model
    this.conversation = new ConversationManager(systemPrompt, {
      model,
    })
    this.observability = new ObservabilityManager()
    this.enableToolFiltering = process.env.TOOL_FILTERING !== 'false'
  }

  /**
   * Sends a user message to OpenAI and resolves tool calls until a final response is produced.
   *
   * This method implements a conversation loop that:
   * 1. Adds the user message to the persistent conversation history
   * 2. Sends the full message history to OpenAI with filtered tool schemas
   * 3. Checks if the response contains tool calls
   * 4. If tool calls are present, executes them in parallel and adds results to the conversation
   * 5. Repeats until OpenAI provides a final text response without tool calls
   * 6. Returns the final assistant response
   *
   * Conversation history is maintained across calls, enabling context-aware responses.
   * All steps are traced via the ObservabilityManager for latency and token tracking.
   *
   * @param {string} userMessage - The user's natural language input.
   *
   * @returns {Promise<string>} The assistant's final text response.
   */
  async chat(userMessage: string): Promise<string> {
    this.observability.startTrace()

    logger.info('LLMRuntime', `User message received`, {
      length: userMessage.length,
    })
    logger.debug('LLMRuntime', `User prompt: ${chalk.white(userMessage)}`)

    this.conversation.addMessage({ role: 'user', content: userMessage })

    // Determine tool schemas — use keyword filtering to reduce token usage
    const tools = this.enableToolFiltering
      ? buildFilteredToolSchemas(userMessage)
      : buildToolSchemas()

    // Main conversation loop - continues until we get a final text response
    while (true) {
      // Log the request being sent to OpenAI for debugging
      logger.debug('LLMRuntime', `Sending request to OpenAI`, {
        model: this.model,
        messageCount: this.conversation.getMessages().length,
        toolCount: tools.length,
      })

      // Start observability step for this LLM round-trip
      const endLLMStep = this.observability.startStep('OpenAI Chat', 'llm_call')

      // Send the full conversation history to OpenAI with available tool schemas
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: this.conversation.getMessages(),
        tools,
      })

      // Extract the first choice from the response
      const choice = response.choices[0]!
      const assistantMessage = choice.message

      // Record token usage and end the LLM step trace
      this.observability.recordTokenUsage(response.usage ?? undefined)
      endLLMStep({ tokens: response.usage?.total_tokens })

      // Add the assistant's response to the conversation history
      this.conversation.addMessage(assistantMessage)

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

        // Execute all tool calls in parallel and create tool message responses
        const toolMessages: ChatCompletionToolMessageParam[] =
          await Promise.all(
            assistantMessage.tool_calls.map(async (tc) => {
              const result = executeTool(
                tc as ToolCallInput,
                this.observability
              )
              return {
                role: 'tool' as const,
                tool_call_id: result.tool_call_id,
                content: String(result.result),
              }
            })
          )

        // Add the tool results to the conversation history
        this.conversation.addMessages(toolMessages)

        // Continue the loop to get another response from OpenAI
        continue
      }

      // Log the final response and return it
      logger.info('LLMRuntime', `Final response received`, {
        length: assistantMessage.content?.length ?? 0,
      })

      this.observability.endTrace()
      return assistantMessage.content ?? ''
    }
  }

  /**
   * Sends a user message and returns a structured, schema-validated response.
   *
   * Uses OpenAI's response_format with a Zod schema to enforce deterministic JSON output.
   * Tool calls are resolved in parallel before requesting the structured final response.
   *
   * @param {string} userMessage - The user's natural language input.
   * @param {T} schema - A Zod object schema defining the expected response shape.
   * @param {string} name - A name for the response format (used by OpenAI).
   *
   * @returns {Promise<z.infer<T>>} The parsed and validated response object.
   */
  async structuredChat<T extends z.ZodType>(
    userMessage: string,
    schema: T,
    name: string
  ): Promise<z.infer<T>> {
    this.observability.startTrace()
    logger.info('LLMRuntime', `Structured chat requested`, { name })

    this.conversation.addMessage({ role: 'user', content: userMessage })

    const tools = this.enableToolFiltering
      ? buildFilteredToolSchemas(userMessage)
      : buildToolSchemas()

    // Resolve tool calls first (same loop as chat, with parallel execution)
    while (true) {
      const endLLMStep = this.observability.startStep('OpenAI Chat', 'llm_call')

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: this.conversation.getMessages(),
        tools,
      })

      const choice = response.choices[0]!
      const assistantMessage = choice.message

      this.observability.recordTokenUsage(response.usage ?? undefined)
      endLLMStep({ tokens: response.usage?.total_tokens })

      this.conversation.addMessage(assistantMessage)

      if (
        choice.finish_reason === 'tool_calls' &&
        assistantMessage.tool_calls
      ) {
        const toolMessages: ChatCompletionToolMessageParam[] =
          await Promise.all(
            assistantMessage.tool_calls.map(async (tc) => {
              const result = executeTool(
                tc as ToolCallInput,
                this.observability
              )
              return {
                role: 'tool' as const,
                tool_call_id: result.tool_call_id,
                content: String(result.result),
              }
            })
          )
        this.conversation.addMessages(toolMessages)
        continue
      }

      break
    }

    // Request structured response
    const endStructuredStep = this.observability.startStep(
      'OpenAI Structured',
      'llm_call'
    )

    const structured = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        ...this.conversation.getMessages(),
        {
          role: 'user',
          content:
            'Respond with the structured JSON output for the conversion result.',
        },
      ],
      response_format: zodResponseFormat(schema, name),
    })

    this.observability.recordTokenUsage(structured.usage ?? undefined)
    endStructuredStep({ tokens: structured.usage?.total_tokens })

    const content = structured.choices[0]!.message.content ?? '{}'
    const parsed = schema.parse(JSON.parse(content))

    logger.info('LLMRuntime', `Structured response validated`, { name })
    this.observability.endTrace()
    return parsed
  }

  /**
   * Returns aggregated tool statistics from the observability manager.
   *
   * @returns {Map<string, ToolStats>} Per-tool metrics (call count, avg latency, cache hits, failures).
   */
  getToolStats() {
    return this.observability.getToolStats()
  }

  /**
   * Resets the conversation history, starting a new session.
   *
   * @returns {void}
   */
  resetSession(systemPrompt: string): void {
    this.conversation.clear(systemPrompt)
  }
}
