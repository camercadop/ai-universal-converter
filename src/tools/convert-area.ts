import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles area unit conversions using square meter as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertArea extends RatioConverter {
  static readonly toolDescription = 'Convert between area units.'
  protected static readonly FACTORS = {
    mm2: 1e-6,
    cm2: 0.0001,
    m2: 1,
    km2: 1e6,
    in2: 0.00064516,
    ft2: 0.092903,
    yd2: 0.836127,
    acre: 4046.8564224,
    ha: 10000,
  }
}
