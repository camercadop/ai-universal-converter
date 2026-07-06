import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles energy unit conversions using joule as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertEnergy extends RatioConverter {
  static readonly toolDescription = 'Convert between energy units.'
  protected static readonly FACTORS = {
    j: 1,
    kj: 1000,
    cal: 4.184,
    kcal: 4184,
    wh: 3600,
    kwh: 3_600_000,
  }
}
