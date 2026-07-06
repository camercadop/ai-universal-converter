import type { FunctionDefinition } from 'openai/resources/shared'
import { Tool } from './tool.ts'

/**
 * Base class for all unit converters.
 * Provides shared validation and implements the Tool contract.
 *
 * @extends Tool
 * @abstract
 */
export class BaseConverter extends Tool {
  /** Override in subclasses to describe the tool for the LLM. */
  static readonly toolDescription: string = ''

  /** Returns the list of supported units. Override in subclasses. */
  static units(): string[] {
    return []
  }

  /** Performs the conversion. Override in subclasses. */
  static convert(value: number, from: string, to: string): number {
    throw new Error('convert() must be implemented by subclass')
  }

  /**
   * Generates the OpenAI function schema from the converter's metadata.
   * Subclasses inherit this automatically.
   */
  static get schema(): FunctionDefinition {
    // Derive name from class name: ConvertDistance -> convertDistance
    const className = this.name
    const name = className.charAt(0).toLowerCase() + className.slice(1)

    return {
      name,
      description: this.toolDescription,
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'The numeric value to convert.' },
          from: { type: 'string', enum: this.units(), description: 'Source unit.' },
          to: { type: 'string', enum: this.units(), description: 'Target unit.' },
        },
        required: ['value', 'from', 'to'],
      },
    }
  }

  /**
   * Executes the converter with raw JSON arguments from OpenAI.
   *
   * @param {string} rawArgs - JSON string containing { value, from, to }
   * @returns {number} The conversion result.
   */
  static execute(rawArgs: string): number {
    const { value, from, to } = JSON.parse(rawArgs) as { value: number; from: string; to: string }
    return this.convert(value, from, to)
  }

  protected static validateUnit(unit: string, validUnits: string[]): void {
    if (!validUnits.includes(unit.toLowerCase())) {
      throw new Error(
        `Invalid unit: ${unit}. Valid units are: ${validUnits.join(', ')}`
      )
    }
  }

  protected static validateValue(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid value: ${value}. Value must be a number.`)
    }
  }
}
