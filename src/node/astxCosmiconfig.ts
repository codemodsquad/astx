import { cosmiconfig } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { AstxConfigType, debugConfig } from '../AstxConfig'

export const astxCosmiconfig = cosmiconfig('astx', {
  transform: (result: CosmiconfigResult): CosmiconfigResult => {
    debugConfig('astxCosmiconfig', 'raw result', result)
    debugConfig('astxCosmiconfig', 'raw config', result?.config)
    if (result) {
      return {
        ...result,
        config: AstxConfigType.assert(result.config || {}),
      }
    }
    return null
  },
})
