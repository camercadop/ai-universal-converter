/**
 * HTTP entry point for the AI Universal Converter.
 *
 * @module server
 */

import { ConverterAgent } from './agent/converter-agent.ts'
import { createApp } from './api/server.ts'
import { logger } from './logger.ts'

const PORT = Number(process.env.PORT) || 3000

const agent = new ConverterAgent()
await agent.init()

const app = createApp(agent)

app.listen(PORT, () => {
  logger.info('Server', `Listening on http://localhost:${PORT}`)
})
