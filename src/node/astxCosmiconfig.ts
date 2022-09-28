import { cosmiconfig } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { AstxConfigType } from '../AstxConfig'

export const astxCosmiconfig = cosmiconfig('astx', {
  transform: (result: CosmiconfigResult): CosmiconfigResult =>
    result
      ? {
          ...result,
          config: AstxConfigType.assert(result.config || {}),
        }
      : null,
})
