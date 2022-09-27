import { Backend } from './backend/Backend'
import { cosmiconfig } from 'cosmiconfig'
import * as t from 'typed-validators'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'

export type AstxConfig = {
  parser?:
    | 'babel'
    | 'babel/auto'
    | 'recast/babel'
    | 'recast/babel/auto'
    | Backend
  parserOptions?: Record<string, any>
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
    },
  })
)

export const astxCosmiconfig = cosmiconfig('astx', {
  transform: (result: CosmiconfigResult): CosmiconfigResult =>
    result
      ? {
          ...result,
          config: AstxConfigType.assert(result.config || {}),
        }
      : null,
})
