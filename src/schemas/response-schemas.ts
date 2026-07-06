import { z } from 'zod'

export const ConversionResponseSchema = z.object({
  from: z.object({
    value: z.number(),
    unit: z.string(),
  }),
  to: z.object({
    value: z.number(),
    unit: z.string(),
  }),
  explanation: z.string(),
})

export type ConversionResponse = z.infer<typeof ConversionResponseSchema>
