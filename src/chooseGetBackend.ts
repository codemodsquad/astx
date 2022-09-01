import getBabelBackend from './babel/getBabelBackend'
import { GetBackend } from './backend/Backend'
import getRecastBackend from './recast/getRecastBackend'

export default function chooseGetBackend(parser: string): GetBackend {
  switch (parser) {
    case 'babel':
      return getBabelBackend
    case 'recast/babel':
      return getRecastBackend(getBabelBackend)
    default:
      throw new Error(`unknown parser: ${parser}`)
  }
}
