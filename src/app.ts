import { loadTools, getTool, getAvailableToolNames } from './tools/tool-registry.ts'

/**
 * Facade for the conversion/tool engine.
 * Initializes tool discovery and provides a simple API for direct tool execution.
 */
export class ConversionEngine {
  static async init(): Promise<void> {
    await loadTools()
  }

  static convert(type: string, value: number, from: string, to: string): number {
    // Converter tools are registered as "convertDistance", "convertWeight", etc.
    const name = `convert${type.charAt(0).toUpperCase()}${type.slice(1)}`
    const tool = getTool(name)
    if (!tool) {
      throw new Error(
        `Unknown converter: ${type}. Available: ${getAvailableToolNames().join(', ')}`
      )
    }
    const result = tool.execute(JSON.stringify({ value, from, to }))
    if (typeof result !== 'number') {
      throw new Error(`Conversion failed: ${result}`)
    }
    return result
  }

  static getAvailableTypes(): string[] {
    return getAvailableToolNames()
      .filter((name) => name.startsWith('convert'))
      .map((name) => name.replace('convert', '').toLowerCase())
  }
}
