import express from 'express'
import type { Request, Response } from 'express'
import type { ConverterAgent } from '../agent/converter-agent.ts'

/**
 * Creates and configures the Express application.
 *
 * @param {ConverterAgent} agent - The initialized converter agent instance.
 * @returns {express.Application} The configured Express app.
 */
export function createApp(agent: ConverterAgent): express.Application {
  const app = express()
  app.use(express.json())

  /**
   * GET /api/health — Service availability check.
   */
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
  })

  /**
   * POST /api/chat — Process a natural language conversion request.
   *
   * @body {{ message: string }} - The user's input message.
   * @returns {{ response: string }} - The AI-generated response.
   */
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { message } = req.body

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'A "message" string field is required.' })
      return
    }

    try {
      const response = await agent.ask(message)
      res.json({ response })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return app
}
