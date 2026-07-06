import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles volume unit conversions using cubic meter as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertVolume extends RatioConverter {
  static readonly toolDescription = 'Convert between volume units.'
  protected static readonly FACTORS = {
    ml: 1e-6,
    l: 0.001,
    m3: 1,
    'us-gal': 0.003785411784,
    'uk-gal': 0.00454609,
    'fl-oz': 2.95735295625e-5,
    cup: 0.0002365882365,
  }
}
