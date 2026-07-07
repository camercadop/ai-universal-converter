/**
 * Remembers previous tool results so the same conversion or calculation
 * doesn't need to run twice. Evicts the oldest entry when full.
 *
 * @class ToolCache
 */
export class ToolCache {
  private cache = new Map<string, number | string>()
  private maxSize: number

  /**
   * @param {number} [maxSize=256] - How many results to keep before discarding old ones.
   */
  constructor(maxSize = 256) {
    this.maxSize = maxSize
  }

  /** Builds a unique key from the tool name and its arguments. */
  private buildKey(name: string, rawArgs: string): string {
    try {
      const sorted = JSON.stringify(JSON.parse(rawArgs), Object.keys(JSON.parse(rawArgs)).sort())
      return `${name}:${sorted}`
    } catch {
      return `${name}:${rawArgs}`
    }
  }

  /**
   * Checks if we already have a stored result for this tool call.
   *
   * @param {string} name - The tool name.
   * @param {string} rawArgs - The arguments as a JSON string.
   */
  get(name: string, rawArgs: string): { hit: boolean; result?: number | string } {
    const key = this.buildKey(name, rawArgs)
    if (this.cache.has(key)) {
      return { hit: true, result: this.cache.get(key)! }
    }
    return { hit: false }
  }

  /**
   * Saves a tool result so it can be reused next time.
   * Removes the oldest entry if the cache is full.
   */
  set(name: string, rawArgs: string, result: number | string): void {
    const key = this.buildKey(name, rawArgs)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value!
      this.cache.delete(firstKey)
    }
    this.cache.set(key, result)
  }

  get size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
  }
}
