import { readdirSync } from 'fs'
import { join, basename } from 'path'
import chalk from 'chalk'
import type { BaseConverter } from './base/base-converter.ts'
import { logger } from '../logger.ts'

type ConverterClass = typeof BaseConverter & {
  convert(value: number, from: string, to: string): number
  units(): string[]
  readonly toolDescription: string
}

const converters = new Map<string, ConverterClass>()

/**
 * Auto-discovers and registers all convert-* modules in the tools directory.
 */
async function loadConverters(): Promise<void> {
  const toolsDir = new URL('.', import.meta.url).pathname
  const files = readdirSync(toolsDir).filter(
    (f) => f.startsWith('convert-') && f.endsWith('.ts')
  )

  logger.info('ToolRegistry', `Discovering converters in ${chalk.dim(toolsDir)}`, { fileCount: files.length })

  for (const file of files) {
    const name = basename(file, '.ts').replace('convert-', '')
    const module = await import(join(toolsDir, file))
    const exportedClass = Object.values(module).find(
      (exp): exp is ConverterClass =>
        typeof exp === 'function' && 'convert' in (exp as any)
    )

    if (exportedClass) {
      converters.set(name, exportedClass)
      logger.debug('ToolRegistry', `Registered converter: ${chalk.cyan(name)}`)
    }
  }
}

function getConverter(name: string): ConverterClass | undefined {
  return converters.get(name)
}

function getAvailableConverters(): string[] {
  return [...converters.keys()]
}

function getAllConverters(): Map<string, ConverterClass> {
  return converters
}

export { loadConverters, getConverter, getAvailableConverters, getAllConverters }
export type { ConverterClass }
