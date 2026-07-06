import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles speed unit conversions using meters per second as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertSpeed extends RatioConverter {
  static readonly toolDescription = 'Convert between speed units.'
  protected static readonly FACTORS = {
    'm/s': 1,
    'km/h': 0.27777777777778,
    mph: 0.44704,
    kn: 0.51444444444444,
  }
}
