/**
 * Base class providing shared validation utilities for all converters.
 *
 * @abstract
 */
export class BaseConverter {
  /**
   * Validates if the provided unit is among the valid units.
   *
   * @param {string} unit - The unit to validate.
   * @param {string[]} validUnits - List of accepted units.
   * @throws {Error} If the unit is not valid.
   */
  protected static validateUnit(unit: string, validUnits: string[]): void {
    if (!validUnits.includes(unit.toLowerCase())) {
      throw new Error(
        `Invalid unit: ${unit}. Valid units are: ${validUnits.join(', ')}`
      )
    }
  }

  /**
   * Validates if the provided value is a valid number.
   *
   * @param {number} value - The value to validate.
   * @throws {Error} If the value is not a number or is NaN.
   */
  protected static validateValue(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid value: ${value}. Value must be a number.`)
    }
  }
}
