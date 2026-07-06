/**
 * CLI entry point for the AI Universal Converter.
 *
 * @module main
 */

import { createInterface } from 'readline'
import chalk from 'chalk'
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
  rl.question(`\n${chalk.blue.bold('You')}: `, async (input) => {
    if (!input || input === 'exit') return rl.close()

    if (input === 'reset') {
      agent.resetSession()
      console.log(`\n${chalk.yellow.bold('Session reset.')}`)
      return prompt()
    }

    try {
      const response = await agent.ask(input)
      console.log(`\n${chalk.green.bold('Assistant')}: ${response}`)
    } catch (err) {
      console.error(`\n${chalk.red.bold('Error')}: ${(err as Error).message}`)
    }
    prompt()
  })

console.log(
  chalk.cyan.bold('\nAI Universal Converter') +
    chalk.dim(' (type "exit" to quit, "reset" to clear session)')
)
prompt()
