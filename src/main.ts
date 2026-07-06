/**
 * CLI entry point for the AI Universal Converter.
 *
 * @module main
 */

import { createInterface } from 'readline'
import { ConverterAgent } from './agent/converter-agent.ts'

const agent = new ConverterAgent()
await agent.init()

const rl = createInterface({ input: process.stdin, output: process.stdout })

/**
 * Prompts the user for input and processes the conversion request.
 *
 * @returns {void}
 */
const prompt = () =>
  rl.question('\nYou: ', async (input) => {
    if (!input || input === 'exit') return rl.close()

    try {
      const response = await agent.ask(input)
      console.log(`\nAssistant: ${response}`)
    } catch (err) {
      console.error('\nError:', (err as Error).message)
    }
    prompt()
  })

console.log('AI Universal Converter (type "exit" to quit)')
prompt()
