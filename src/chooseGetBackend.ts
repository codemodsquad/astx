import getBabelAutoBackend from './babel/getBabelAutoBackend'
import getBabelBackend from './babel/getBabelBackend'
import { Backend, GetBackend } from './backend/Backend'
import getRecastBackend from './recast/getRecastBackend'

export default function chooseGetBackend(
  parser: string | Backend | null | undefined
): GetBackend {
  if (parser instanceof Backend) return async () => parser
  if (!parser) return getBabelAutoBackend
  if (parser.startsWith('recast/')) {
    const getWrappedBackend = chooseGetBackend(
      parser.substring('recast/'.length)
    )
    return getRecastBackend((file: string, options?: { [k in string]?: any }) =>
      getWrappedBackend(file, {
        ...options,
        tokens: true,
      })
    )
  }
  switch (parser) {
    case 'babel/auto':
      return getBabelAutoBackend
    case 'babel':
      return getBabelBackend
    default:
      throw new Error(`unknown parser: ${parser}`)
  }
}
