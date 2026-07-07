import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles digital storage unit conversions using byte as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertStorage extends RatioConverter {
  static readonly toolDescription = 'Convert between digital storage units.'
  static readonly keywords = ['byte', 'kb', 'mb', 'gb', 'tb', 'megabyte', 'gigabyte', 'terabyte', 'data', 'disk', 'file size']
  protected static readonly FACTORS = {
    b: 1,
    kb: 1024,
    mb: 1_048_576,
    gb: 1_073_741_824,
    tb: 1_099_511_627_776,
  }
}
