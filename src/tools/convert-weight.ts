import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles weight unit conversions using kilogram as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertWeight extends RatioConverter {
  /** @type {Record<string, number>} Conversion factors relative to kilograms. */
  protected static readonly FACTORS = {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    oz: 0.0283495,
    lb: 0.453592,
    ton: 1000,
  }
}
