import { Backend } from './backend/Backend'
import z from 'zod'
import debug from 'debug'

export const debugConfig = debug('astx:config')

export const AstxConfigType = z.strictObject({
  parser: z
    .union([
      z.literal('babel'),
      z.literal('babel/auto'),
      z.literal('recast/babel'),
      z.literal('recast/babel/auto'),
      z.instanceof(Backend),
    ])
    .optional(),
  parserOptions: z.record(z.string(), z.any()).optional(),
  workers: z.number().optional(),
  prettier: z.boolean().optional(),
  preferSimpleReplacement: z.boolean().optional(),
})

export type AstxConfig = z.output<typeof AstxConfigType>
