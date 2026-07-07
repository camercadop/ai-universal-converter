import { BaseConverter } from './base/base-converter.ts'

/**
 * Handles temperature unit conversions using Kelvin as the intermediate unit.
 * Unlike ratio-based converters, temperature requires formula-based conversion.
 *
 * @extends BaseConverter
 */
export class ConvertTemperature extends BaseConverter {
  static readonly toolDescription = 'Convert between temperature units.'
  static readonly keywords = ['celsius', 'fahrenheit', 'kelvin', 'degree', 'hot', 'cold', 'warm']
  private static readonly UNITS = ['c', 'f', 'k'] as const

  static units(): string[] {
    return [...this.UNITS]
  }

  /**
   * Converts a temperature value from one unit to another.
   *
   * @param {number} value - The numeric value to convert.
   * @param {string} from - The source unit (c, f, k).
   * @param {string} to - The target unit (c, f, k).
   * @returns {number} The converted value rounded to 5 decimal places.
   * @throws {Error} If value or units are invalid.
   */
  static convert(value: number, from: string, to: string): number {
    this.validateValue(value)
    this.validateUnit(from, this.UNITS as unknown as string[])
    this.validateUnit(to, this.UNITS as unknown as string[])

    const fromUnit = from.toLowerCase() as 'c' | 'f' | 'k'
    const toUnit = to.toLowerCase() as 'c' | 'f' | 'k'

    let kelvin: number
    switch (fromUnit) {
      case 'c':
        kelvin = value + 273.15
        break
      case 'f':
        kelvin = ((value - 32) * 5) / 9 + 273.15
        break
      case 'k':
        kelvin = value
        break
    }

    let result: number
    switch (toUnit) {
      case 'c':
        result = kelvin - 273.15
        break
      case 'f':
        result = ((kelvin - 273.15) * 9) / 5 + 32
        break
      case 'k':
        result = kelvin
        break
    }

    return Math.round(result * 100_000) / 100_000
  }
}
