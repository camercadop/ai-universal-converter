import { RatioConverter } from './base/ratio-converter.ts'

/**
 * Handles distance unit conversions using meter as the base unit.
 *
 * @extends RatioConverter
 */
export class ConvertDistance extends RatioConverter {
  /** @type {Record<string, number>} Conversion factors relative to meters. */
  protected static readonly FACTORS = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  }
}
