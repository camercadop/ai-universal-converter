import 'dotenv/config'
import { consola } from 'consola'

consola.level = process.env.LOG_LEVEL === 'debug' ? 4 : 3

export const logger = {
  debug: (ctx: string, msg: string, data?: unknown) => consola.withTag(ctx).debug(msg, data ?? ''),
  info: (ctx: string, msg: string, data?: unknown) => consola.withTag(ctx).info(msg, data ?? ''),
  warn: (ctx: string, msg: string, data?: unknown) => consola.withTag(ctx).warn(msg, data ?? ''),
  error: (ctx: string, msg: string, data?: unknown) => consola.withTag(ctx).error(msg, data ?? ''),
}
