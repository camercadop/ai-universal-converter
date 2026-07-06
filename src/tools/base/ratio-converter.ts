import { BaseConverter } from './base-converter.ts'

/** @typedef {Record<string, number>} ConversionFactors */
export type ConversionFactors = Record<string, number>

/**
 * Base class for converters that use ratio-based conversion logic.
 * Subclasses only need to define their FACTORS map.
 *
 * @extends BaseConverter
 * @abstract
 */
export class RatioConverter extends BaseConverter {
  protected static readonly FACTORS: ConversionFactors = {}

  static units(): string[] {
    return Object.keys(this.FACTORS)
  }

  /**
   * Converts a value from one unit to another using the subclass FACTORS.
   *
   * @param {number} value - The numeric value to convert.
   * @param {string} from - The source unit.
   * @param {string} to - The target unit.
   * @returns {number} The converted value rounded to 5 decimal places.
   * @throws {Error} If value or units are invalid.
   */
  static convert(value: number, from: string, to: string): number {
    const { FACTORS } = this
    const units = Object.keys(FACTORS)

    this.validateValue(value)
    this.validateUnit(from, units)
    this.validateUnit(to, units)

    const result =
      (value * FACTORS[from.toLowerCase()]!) / FACTORS[to.toLowerCase()]!
    return Math.round(result * 100_000) / 100_000
  }
}
