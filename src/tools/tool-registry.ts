import { readdirSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'
import type { FunctionDefinition } from 'openai/resources/shared'
import { logger } from '../logger.ts'

/** Static interface that any discoverable tool must satisfy. */
type ToolClass = {
  readonly schema: FunctionDefinition
  execute(rawArgs: string): number | string
}

const tools = new Map<string, ToolClass>()

/**
 * Auto-discovers and registers all Tool subclasses in the tools directory.
 *
 * Scans all `.ts` files (excluding base/ and this file) for exported classes
 * that have a `schema` and `execute` static method — the Tool contract.
 */
async function loadTools(): Promise<void> {
  const toolsDir = new URL('.', import.meta.url).pathname
  const files = readdirSync(toolsDir).filter(
    (f) => f.endsWith('.ts') && f !== 'tool-registry.ts'
  )

  logger.info('ToolRegistry', `Discovering tools in ${chalk.dim(toolsDir)}`, { fileCount: files.length })

  for (const file of files) {
    const module = await import(join(toolsDir, file))

    for (const exp of Object.values(module)) {
      if (isToolClass(exp)) {
        const tool = exp as ToolClass
        tools.set(tool.schema.name, tool)
        logger.debug('ToolRegistry', `Registered tool: ${chalk.cyan(tool.schema.name)}`)
      }
    }
  }
}

/** Checks if an export satisfies the Tool contract (schema + execute). */
function isToolClass(value: unknown): boolean {
  return (
    typeof value === 'function' &&
    'schema' in value &&
    'execute' in value &&
    typeof (value as any).schema === 'object' &&
    typeof (value as any).schema.name === 'string' &&
    typeof (value as any).execute === 'function'
  )
}

function getTool(name: string): ToolClass | undefined {
  return tools.get(name)
}

function getAllTools(): Map<string, ToolClass> {
  return tools
}

function getAvailableToolNames(): string[] {
  return [...tools.keys()]
}

/** @deprecated Use loadTools() instead. */
async function loadConverters(): Promise<void> {
  return loadTools()
}

export { loadTools, loadConverters, getTool, getAllTools, getAvailableToolNames }
export type { ToolClass }
