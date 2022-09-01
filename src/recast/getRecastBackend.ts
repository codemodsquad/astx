import { GetBackend } from '../backend/Backend'
import RecastBackend from './RecastBackend'

export default function getRecastBackend(getWrapped: GetBackend): GetBackend {
  return async function getRecastBackend(
    file: string,
    options?: { [k in string]?: any }
  ): Promise<RecastBackend> {
    return new RecastBackend({ wrapped: await getWrapped(file, options) })
  }
}
