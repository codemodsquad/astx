import { Backend } from './backend/Backend'
import * as t from 'typed-validators'

export type AstxConfig = {
  parser?:
    | 'babel'
    | 'babel/auto'
    | 'recast/babel'
    | 'recast/babel/auto'
    | Backend
  parserOptions?: Record<string, any>
  workers?: number
}

export const AstxConfigType: t.TypeAlias<AstxConfig> = t.alias(
  'AstxConfig',
  t.object({
    optional: {
      parser: t.oneOf(
        t.string('babel'),
        t.string('babel/auto'),
        t.string('recast/babel'),
        t.string('recast/babel/auto'),
        t.instanceOf(() => Backend)
      ),

      parserOptions: t.record(t.string(), t.any()),
      workers: t.number(),
    },
  })
)
