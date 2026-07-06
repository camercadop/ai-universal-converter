import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles time unit conversions using second as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertTime extends RatioConverter {
  static readonly toolDescription = 'Convert between time units.'
  protected static readonly FACTORS = {
    ms: 0.001,
    s: 1,
    min: 60,
    h: 3600,
    day: 86400,
  }
}
