import { Backend } from '../backend/Backend'
import fs from 'fs-extra'
import chooseGetBackend from '../chooseGetBackend'
import Astx from '../Astx'

export default async function loadFile(
  file: string,
  {
    source,
    parser,
    parserOptions,
  }: {
    source?: string
    parser?: string | Backend
    parserOptions?: { [k in string]?: any }
  } = {}
): Promise<Astx> {
  if (!source) {
    source = await fs.readFile(file, 'utf8')
  }
  const backend: Backend = await chooseGetBackend(parser)(file, parserOptions)
  return new Astx(backend, [new backend.t.NodePath(backend.parse(source))])
}
