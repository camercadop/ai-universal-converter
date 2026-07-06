import type { FunctionDefinition } from 'openai/resources/shared'
import { Tool } from './base/tool.ts'

/**
 * General-purpose arithmetic calculator.
 * Safely evaluates math expressions using the Function constructor
 * restricted to numeric operations only.
 *
 * @extends Tool
 */
export class Calculate extends Tool {
  static readonly schema: FunctionDefinition = {
    name: 'calculate',
    description:
      'Evaluates a mathematical expression and returns the numeric result. Supports +, -, *, /, parentheses, and common Math functions (Math.round, Math.ceil, Math.floor, Math.pow, Math.sqrt).',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'A mathematical expression to evaluate (e.g. "350 / 100 * 8").',
        },
      },
      required: ['expression'],
    },
  }

  /**
   * Evaluates a math expression string.
   *
   * @param {string} rawArgs - JSON string containing { expression: string }
   * @returns {number} The result of the expression.
   * @throws {Error} If the expression is invalid or contains disallowed content.
   */
  static execute(rawArgs: string): number {
    const { expression } = JSON.parse(rawArgs) as { expression: string }

    // Allow only safe characters: digits, operators, parentheses, dots, spaces, and "Math."
    const sanitized = expression.replace(/Math\.\w+/g, '__MATH__')
    if (/[^0-9+\-*/()._ \t]/.test(sanitized)) {
      throw new Error(`Invalid expression: ${expression}`)
    }

    try {
      const result = new Function(`"use strict"; return (${expression})`)()
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error(`Expression did not produce a finite number: ${expression}`)
      }
      return Math.round(result * 1_000_000_000) / 1_000_000_000
    } catch {
      throw new Error(`Failed to evaluate: ${expression}`)
    }
  }
}
