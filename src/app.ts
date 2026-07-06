import { loadConverters, getConverter, getAvailableConverters } from './tools/tool-registry.ts'

export class ConversionEngine {
  static async init(): Promise<void> {
    await loadConverters()
  }

  static convert(type: string, value: number, from: string, to: string): number {
    const converter = getConverter(type)
    if (!converter) {
      throw new Error(
        `Unknown converter: ${type}. Available: ${getAvailableConverters().join(', ')}`
      )
    }
    return converter.convert(value, from, to)
  }

  static getAvailableTypes(): string[] {
    return getAvailableConverters()
  }
}

export { getConverter, getAvailableConverters }
