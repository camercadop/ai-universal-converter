import 'dotenv/config'
import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from 'openai/resources/chat/completions'
import { buildToolSchemas } from '../schemas/tool-schemas.ts'
import { executeTool, type ToolCallInput } from './tool-executor.ts'

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
   * @param {string} userMessage - The user's natural language input.
   *
   * @returns {Promise<string>} The assistant's final text response.
   */
  async chat(userMessage: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]

    // The model may chain multiple sequential tool calls before producing a final text
    // response — each iteration re-submits accumulated context so the model can decide
    // whether it needs another tool call or is ready to answer.
    while (true) {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: buildToolSchemas(),
      })

      const choice = response.choices[0]!
      const assistantMessage = choice.message

      messages.push(assistantMessage)

      if (
        choice.finish_reason === 'tool_calls' &&
        assistantMessage.tool_calls
      ) {
        const toolMessages: ChatCompletionToolMessageParam[] =
          assistantMessage.tool_calls.map((tc) => {
            const result = executeTool(tc as ToolCallInput)
            return {
              role: 'tool' as const,
              tool_call_id: result.tool_call_id,
              content: String(result.result),
            }
          })
        messages.push(...toolMessages)
        continue
      }

      return assistantMessage.content ?? ''
    }
  }
}
