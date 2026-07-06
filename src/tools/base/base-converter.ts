/**
 * Base class providing shared validation utilities for all converters.
 *
 * @abstract
 */
export class BaseConverter {
  /** Override in subclasses to describe the tool for the LLM. */
  static readonly toolDescription: string = ''

  /** Returns the list of supported units. Override in non-ratio converters. */
  static units(): string[] {
    return []
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
