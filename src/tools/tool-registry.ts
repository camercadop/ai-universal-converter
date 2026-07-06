import { readdirSync } from 'fs'
import { join, basename } from 'path'

type Converter = {
  convert(value: number, from: string, to: string): number
}

const converters = new Map<string, Converter>()

/**
 * Auto-discovers and registers all convert-* modules in the tools directory.
 */
async function loadConverters(): Promise<void> {
  const toolsDir = new URL('.', import.meta.url).pathname
  const files = readdirSync(toolsDir).filter(
    (f) => f.startsWith('convert-') && f.endsWith('.ts')
  )

  for (const file of files) {
    const name = basename(file, '.ts').replace('convert-', '')
    const module = await import(join(toolsDir, file))
    const exportedClass = Object.values(module).find(
      (exp): exp is Converter =>
        typeof exp === 'function' && 'convert' in (exp as any)
    ) as Converter | undefined

    if (exportedClass) {
      converters.set(name, exportedClass)
    }
  }
}

/**
 * Returns a registered converter by name.
 *
 * @param {string} name - The converter name (e.g. "distance", "weight").
 *
 * @returns {Converter | undefined}
 */
function getConverter(name: string): Converter | undefined {
  return converters.get(name)
}

/**
 * Returns all registered converter names.
 *
 * @returns {string[]}
 */
function getAvailableConverters(): string[] {
  return [...converters.keys()]
}

export { loadConverters, getConverter, getAvailableConverters }
export type { Converter }
